import { getPool } from './db.ts'

export type PriceHistoryPoint = {
  reference_month: string
  price: string
}

export type FuelConsumptionRow = {
  table_year: number
  categoria: string | null
  motor: string | null
  transmissao: string | null
  propulsao: string | null
  kml_etanol_cidade: string | null
  kml_etanol_estrada: string | null
  kml_gasolina_cidade: string | null
  kml_gasolina_estrada: string | null
  kml_eletrico_cidade: string | null
  kml_eletrico_estrada: string | null
  consumo_mj_km: string | null
  autonomia_eletrica_km: string | null
  classificacao_pbe: string | null
  classificacao_geral: string | null
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
  fuel_consumption: FuelConsumptionRow | null
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

  const head = await pool.query<Omit<VehicleDetailsRow, 'price_history' | 'fuel_consumption'>>(
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

  // Consumo Inmetro (PBE Veicular) quando o veículo tem match na tabela oficial.
  const consumption = await pool.query<FuelConsumptionRow>(
    `SELECT b.table_year, b.categoria, b.motor, b.transmissao, b.propulsao,
            b.kml_etanol_cidade, b.kml_etanol_estrada,
            b.kml_gasolina_cidade, b.kml_gasolina_estrada,
            b.kml_eletrico_cidade, b.kml_eletrico_estrada,
            b.consumo_mj_km, b.autonomia_eletrica_km,
            b.classificacao_pbe, b.classificacao_geral
       FROM vehicle_inmetro_pbev m
       JOIN inmetro_pbev b ON b.id = m.pbev_id
      WHERE m.vehicle_id = $1
      LIMIT 1`,
    [head.rows[0].vehicle_id],
  )

  return {
    ...head.rows[0],
    price_history: history.rows,
    fuel_consumption: consumption.rows[0] ?? null,
  }
}
