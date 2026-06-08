import { getPool } from './db.ts'

export type BrandVehicleRow = {
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

export type BrandSegmentCount = {
  segment: string | null
  count: number
}

export type BrandPageRow = {
  brand: string
  slug: string
  totalVehicles: number
  averagePrice: number | null
  highestPrice: number | null
  lowestPrice: number | null
  segments: BrandSegmentCount[]
  vehicles: BrandVehicleRow[]
  rankings: {
    mostExpensive: BrandVehicleRow[]
    cheapest: BrandVehicleRow[]
    // Valorização ainda não disponível (sem view de variação): omitido.
  }
}

const VEHICLE_COLS = `
  vehicle_id, slug, fipe_code, brand, model, model_year, is_zero_km, fuel,
  vehicle_type, segment, latest_price, latest_reference_month::text AS latest_reference_month`

// slugify equivalente ao do frontend: unaccent -> lower -> não-alfanum -> '-' -> trim '-'
const BRAND_SLUG_EXPR = `trim(both '-' from regexp_replace(lower(f_unaccent(brand)), '[^a-z0-9]+', '-', 'g'))`

const VEHICLES_LIMIT = 24
const RANK_LIMIT = 5

/** Dados da página de marca a partir de vehicle_latest_prices. null se não existe. */
export async function getBrandBySlug(slug: string): Promise<BrandPageRow | null> {
  const s = slug.trim().toLowerCase()
  if (!s) return null
  const pool = getPool()

  const brandRes = await pool.query<{ brand: string }>(
    `SELECT brand FROM vehicle_latest_prices
      WHERE ${BRAND_SLUG_EXPR} = $1
      GROUP BY brand
      ORDER BY count(*) DESC
      LIMIT 1`,
    [s],
  )
  if (brandRes.rows.length === 0) return null
  const brand = brandRes.rows[0].brand

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
       FROM vehicle_latest_prices WHERE brand = $1`,
    [brand],
  )
  const a = agg.rows[0]

  const segs = await pool.query<{ segment: string | null; count: string }>(
    `SELECT segment, count(*) AS count
       FROM vehicle_latest_prices WHERE brand = $1
      GROUP BY segment ORDER BY count(*) DESC`,
    [brand],
  )

  const vehicles = await pool.query<BrandVehicleRow>(
    `SELECT ${VEHICLE_COLS} FROM vehicle_latest_prices
      WHERE brand = $1 ORDER BY latest_price DESC NULLS LAST, model LIMIT $2`,
    [brand, VEHICLES_LIMIT],
  )

  const mostExpensive = await pool.query<BrandVehicleRow>(
    `SELECT ${VEHICLE_COLS} FROM vehicle_latest_prices
      WHERE brand = $1 AND latest_price IS NOT NULL
      ORDER BY latest_price DESC LIMIT $2`,
    [brand, RANK_LIMIT],
  )

  const cheapest = await pool.query<BrandVehicleRow>(
    `SELECT ${VEHICLE_COLS} FROM vehicle_latest_prices
      WHERE brand = $1 AND latest_price IS NOT NULL
      ORDER BY latest_price ASC LIMIT $2`,
    [brand, RANK_LIMIT],
  )

  return {
    brand,
    slug: s,
    totalVehicles: Number(a.total),
    averagePrice: a.avgp != null ? Number(a.avgp) : null,
    highestPrice: a.maxp != null ? Number(a.maxp) : null,
    lowestPrice: a.minp != null ? Number(a.minp) : null,
    segments: segs.rows.map((r) => ({ segment: r.segment, count: Number(r.count) })),
    vehicles: vehicles.rows,
    rankings: { mostExpensive: mostExpensive.rows, cheapest: cheapest.rows },
  }
}
