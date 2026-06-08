import { getPool } from './db.ts'

export type HomeVehicleRow = {
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

export type HomeLinkRow = {
  slug: string
  name: string
  count: number
}

export type HomeMarketStatsRow = {
  totalVehicles: number
  averagePrice: number | null
  highestPrice: number | null
  lowestPrice: number | null
  latestReferenceMonth: string | null
}

export type HomeRow = {
  featuredVehicles: HomeVehicleRow[]
  brands: HomeLinkRow[]
  categories: HomeLinkRow[]
  marketStats: HomeMarketStatsRow
}

const VALID_CATEGORIES = [
  'suv', 'sedan', 'hatch', 'picape', 'perua',
  'minivan', 'cupe', 'conversivel', 'furgao', 'buggy',
]

const VEHICLE_COLS = `
  vehicle_id::int AS vehicle_id, slug, fipe_code, brand, model, model_year, is_zero_km, fuel,
  vehicle_type, segment, latest_price, latest_reference_month::text AS latest_reference_month`

const BRAND_SLUG_EXPR = `trim(both '-' from regexp_replace(lower(f_unaccent(brand)), '[^a-z0-9]+', '-', 'g'))`

/** Dados reais mínimos para a Home, sem depender dos mocks. */
export async function getHomeData(): Promise<HomeRow> {
  const pool = getPool()

  const [stats, featuredVehicles, brands, categories] = await Promise.all([
    pool.query<{
      total: string
      avgp: string | null
      maxp: string | null
      minp: string | null
      latest_month: string | null
    }>(
      `SELECT count(*) AS total,
              avg(latest_price) FILTER (WHERE latest_price IS NOT NULL) AS avgp,
              max(latest_price) AS maxp,
              min(latest_price) AS minp,
              max(latest_reference_month)::text AS latest_month
         FROM vehicle_latest_prices`,
    ),
    pool.query<HomeVehicleRow>(
      `SELECT ${VEHICLE_COLS}
         FROM vehicle_latest_prices
        WHERE latest_price IS NOT NULL
        ORDER BY latest_price DESC, latest_reference_month DESC NULLS LAST, brand, model
        LIMIT 4`,
    ),
    pool.query<{ slug: string; name: string; count: string }>(
      `WITH base AS (
         SELECT brand, ${BRAND_SLUG_EXPR} AS slug
           FROM vehicle_latest_prices
       )
       SELECT slug, min(brand) AS name, count(*) AS count
         FROM base
        WHERE slug <> ''
        GROUP BY slug
        ORDER BY count(*) DESC, min(brand)
        LIMIT 16`,
    ),
    pool.query<{ slug: string; count: string }>(
      `SELECT segment AS slug, count(*) AS count
         FROM vehicle_latest_prices
        WHERE segment = ANY($1)
        GROUP BY segment
        ORDER BY count(*) DESC, segment
        LIMIT 16`,
      [VALID_CATEGORIES],
    ),
  ])

  const s = stats.rows[0]
  return {
    featuredVehicles: featuredVehicles.rows,
    brands: brands.rows.map((row) => ({
      slug: row.slug,
      name: row.name,
      count: Number(row.count),
    })),
    categories: categories.rows.map((row) => ({
      slug: row.slug,
      name: row.slug,
      count: Number(row.count),
    })),
    marketStats: {
      totalVehicles: Number(s.total),
      averagePrice: s.avgp != null ? Number(s.avgp) : null,
      highestPrice: s.maxp != null ? Number(s.maxp) : null,
      lowestPrice: s.minp != null ? Number(s.minp) : null,
      latestReferenceMonth: s.latest_month,
    },
  }
}
