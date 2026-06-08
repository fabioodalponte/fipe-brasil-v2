import { getPool } from './db.ts'

export type PriceHistoryPoint = {
  reference_month: string
  price: string
}

export type VehicleDetailsRow = {
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
  segment_source: string | null
  segment_confidence: string | null
  price_history: PriceHistoryPoint[]
}

/**
 * Detalhes de 1 veículo por slug: cabeçalho de vehicle_latest_prices +
 * histórico completo de vehicle_price_snapshots (ascendente por mês).
 * Retorna null quando o slug não existe.
 */
export async function getVehicleBySlug(slug: string): Promise<VehicleDetailsRow | null> {
  const s = slug.trim()
  if (!s) return null
  const pool = getPool()

  const head = await pool.query<Omit<VehicleDetailsRow, 'price_history'>>(
    `SELECT vehicle_id, slug, fipe_code, brand, model, model_year, is_zero_km, fuel,
            vehicle_type, segment, latest_price,
            latest_reference_month::text AS latest_reference_month,
            segment_source, segment_confidence
       FROM vehicle_latest_prices
      WHERE slug = $1
      LIMIT 1`,
    [s],
  )
  if (head.rows.length === 0) return null

  const history = await pool.query<PriceHistoryPoint>(
    `SELECT reference_month::text AS reference_month, price
       FROM vehicle_price_snapshots
      WHERE vehicle_id = $1
      ORDER BY reference_month ASC`,
    [head.rows[0].vehicle_id],
  )

  return { ...head.rows[0], price_history: history.rows }
}
