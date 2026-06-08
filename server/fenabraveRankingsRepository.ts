import { getPool } from './db.ts'

export type FenabraveBestFipeCandidateRow = {
  vehicle_id: number
  slug: string
  brand: string
  model: string
  segment: string | null
  latest_price: string | number | null
  latest_reference_month: string | null
  change_12m_pct: string | number | null
  similarity_score: string | number | null
}

export type FenabraveBestSellingRow = {
  rank: number
  brand_original: string
  model_original: string
  category: string
  registrations_month: number | null
  registrations_accumulated: number | null
  market_share_pct: string | null
  match_status: string
  best_fipe_candidate: FenabraveBestFipeCandidateRow | null
}

export type FenabraveSegmentSlug = 'suv' | 'picape'

export type FenabraveSegmentRankingRow = {
  rank: number
  fenabrave_segment: string
  brand_original: string
  model_original: string
  registrations_month: number | null
  registrations_accumulated: number | null
  market_share_pct: string | null
  match_status: string
  best_fipe_candidate: FenabraveBestFipeCandidateRow | null
}

export const FENABRAVE_BEST_SELLING_DEFAULT_LIMIT = 50
export const FENABRAVE_BEST_SELLING_MAX_LIMIT = 100

function safeLimit(limit: number): number {
  return Math.min(
    Math.max(1, Math.floor(limit) || FENABRAVE_BEST_SELLING_DEFAULT_LIMIT),
    FENABRAVE_BEST_SELLING_MAX_LIMIT,
  )
}

export async function getFenabraveBestSellingVehicles(
  limit = FENABRAVE_BEST_SELLING_DEFAULT_LIMIT,
): Promise<FenabraveBestSellingRow[]> {
  const sql = `
    WITH ranked_fenabrave AS (
      SELECT id,
             rank,
             brand_original,
             model_original,
             category,
             registrations_month,
             registrations_accumulated,
             market_share_pct
        FROM fenabrave_model_rankings
       WHERE report_month = '2026-05-01'
         AND ranking_type = 'model_accumulated'
       ORDER BY registrations_accumulated DESC NULLS LAST,
                category,
                rank,
                brand_original,
                model_original
       LIMIT $1
    ),
    best_candidates AS (
      SELECT f.id AS fenabrave_row_id,
             c.match_status,
             c.fipe_vehicle_id,
             c.slug,
             c.fipe_brand,
             c.fipe_model,
             c.segment,
             c.latest_price,
             c.similarity_score,
             row_number() OVER (
               PARTITION BY f.id
               ORDER BY c.similarity_score DESC NULLS LAST,
                        c.latest_price DESC NULLS LAST,
                        c.fipe_vehicle_id
             ) AS best_rank
        FROM ranked_fenabrave f
        LEFT JOIN fenabrave_fipe_match_candidates c
          ON c.source_table = 'fenabrave_model_rankings'
         AND c.fenabrave_row_id = f.id
         AND c.ranking_type = 'model_accumulated'
         AND c.fipe_vehicle_id IS NOT NULL
    )
    SELECT f.rank,
           f.brand_original,
           f.model_original,
           f.category,
           f.registrations_month,
           f.registrations_accumulated,
           f.market_share_pct,
           coalesce(b.match_status, 'no_match') AS match_status,
           CASE
             WHEN b.fipe_vehicle_id IS NULL THEN NULL
             ELSE json_build_object(
               'vehicle_id', b.fipe_vehicle_id::int,
               'slug', b.slug,
               'brand', b.fipe_brand,
               'model', b.fipe_model,
               'segment', b.segment,
               'latest_price', b.latest_price,
               'latest_reference_month', v.latest_reference_month::text,
               'change_12m_pct', pc.change_12m_pct,
               'similarity_score', b.similarity_score
             )
           END AS best_fipe_candidate
      FROM ranked_fenabrave f
      LEFT JOIN best_candidates b
        ON b.fenabrave_row_id = f.id
       AND b.best_rank = 1
      LEFT JOIN vehicle_latest_prices v
        ON v.vehicle_id = b.fipe_vehicle_id
      LEFT JOIN vehicle_price_changes pc
        ON pc.vehicle_id = b.fipe_vehicle_id
     ORDER BY f.registrations_accumulated DESC NULLS LAST,
              f.category,
              f.rank,
              f.brand_original,
              f.model_original`

  const { rows } = await getPool().query<FenabraveBestSellingRow>(sql, [safeLimit(limit)])
  return rows
}

