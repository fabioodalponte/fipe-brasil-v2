-- Consumo Inmetro (PBE Veicular). Linhas extraídas dos PDFs anuais
-- (scripts/extract_pbev_pdf.py) e carregadas por scripts/load_pbev.ts,
-- que também popula o mapeamento veículo FIPE -> linha PBEV.

CREATE TABLE IF NOT EXISTS inmetro_pbev (
  id bigserial PRIMARY KEY,
  table_year integer NOT NULL,
  categoria text,
  marca text NOT NULL,
  modelo text NOT NULL,
  versao text,
  motor text,
  propulsao text,
  transmissao text,
  combustivel text,
  kml_etanol_cidade numeric,
  kml_etanol_estrada numeric,
  kml_gasolina_cidade numeric,
  kml_gasolina_estrada numeric,
  kml_eletrico_cidade numeric,
  kml_eletrico_estrada numeric,
  consumo_mj_km numeric,
  autonomia_eletrica_km numeric,
  classificacao_pbe text,
  classificacao_geral text,
  selo_conpet text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inmetro_pbev_year_marca_idx
  ON inmetro_pbev (table_year, marca);

CREATE TABLE IF NOT EXISTS vehicle_inmetro_pbev (
  vehicle_id bigint PRIMARY KEY REFERENCES vehicles (id) ON DELETE CASCADE,
  pbev_id bigint NOT NULL REFERENCES inmetro_pbev (id) ON DELETE CASCADE,
  match_score real NOT NULL,
  matched_at timestamptz NOT NULL DEFAULT now()
);
