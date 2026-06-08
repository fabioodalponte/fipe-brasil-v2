import { getPool } from './db.ts'

export type CategoryVehicleRow = {
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

export type CategoryBrandCount = {
  brand: string
  count: number
}

export type CategoryPageRow = {
  category: string
  slug: string
  totalVehicles: number
  averagePrice: number | null
  highestPrice: number | null
  lowestPrice: number | null
  brands: CategoryBrandCount[]
  vehicles: CategoryVehicleRow[]
  topExpensive: CategoryVehicleRow[]
  topAffordable: CategoryVehicleRow[]
}

const VALID_CATEGORIES = new Set([
  'suv', 'sedan', 'hatch', 'picape', 'perua',
  'minivan', 'cupe', 'conversivel', 'furgao', 'buggy',
])

const VEHICLE_COLS = `
  vehicle_id, slug, fipe_code, brand, model, model_year, is_zero_km, fuel,
  vehicle_type, segment, latest_price, latest_reference_month::text AS latest_reference_month`

const VEHICLES_LIMIT = 24
const RANK_LIMIT = 5

/**
 * Dados da página de categoria a partir de vehicle_latest_prices (segment).
 * null quando a categoria é inválida ou não tem veículos.
 */
export async function getCategoryBySlug(slug: string): Promise<CategoryPageRow | null> {
  const s = slug.trim().toLowerCase()
  if (!VALID_CATEGORIES.has(s)) return null
  const pool = getPool()

  const agg = await pool.query<{
    total: string
    avgp: string | null
    maxp: string | null
    minp: string | null
  }>(
    `SELECT count(*) AS total,
            avg(latest_price) FILTER (WHERE latest_price IS NOT NULL) AS avgp,
            max(latest_price) AS maxp,
            min(latest_price) AS minp
       FROM vehicle_latest_prices WHERE segment = $1`,
    [s],
  )
  const a = agg.rows[0]
  if (Number(a.total) === 0) return null

  const brands = await pool.query<{ brand: string; count: string }>(
    `SELECT brand, count(*) AS count
       FROM vehicle_latest_prices WHERE segment = $1
      GROUP BY brand ORDER BY count(*) DESC, brand`,
    [s],
  )

  const vehicles = await pool.query<CategoryVehicleRow>(
    `SELECT ${VEHICLE_COLS} FROM vehicle_latest_prices
      WHERE segment = $1 ORDER BY latest_price DESC NULLS LAST, brand, model LIMIT $2`,
    [s, VEHICLES_LIMIT],
  )

  const topExpensive = await pool.query<CategoryVehicleRow>(
    `SELECT ${VEHICLE_COLS} FROM vehicle_latest_prices
      WHERE segment = $1 AND latest_price IS NOT NULL
      ORDER BY latest_price DESC LIMIT $2`,
    [s, RANK_LIMIT],
  )

  const topAffordable = await pool.query<CategoryVehicleRow>(
    `SELECT ${VEHICLE_COLS} FROM vehicle_latest_prices
      WHERE segment = $1 AND latest_price IS NOT NULL
      ORDER BY latest_price ASC LIMIT $2`,
    [s, RANK_LIMIT],
  )

  return {
    category: s,
    slug: s,
    totalVehicles: Number(a.total),
    averagePrice: a.avgp != null ? Number(a.avgp) : null,
    highestPrice: a.maxp != null ? Number(a.maxp) : null,
    lowestPrice: a.minp != null ? Number(a.minp) : null,
    brands: brands.rows.map((r) => ({ brand: r.brand, count: Number(r.count) })),
    vehicles: vehicles.rows,
    topExpensive: topExpensive.rows,
    topAffordable: topAffordable.rows,
  }
}
