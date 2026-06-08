#!/usr/bin/env python3
"""Extract Fenabrave registration rankings from a monthly PDF.

The script intentionally avoids OCR. It uses pdfplumber text extraction first
and parses the known table layouts with regexes that preserve brand/model text.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

import pdfplumber


DEFAULT_PDF = Path.home() / "Downloads" / "2026_05_02fenabrave.pdf"
DEFAULT_OUTPUT_DIR = Path("data") / "fenabrave"

PAGE_EMPLACAMENTOS_MAIO = 6
PAGE_EMPLACAMENTOS_ACUMULADO = 7
PAGE_MARCA_MAIO = 8
PAGE_MARCA_ACUMULADO = 9
PAGES_SEGMENTOS = range(11, 20)

RANK_RE = re.compile(r"^(\d+)º\s+(.+?)\s+([\d.]+)$")
DUAL_MODEL_RE = re.compile(r"^(\d+)º\s+(.+?)\s+([\d.]+)\s+(\d+)º\s+(.+?)\s+([\d.]+)$")
DUAL_BRAND_RE = re.compile(
    r"^(\d+)º\s+(.+?)\s+([\d.]+)\s+([\d,]+)%\s+"
    r"(\d+)º\s+(.+?)\s+([\d.]+)\s+([\d,]+)%$"
)
SINGLE_BRAND_RE = re.compile(r"^(\d+)º\s+(.+?)\s+([\d.]+)\s+([\d,]+)%$")
SEGMENT_ROW_RE = re.compile(r"^(\d+)º\s+(.+?)\s+([\d,]+)%$")
NUMBER_TOKEN_RE = re.compile(r"^(?:\d{1,3}(?:\.\d{3})+|\d+|0,00)$")

BOILERPLATE_PREFIXES = (
    "Ed.",
    "Informativo",
    "São Paulo",
    "Modelos mais emplacados",
    "Ranking dos emplacamentos",
    "Ranking por marca",
    "www.fenabrave.org.br",
)


def br_int(value: str) -> int:
    """Normalize Brazilian integer strings such as 10.523 and 0,00."""
    if value == "0,00":
        return 0
    return int(value.replace(".", ""))


def br_pct(value: str) -> float:
    """Normalize Brazilian percentage strings such as 18,43."""
    return float(value.replace(".", "").replace(",", "."))


def split_brand_model(value: str) -> tuple[str, str]:
    if "/" not in value:
        raise ValueError(f"Cannot split brand/model value: {value!r}")
    brand, model = value.split("/", 1)
    return brand.strip(), model.strip()


def write_csv(path: Path, rows: list[dict[str, Any]], fieldnames: list[str]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def write_json(path: Path, data: Any) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def extract_raw_text(pdf_path: Path) -> dict[str, str]:
    with pdfplumber.open(pdf_path) as pdf:
        return {
            str(index): page.extract_text(x_tolerance=1, y_tolerance=3) or ""
            for index, page in enumerate(pdf.pages, start=1)
        }


def parse_model_ranking_page(text: str, value_field: str) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for raw_line in text.splitlines():
        line = raw_line.strip()
        match = DUAL_MODEL_RE.match(line)
        if match:
            left_rank, left_name, left_value, right_rank, right_name, right_value = match.groups()
            for category, rank, name, value in (
                ("AUTOMÓVEIS", left_rank, left_name, left_value),
                ("COMERCIAIS LEVES", right_rank, right_name, right_value),
            ):
                brand, model = split_brand_model(name)
                rows.append(
                    {
                        "category": category,
                        "rank": int(rank),
                        "brand": brand,
                        "model": model,
                        value_field: br_int(value),
                    }
                )
            continue

        match = RANK_RE.match(line)
        if match and "/" in match.group(2):
            rank, name, value = match.groups()
            brand, model = split_brand_model(name)
            rows.append(
                {
                    "category": "AUTOMÓVEIS",
                    "rank": int(rank),
                    "brand": brand,
                    "model": model,
                    value_field: br_int(value),
                }
            )
    return rows


def parse_brand_ranking_page(text: str, value_field: str) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    combined = False
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if line == "AUTOMÓVEIS + COMERCIAIS LEVES":
            combined = True
            continue

        if not combined:
            match = DUAL_BRAND_RE.match(line)
            if not match:
                continue
            (
                left_rank,
                left_brand,
                left_value,
                left_share,
                right_rank,
                right_brand,
                right_value,
                right_share,
            ) = match.groups()
            for category, rank, brand, value, share in (
                ("AUTOMÓVEIS", left_rank, left_brand, left_value, left_share),
                ("COMERCIAIS LEVES", right_rank, right_brand, right_value, right_share),
            ):
                rows.append(
                    {
                        "category": category,
                        "rank": int(rank),
                        "brand": brand.strip(),
                        value_field: br_int(value),
                        "market_share_pct": br_pct(share),
                    }
                )
            continue

        match = SINGLE_BRAND_RE.match(line)
        if match:
            rank, brand, value, share = match.groups()
            rows.append(
                {
                    "category": "AUTOMÓVEIS + COMERCIAIS LEVES",
                    "rank": int(rank),
                    "brand": brand.strip(),
                    value_field: br_int(value),
                    "market_share_pct": br_pct(share),
                }
            )
    return rows


def is_segment_header(line: str) -> bool:
    if not line:
        return False
    if line in {"AUTOMÓVEIS", "COMERCIAIS LEVES"}:
        return False
    if line.startswith(("AU -", "CL -")):
        return False
    if any(line.startswith(prefix) for prefix in BOILERPLATE_PREFIXES):
        return False
    if re.match(r"^\d+º\s+", line):
        return False
    return True


def parse_segment_row(line: str, segment: str) -> dict[str, Any] | None:
    match = SEGMENT_ROW_RE.match(line)
    if not match:
        return None
    rank_raw, body, share_raw = match.groups()
    tokens = body.split()
    numeric_indexes = [
        index for index, token in enumerate(tokens)
        if token != "=" and NUMBER_TOKEN_RE.match(token)
    ]
    if len(numeric_indexes) < 3:
        return None

    value_indexes = numeric_indexes[-3:]
    value_tokens = [tokens[index] for index in value_indexes]
    name_tokens = tokens[: value_indexes[0]]
    name = " ".join(name_tokens)
    if "/" not in name:
        return None

    brand, model = split_brand_model(name)
    return {
        "segment": segment,
        "rank": int(rank_raw),
        "brand": brand,
        "model": model,
        "registrations_april_2026": br_int(value_tokens[0]),
        "registrations_may_2026": br_int(value_tokens[1]),
        "registrations_accumulated_2026": br_int(value_tokens[2]),
        "market_share_pct": br_pct(share_raw),
    }


def parse_segment_pages(raw_text: dict[str, str]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    current_segment: str | None = None
    for page_number in PAGES_SEGMENTOS:
        for raw_line in raw_text[str(page_number)].splitlines():
            line = raw_line.strip()
            if is_segment_header(line):
                current_segment = line
                continue
            if current_segment is None:
                continue
            row = parse_segment_row(line, current_segment)
            if row:
                rows.append(row)
    return rows


def assert_count(rows: list[dict[str, Any]], category: str, expected: int, label: str) -> None:
    count = sum(1 for row in rows if row["category"] == category)
    if count != expected:
        raise AssertionError(f"{label}: expected {expected} rows for {category}, got {count}")


def find_row(rows: list[dict[str, Any]], **criteria: Any) -> dict[str, Any]:
    for row in rows:
        if all(row.get(key) == value for key, value in criteria.items()):
            return row
    raise AssertionError(f"Row not found: {criteria}")


def validate_outputs(
    maio_rows: list[dict[str, Any]],
    acumulado_rows: list[dict[str, Any]],
    marca_acumulado_rows: list[dict[str, Any]],
) -> None:
    assert_count(maio_rows, "AUTOMÓVEIS", 50, "page 6")
    assert_count(maio_rows, "COMERCIAIS LEVES", 50, "page 6")
    assert_count(acumulado_rows, "AUTOMÓVEIS", 50, "page 7")
    assert_count(acumulado_rows, "COMERCIAIS LEVES", 50, "page 7")

    vw_polo = find_row(maio_rows, category="AUTOMÓVEIS", brand="VW", model="POLO")
    if vw_polo["registrations_month"] != 10523:
        raise AssertionError(f"VW/POLO Maio/2026 expected 10523, got {vw_polo['registrations_month']}")

    fiat_strada = find_row(maio_rows, category="COMERCIAIS LEVES", brand="FIAT", model="STRADA")
    if fiat_strada["registrations_month"] != 15395:
        raise AssertionError(
            f"FIAT/STRADA Maio/2026 expected 15395, got {fiat_strada['registrations_month']}"
        )

    fiat_total = find_row(
        marca_acumulado_rows,
        category="AUTOMÓVEIS + COMERCIAIS LEVES",
        brand="FIAT",
    )
    if fiat_total["registrations_accumulated"] != 221872:
        raise AssertionError(
            "FIAT acumulado marca total page 9 expected 221872, "
            f"got {fiat_total['registrations_accumulated']}"
        )


def write_dataset(output_dir: Path, name: str, rows: list[dict[str, Any]], fieldnames: list[str]) -> None:
    write_csv(output_dir / f"{name}.csv", rows, fieldnames)
    write_json(output_dir / f"{name}.json", rows)


def print_summary(files: dict[str, list[dict[str, Any]]]) -> None:
    print("Resumo de linhas extraídas:")
    for filename, rows in files.items():
        print(f"- {filename}: {len(rows)} linhas")
        if filename == "ranking_segmentos_modelos_2026.csv":
            counts = Counter(row["segment"] for row in rows)
            print(f"  segmentos: {len(counts)}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract Fenabrave rankings from PDF.")
    parser.add_argument("--pdf", type=Path, default=DEFAULT_PDF, help="Path to Fenabrave PDF.")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUTPUT_DIR, help="Output directory.")
    args = parser.parse_args()

    if not args.pdf.exists():
        raise FileNotFoundError(f"PDF not found: {args.pdf}")

    args.out.mkdir(parents=True, exist_ok=True)
    raw_text = extract_raw_text(args.pdf)
    write_json(args.out / "raw_text_by_page.json", raw_text)

    ranking_maio = parse_model_ranking_page(
        raw_text[str(PAGE_EMPLACAMENTOS_MAIO)],
        "registrations_month",
    )
    ranking_acumulado = parse_model_ranking_page(
        raw_text[str(PAGE_EMPLACAMENTOS_ACUMULADO)],
        "registrations_accumulated",
    )
    marca_maio = parse_brand_ranking_page(
        raw_text[str(PAGE_MARCA_MAIO)],
        "registrations_month",
    )
    marca_acumulado = parse_brand_ranking_page(
        raw_text[str(PAGE_MARCA_ACUMULADO)],
        "registrations_accumulated",
    )
    segmentos = parse_segment_pages(raw_text)

    validate_outputs(ranking_maio, ranking_acumulado, marca_acumulado)

    datasets = {
        "ranking_emplacamentos_maio_2026.csv": ranking_maio,
        "ranking_emplacamentos_acumulado_2026.csv": ranking_acumulado,
        "ranking_marca_maio_2026.csv": marca_maio,
        "ranking_marca_acumulado_2026.csv": marca_acumulado,
        "ranking_segmentos_modelos_2026.csv": segmentos,
    }

    write_dataset(
        args.out,
        "ranking_emplacamentos_maio_2026",
        ranking_maio,
        ["category", "rank", "brand", "model", "registrations_month"],
    )
    write_dataset(
        args.out,
        "ranking_emplacamentos_acumulado_2026",
        ranking_acumulado,
        ["category", "rank", "brand", "model", "registrations_accumulated"],
    )
    write_dataset(
        args.out,
        "ranking_marca_maio_2026",
        marca_maio,
        ["category", "rank", "brand", "registrations_month", "market_share_pct"],
    )
    write_dataset(
        args.out,
        "ranking_marca_acumulado_2026",
        marca_acumulado,
        ["category", "rank", "brand", "registrations_accumulated", "market_share_pct"],
    )
    write_dataset(
        args.out,
        "ranking_segmentos_modelos_2026",
        segmentos,
        [
            "segment",
            "rank",
            "brand",
            "model",
            "registrations_april_2026",
            "registrations_may_2026",
            "registrations_accumulated_2026",
            "market_share_pct",
        ],
    )

    print_summary(datasets)
    print("Validações OK.")


if __name__ == "__main__":
    main()
