CREATE EXTENSION IF NOT EXISTS unaccent;

DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_trgm;
EXCEPTION
  WHEN insufficient_privilege OR undefined_file THEN
    RAISE NOTICE 'pg_trgm unavailable; public.fenabrave_similarity will use deterministic fallback.';
END
$$;

CREATE OR REPLACE FUNCTION public.fenabrave_normalize_text(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT trim(both ' ' from regexp_replace(lower(public.f_unaccent(coalesce(value, ''))), '[^a-z0-9]+', ' ', 'g'))
$$;

CREATE OR REPLACE FUNCTION public.fenabrave_brand_alias(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN public.fenabrave_normalize_text(value) IN ('gm', 'chevrolet')
      OR public.fenabrave_normalize_text(value) LIKE 'gm chevrolet%' THEN 'chevrolet'
    WHEN public.fenabrave_normalize_text(value) IN ('vw', 'volkswagen', 'vw volkswagen')
      OR public.fenabrave_normalize_text(value) LIKE 'vw volkswagen%' THEN 'vw volkswagen'
    WHEN public.fenabrave_normalize_text(value) IN ('m benz', 'mercedes benz')
      OR public.fenabrave_normalize_text(value) LIKE 'mercedes benz%' THEN 'mercedes benz'
    WHEN public.fenabrave_normalize_text(value) = 'caoa chery' THEN 'caoa chery'
    ELSE public.fenabrave_normalize_text(value)
  END
$$;

CREATE OR REPLACE FUNCTION public.fenabrave_model_family(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT trim(both ' ' from regexp_replace(
    public.fenabrave_normalize_text(value),
    '\s+(1|2|3|4|5|6|7|8|9|0|mt|at|aut|manual|flex|gasolina|diesel|eletrico|hibrido|tsi|turbo|cv|16v|8v).*$',
    '',
    'g'
  ))
$$;

CREATE OR REPLACE FUNCTION public.fenabrave_similarity(left_value text, right_value text)
RETURNS numeric
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  score real;
  left_norm text := public.fenabrave_normalize_text(left_value);
  right_norm text := public.fenabrave_normalize_text(right_value);
BEGIN
  BEGIN
    EXECUTE 'SELECT similarity($1, $2)' INTO score USING left_norm, right_norm;
    RETURN round(score::numeric, 6);
  EXCEPTION
    WHEN undefined_function THEN
      IF left_norm = right_norm THEN
        RETURN 1;
      ELSIF left_norm <> '' AND right_norm LIKE left_norm || '%' THEN
        RETURN 0.82;
      ELSIF left_norm <> '' AND right_norm LIKE '%' || left_norm || '%' THEN
        RETURN 0.72;
      ELSIF right_norm <> '' AND left_norm LIKE '%' || right_norm || '%' THEN
        RETURN 0.65;
      END IF;
      RETURN 0;
  END;
END
$$;

CREATE TABLE IF NOT EXISTS fenabrave_model_rankings (
  id bigserial PRIMARY KEY,
  report_month date NOT NULL,
  source_file text NOT NULL,
  ranking_type text NOT NULL,
  category text NOT NULL,
  segment text,
  rank integer NOT NULL,
  brand_original text NOT NULL,
  model_original text NOT NULL,
  brand_normalized text NOT NULL,
  model_normalized text NOT NULL,
  registrations_month integer,
  registrations_accumulated integer,
  market_share_pct numeric(8, 4),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fenabrave_brand_rankings (
  id bigserial PRIMARY KEY,
  report_month date NOT NULL,
  source_file text NOT NULL,
  ranking_type text NOT NULL,
  category text NOT NULL,
  segment text,
  rank integer NOT NULL,
  brand_original text NOT NULL,
  model_original text,
  brand_normalized text NOT NULL,
  model_normalized text,
  registrations_month integer,
  registrations_accumulated integer,
  market_share_pct numeric(8, 4),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fenabrave_segment_model_rankings (
  id bigserial PRIMARY KEY,
  report_month date NOT NULL,
  source_file text NOT NULL,
  ranking_type text NOT NULL,
  category text,
  segment text NOT NULL,
  rank integer NOT NULL,
  brand_original text NOT NULL,
  model_original text NOT NULL,
  brand_normalized text NOT NULL,
  model_normalized text NOT NULL,
  registrations_month integer,
  registrations_accumulated integer,
  market_share_pct numeric(8, 4),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_fenabrave_model_rankings_source
  ON fenabrave_model_rankings (report_month, source_file, ranking_type, category, rank, brand_original, model_original);

CREATE UNIQUE INDEX IF NOT EXISTS uq_fenabrave_brand_rankings_source
  ON fenabrave_brand_rankings (report_month, source_file, ranking_type, category, rank, brand_original);

CREATE UNIQUE INDEX IF NOT EXISTS uq_fenabrave_segment_model_rankings_source
  ON fenabrave_segment_model_rankings (report_month, source_file, ranking_type, segment, rank, brand_original, model_original);

CREATE INDEX IF NOT EXISTS idx_fenabrave_model_rankings_norm
  ON fenabrave_model_rankings (brand_normalized, model_normalized);

CREATE INDEX IF NOT EXISTS idx_fenabrave_segment_model_rankings_norm
  ON fenabrave_segment_model_rankings (brand_normalized, model_normalized);

CREATE INDEX IF NOT EXISTS idx_fenabrave_brand_rankings_norm
  ON fenabrave_brand_rankings (brand_normalized);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
      FROM pg_class
     WHERE relname = 'fenabrave_fipe_match_candidates'
       AND relkind = 'v'
  ) THEN
    EXECUTE 'DROP VIEW fenabrave_fipe_match_candidates';
  ELSIF EXISTS (
    SELECT 1
      FROM pg_class
     WHERE relname = 'fenabrave_fipe_match_candidates'
       AND relkind = 'm'
  ) THEN
    EXECUTE 'DROP MATERIALIZED VIEW fenabrave_fipe_match_candidates';
  END IF;
END
$$;

CREATE MATERIALIZED VIEW fenabrave_fipe_match_candidates AS
WITH fenabrave_rows AS (
  SELECT 'fenabrave_model_rankings'::text AS source_table,
         id AS fenabrave_row_id,
         report_month,
         source_file,
         ranking_type,
         category,
         segment,
         rank,
         brand_original,
         model_original,
         brand_normalized,
         model_normalized,
         registrations_month,
         registrations_accumulated,
         market_share_pct
    FROM fenabrave_model_rankings
  UNION ALL
  SELECT 'fenabrave_segment_model_rankings'::text AS source_table,
         id AS fenabrave_row_id,
         report_month,
         source_file,
         ranking_type,
         category,
         segment,
         rank,
         brand_original,
         model_original,
         brand_normalized,
         model_normalized,
         registrations_month,
         registrations_accumulated,
         market_share_pct
    FROM fenabrave_segment_model_rankings
),
fipe_rows AS MATERIALIZED (
  SELECT vehicle_id,
         brand AS fipe_brand,
         model AS fipe_model,
         slug,
         segment AS fipe_segment,
         latest_price,
         public.fenabrave_brand_alias(brand) AS fipe_brand_normalized,
         public.fenabrave_normalize_text(model) AS fipe_model_normalized,
         public.fenabrave_model_family(model) AS fipe_model_family
    FROM vehicle_latest_prices
   WHERE latest_price IS NOT NULL
),
candidate_pool AS (
  SELECT f.*,
         v.vehicle_id,
         v.fipe_brand,
         v.fipe_model,
         v.slug,
         v.fipe_segment,
         v.latest_price,
         (
           0.36
           +
           CASE
             WHEN v.fipe_model_normalized = f.model_normalized THEN 0.52
             WHEN v.fipe_model_family = public.fenabrave_model_family(f.model_original) THEN 0.44
             WHEN v.fipe_model_normalized LIKE f.model_normalized || '%' THEN 0.40
             WHEN v.fipe_model_normalized LIKE '%' || f.model_normalized || '%' THEN 0.34
             ELSE 0
           END
           +
           (0.12 * public.fenabrave_similarity(f.model_original, v.fipe_model))
         )::numeric(10, 6) AS similarity_score
    FROM fenabrave_rows f
    JOIN fipe_rows v
      ON v.fipe_brand_normalized = f.brand_normalized
     AND (
       v.fipe_model_normalized = f.model_normalized
       OR v.fipe_model_family = public.fenabrave_model_family(f.model_original)
       OR v.fipe_model_normalized LIKE f.model_normalized || '%'
       OR v.fipe_model_normalized LIKE '%' || f.model_normalized || '%'
     )
),
ranked_candidates AS (
  SELECT c.*,
         row_number() OVER (
           PARTITION BY c.source_table, c.fenabrave_row_id
           ORDER BY c.similarity_score DESC, c.latest_price DESC NULLS LAST, c.vehicle_id
         ) AS candidate_rank,
         count(*) OVER (
           PARTITION BY c.source_table, c.fenabrave_row_id
         ) AS candidate_count,
         lead(c.similarity_score) OVER (
           PARTITION BY c.source_table, c.fenabrave_row_id
           ORDER BY c.similarity_score DESC, c.latest_price DESC NULLS LAST, c.vehicle_id
         ) AS next_similarity_score
    FROM candidate_pool c
   WHERE c.similarity_score >= 0.35
),
best_candidates AS (
  SELECT *
    FROM ranked_candidates
   WHERE candidate_rank <= 10
),
no_match_rows AS (
  SELECT f.*,
         NULL::bigint AS vehicle_id,
         NULL::text AS fipe_brand,
         NULL::text AS fipe_model,
         NULL::text AS slug,
         NULL::text AS fipe_segment,
         NULL::numeric AS latest_price,
         0::numeric(10, 6) AS similarity_score,
         1::bigint AS candidate_rank,
         0::bigint AS candidate_count,
         NULL::numeric(10, 6) AS next_similarity_score
    FROM fenabrave_rows f
   WHERE NOT EXISTS (
     SELECT 1
       FROM ranked_candidates c
      WHERE c.source_table = f.source_table
        AND c.fenabrave_row_id = f.fenabrave_row_id
   )
)
SELECT source_table,
       fenabrave_row_id,
       report_month,
       source_file,
       ranking_type,
       category,
       segment AS fenabrave_segment,
       rank,
       brand_original AS fenabrave_brand,
       model_original AS fenabrave_model,
       registrations_month,
       registrations_accumulated,
       market_share_pct,
       vehicle_id AS fipe_vehicle_id,
       fipe_brand,
       fipe_model,
       slug,
       fipe_segment AS segment,
       latest_price,
       similarity_score,
       CASE
         WHEN vehicle_id IS NULL THEN 'no_match'
         WHEN candidate_count > 1
          AND (
            coalesce(next_similarity_score, similarity_score) >= similarity_score - 0.05
            OR similarity_score >= 0.88
          ) THEN 'ambiguous'
         WHEN similarity_score >= 0.88 THEN 'exact'
         ELSE 'fuzzy'
       END AS match_status,
       candidate_rank,
       candidate_count
  FROM best_candidates
UNION ALL
SELECT source_table,
       fenabrave_row_id,
       report_month,
       source_file,
       ranking_type,
       category,
       segment AS fenabrave_segment,
       rank,
       brand_original AS fenabrave_brand,
       model_original AS fenabrave_model,
       registrations_month,
       registrations_accumulated,
       market_share_pct,
       vehicle_id AS fipe_vehicle_id,
       fipe_brand,
       fipe_model,
       slug,
       fipe_segment AS segment,
       latest_price,
       similarity_score,
       'no_match'::text AS match_status,
       candidate_rank,
       candidate_count
  FROM no_match_rows
WITH NO DATA;

CREATE INDEX IF NOT EXISTS idx_fenabrave_fipe_match_candidates_volume
  ON fenabrave_fipe_match_candidates (
    report_month,
    registrations_month DESC NULLS LAST,
    registrations_accumulated DESC NULLS LAST,
    candidate_rank
  );

CREATE INDEX IF NOT EXISTS idx_fenabrave_fipe_match_candidates_status
  ON fenabrave_fipe_match_candidates (match_status);

CREATE INDEX IF NOT EXISTS idx_fenabrave_fipe_match_candidates_row
  ON fenabrave_fipe_match_candidates (source_table, fenabrave_row_id, candidate_rank);
