#!/usr/bin/env python3
"""Extract Inmetro PBE Veicular (PBEV) consumption tables from yearly PDFs.

Follows the same approach as extract_fenabrave_pdf.py: pdfplumber table
extraction, no OCR. Each yearly PDF is a bordered grid; `extract_tables`
returns clean rows. Layouts: 2022 has 24 columns, 2023+ has 28 (adds NOx
breakdown and electric-mode autonomy).

Usage:
    python3 scripts/extract_pbev_pdf.py --pdf-dir /tmp/pbev --output-dir data/pbev
"""

from __future__ import annotations

import argparse
import csv
import re
from pathlib import Path

import pdfplumber

FIELDS = [
    "table_year",
    "categoria",
    "marca",
    "modelo",
    "versao",
    "motor",
    "propulsao",
    "transmissao",
    "combustivel",
    "kml_etanol_cidade",
    "kml_etanol_estrada",
    "kml_gasolina_cidade",
    "kml_gasolina_estrada",
    "kml_eletrico_cidade",
    "kml_eletrico_estrada",
    "consumo_mj_km",
    "autonomia_eletrica_km",
    "classificacao_pbe",
    "classificacao_geral",
    "selo_conpet",
]

# Column index maps per layout (key: número de colunas da tabela extraída).
LAYOUTS = {
    28: {
        "categoria": 0, "marca": 1, "modelo": 2, "versao": 3, "motor": 4,
        "propulsao": 5, "transmissao": 6, "combustivel": 9,
        "kml_etanol_cidade": 17, "kml_etanol_estrada": 18,
        "kml_gasolina_cidade": 19, "kml_gasolina_estrada": 20,
        "kml_eletrico_cidade": 21, "kml_eletrico_estrada": 22,
        "consumo_mj_km": 23, "autonomia_eletrica_km": 24,
        "classificacao_pbe": 25, "classificacao_geral": 26, "selo_conpet": 27,
    },
    24: {
        "categoria": 0, "marca": 1, "modelo": 2, "versao": 3, "motor": 4,
        "propulsao": 5, "transmissao": 6, "combustivel": 9,
        "kml_etanol_cidade": 16, "kml_etanol_estrada": 17,
        "kml_gasolina_cidade": 18, "kml_gasolina_estrada": 19,
        "kml_eletrico_cidade": None, "kml_eletrico_estrada": None,
        "consumo_mj_km": 20, "autonomia_eletrica_km": None,
        "classificacao_pbe": 21, "classificacao_geral": 22, "selo_conpet": 23,
    },
}

NUMBER_RE = re.compile(r"^\d+(?:[.,]\d+)?$")
PROPULSAO_VALUES = {"combustão", "combustao", "híbrido", "hibrido", "elétrico", "eletrico", "plug-in", "híbrido plug-in", "hibrido plug-in"}


def clean(value: str | None) -> str:
    if not value:
        return ""
    return re.sub(r"\s+", " ", value).strip()


def number(value: str | None) -> str:
    """Normalize numeric cell; '\\', 'ND', '-' and blanks become empty."""
    text = clean(value).replace(",", ".")
    return text if NUMBER_RE.match(text) else ""


def extract_year(pdf_path: Path, year: int, writer: csv.DictWriter) -> int:
    rows_written = 0
    with pdfplumber.open(pdf_path) as pdf:
        last_categoria = ""
        for page in pdf.pages:
            for table in page.extract_tables():
                if not table or len(table[0]) not in LAYOUTS:
                    continue
                layout = LAYOUTS[len(table[0])]
                for raw in table:
                    marca = clean(raw[layout["marca"]])
                    modelo = clean(raw[layout["modelo"]])
                    propulsao = clean(raw[layout["propulsao"]])
                    # Header/legend rows have multi-line propulsion text or no brand.
                    if not marca or not modelo or propulsao.lower() not in PROPULSAO_VALUES:
                        continue
                    categoria = clean(raw[layout["categoria"]]) or last_categoria
                    last_categoria = categoria

                    # No layout de 2022, elétricos publicam km/le nas colunas de
                    # gasolina; realoca para as colunas de elétrico.
                    kml_gas_cid = number(raw[layout["kml_gasolina_cidade"]])
                    kml_gas_est = number(raw[layout["kml_gasolina_estrada"]])
                    kml_ele_cid = number(raw[layout["kml_eletrico_cidade"]]) if layout["kml_eletrico_cidade"] is not None else ""
                    kml_ele_est = number(raw[layout["kml_eletrico_estrada"]]) if layout["kml_eletrico_estrada"] is not None else ""
                    if propulsao.lower().startswith("elétrico") or propulsao.lower().startswith("eletrico"):
                        if not kml_ele_cid and kml_gas_cid:
                            kml_ele_cid, kml_gas_cid = kml_gas_cid, ""
                        if not kml_ele_est and kml_gas_est:
                            kml_ele_est, kml_gas_est = kml_gas_est, ""

                    writer.writerow({
                        "table_year": year,
                        "categoria": categoria,
                        "marca": marca,
                        "modelo": modelo,
                        "versao": clean(raw[layout["versao"]]),
                        "motor": clean(raw[layout["motor"]]),
                        "propulsao": propulsao,
                        "transmissao": clean(raw[layout["transmissao"]]),
                        "combustivel": clean(raw[layout["combustivel"]]),
                        "kml_etanol_cidade": number(raw[layout["kml_etanol_cidade"]]),
                        "kml_etanol_estrada": number(raw[layout["kml_etanol_estrada"]]),
                        "kml_gasolina_cidade": kml_gas_cid,
                        "kml_gasolina_estrada": kml_gas_est,
                        "kml_eletrico_cidade": kml_ele_cid,
                        "kml_eletrico_estrada": kml_ele_est,
                        "consumo_mj_km": number(raw[layout["consumo_mj_km"]]),
                        "autonomia_eletrica_km": number(raw[layout["autonomia_eletrica_km"]]) if layout["autonomia_eletrica_km"] is not None else "",
                        "classificacao_pbe": clean(raw[layout["classificacao_pbe"]]),
                        "classificacao_geral": clean(raw[layout["classificacao_geral"]]),
                        "selo_conpet": clean(raw[layout["selo_conpet"]]),
                    })
                    rows_written += 1
    return rows_written


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pdf-dir", type=Path, default=Path("/tmp/pbev"))
    parser.add_argument("--output-dir", type=Path, default=Path("data") / "pbev")
    args = parser.parse_args()

    args.output_dir.mkdir(parents=True, exist_ok=True)
    out_path = args.output_dir / "pbev_consumption.csv"
    total = 0
    with out_path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=FIELDS)
        writer.writeheader()
        for pdf_path in sorted(args.pdf_dir.glob("pbev-*.pdf")):
            year = int(re.search(r"(\d{4})", pdf_path.stem).group(1))
            count = extract_year(pdf_path, year, writer)
            print(f"{pdf_path.name}: {count} linhas")
            total += count
    print(f"total: {total} linhas -> {out_path}")


if __name__ == "__main__":
    main()
