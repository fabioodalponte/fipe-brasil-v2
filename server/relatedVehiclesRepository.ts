import { getPool } from './db.ts'

export type RelatedVehicleRow = {
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

export const RELATED_DEFAULT_LIMIT = 4
const RELATED_MAX_LIMIT = 8

/**
 * Veículos relacionados a um slug, a partir de vehicle_latest_prices.
 * Pool: mesmo segment (quando o base tem segment) OU mesma brand.
 * Prioridade: mesmo segment → mesma brand → preço próximo → ano próximo →
 * mesmo fuel. Exclui o próprio veículo. Fallback (segment NULL): brand + preço
 * + ano. Retorna até `limit` (default 4).
 */
export async function getRelatedBySlug(
  slug: string,
  limit: number = RELATED_DEFAULT_LIMIT,
): Promise<RelatedVehicleRow[]> {
  const s = slug.trim()
  if (!s) return []
  const safeLimit = Math.min(Math.max(1, Math.floor(limit) || RELATED_DEFAULT_LIMIT), RELATED_MAX_LIMIT)

  const sql = `
    WITH base AS (
      SELECT slug, brand, segment, fuel, latest_price, model_year
        FROM vehicle_latest_prices
       WHERE slug = $1
       LIMIT 1
    )
    SELECT v.vehicle_id, v.slug, v.fipe_code, v.brand, v.model, v.model_year, v.is_zero_km,
           v.fuel, v.vehicle_type, v.segment, v.latest_price,
           v.latest_reference_month::text AS latest_reference_month
      FROM vehicle_latest_prices v
      JOIN base b ON true
     WHERE v.slug <> b.slug
       AND ((b.segment IS NOT NULL AND v.segment = b.segment) OR v.brand = b.brand)
     ORDER BY
       (CASE WHEN b.segment IS NOT NULL AND v.segment = b.segment THEN 0 ELSE 1 END),
       (CASE WHEN v.brand = b.brand THEN 0 ELSE 1 END),
       abs(coalesce(v.latest_price, 0) - coalesce(b.latest_price, 0)),
       abs(coalesce(v.model_year, 0) - coalesce(b.model_year, 0)),
       (CASE WHEN v.fuel = b.fuel THEN 0 ELSE 1 END),
       v.brand, v.model
     LIMIT $2`

  const { rows } = await getPool().query<RelatedVehicleRow>(sql, [s, safeLimit])
  return rows
}