export function isSupportedFenabraveSegment(value: string): value is FenabraveSegmentSlug {
  return value === 'suv' || value === 'picape'
}

function segmentClause(segment: FenabraveSegmentSlug): string {
  if (segment === 'suv') {
    return "public.fenabrave_normalize_text(segment) LIKE '%suv%'"
  }
  return "segment IN ('Pick-up''s Pequenas', 'Pick-up''s Grandes')"
}

export async function getFenabraveSegmentRanking(
  segment: FenabraveSegmentSlug,
  limit = FENABRAVE_BEST_SELLING_DEFAULT_LIMIT,
): Promise<FenabraveSegmentRankingRow[]> {
  const sql = `
    WITH ranked_fenabrave AS (
      SELECT id,
             rank,
             segment AS fenabrave_segment,
             brand_original,
             model_original,
             registrations_month,
             registrations_accumulated,
             market_share_pct
        FROM fenabrave_segment_model_rankings
       WHERE report_month = '2026-05-01'
         AND ranking_type = 'segment_model_accumulated'
         AND ${segmentClause(segment)}
       ORDER BY registrations_accumulated DESC NULLS LAST,
                segment,
                rank,
                brand_original,
                model_original
       LIMIT $1
    ),
    best_candidates AS (
      SELECT f.id AS fenabrave_row_id,
             c.match_status,
             c.fipe_vehicle_id,
             c.slug,
             c.fipe_brand,
             c.fipe_model,
             c.segment,
             c.latest_price,
             c.similarity_score,
             row_number() OVER (
               PARTITION BY f.id
               ORDER BY c.similarity_score DESC NULLS LAST,
                        c.latest_price DESC NULLS LAST,
                        c.fipe_vehicle_id
             ) AS best_rank
        FROM ranked_fenabrave f
        LEFT JOIN fenabrave_fipe_match_candidates c
          ON c.source_table = 'fenabrave_segment_model_rankings'
         AND c.fenabrave_row_id = f.id
         AND c.ranking_type = 'segment_model_accumulated'
         AND c.fipe_vehicle_id IS NOT NULL
    )
    SELECT f.rank,
           f.fenabrave_segment,
           f.brand_original,
           f.model_original,
           f.registrations_month,
           f.registrations_accumulated,
           f.market_share_pct,
           coalesce(b.match_status, 'no_match') AS match_status,
           CASE
             WHEN b.fipe_vehicle_id IS NULL THEN NULL
             ELSE json_build_object(
               'vehicle_id', b.fipe_vehicle_id::int,
               'slug', b.slug,
               'brand', b.fipe_brand,
               'model', b.fipe_model,
               'segment', b.segment,
               'latest_price', b.latest_price,
               'latest_reference_month', v.latest_reference_month::text,
               'change_12m_pct', pc.change_12m_pct,
               'similarity_score', b.similarity_score
             )
           END AS best_fipe_candidate
      FROM ranked_fenabrave f
      LEFT JOIN best_candidates b
        ON b.fenabrave_row_id = f.id
       AND b.best_rank = 1
      LEFT JOIN vehicle_latest_prices v
        ON v.vehicle_id = b.fipe_vehicle_id
      LEFT JOIN vehicle_price_changes pc
        ON pc.vehicle_id = b.fipe_vehicle_id
     ORDER BY f.registrations_accumulated DESC NULLS LAST,
              f.fenabrave_segment,
              f.rank,
              f.brand_original,
              f.model_original`

  const { rows } = await getPool().query<FenabraveSegmentRankingRow>(sql, [safeLimit(limit)])
  return rows
}
