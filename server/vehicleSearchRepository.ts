import { getPool } from './db.ts'

/** Linha retornada pela busca (espelha vehicle_latest_prices). */
export type VehicleSearchRow = {
  vehicle_id: number
  slug: string
  fipe_code: string
  brand: string
  model: string
  model_year: number | null
  is_zero_km: boolean
  fuel: string
  vehicle_type: string | null
  segment: string | null
  latest_price: string | null
  latest_reference_month: string | null
}

export const DEFAULT_LIMIT = 10
export const MAX_LIMIT = 20
const MAX_TERMS = 6

/**
 * Busca veículos na materialized view vehicle_latest_prices.
 * - Por marca, modelo, fipe_code, slug, ano e combustível (doc concatenado).
 * - unaccent + ILIKE via f_unaccent(lower(...)) (wrapper IMMUTABLE do fipe-v2).
 * - Cada termo precisa casar (AND), espelhando o provider mockado.
 * Ordenação: match por fipe_code → segment preenchido → mês mais recente → nome.
 */
export async function searchVehicles(
  query: string,
  limit: number = DEFAULT_LIMIT,
): Promise<VehicleSearchRow[]> {
  const q = query.trim()
  if (!q) return []

  const safeLimit = Math.min(Math.max(1, Math.floor(limit) || DEFAULT_LIMIT), MAX_LIMIT)
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean).slice(0, MAX_TERMS)
  if (terms.length === 0) return []

  const conds = terms.map((_, i) => `doc LIKE f_unaccent(lower($${i + 1}))`).join(' AND ')
  const rawIdx = terms.length + 1
  const limitIdx = terms.length + 2

  const sql = `
    WITH base AS (
      SELECT vehicle_id, slug, fipe_code, brand, model, model_year, is_zero_km, fuel,
             vehicle_type, segment, latest_price, latest_reference_month,
             f_unaccent(lower(
               brand || ' ' || model || ' ' || fipe_code || ' ' || slug || ' ' ||
               fuel || ' ' || coalesce(model_year::text, '0km')
             )) AS doc
        FROM vehicle_latest_prices
    )
    SELECT vehicle_id, slug, fipe_code, brand, model, model_year, is_zero_km, fuel,
           vehicle_type, segment, latest_price,
           latest_reference_month::text AS latest_reference_month
      FROM base
     WHERE ${conds}
     ORDER BY (CASE WHEN f_unaccent(lower(fipe_code)) LIKE f_unaccent(lower($${rawIdx})) THEN 0 ELSE 1 END),
              (CASE WHEN segment IS NOT NULL THEN 0 ELSE 1 END),
              latest_reference_month DESC NULLS LAST,
              brand, model
     LIMIT $${limitIdx}`

  const params: Array<string | number> = [
    ...terms.map((t) => `%${t}%`),
    `%${q}%`,
    safeLimit,
  ]

  const { rows } = await getPool().query<VehicleSearchRow>(sql, params)
  return rows
}
