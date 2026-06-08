import { getPool } from './db.ts'

export type MarketRankingVehicleRow = {
  vehicle_id: number
  slug: string
  fipe_code: string
  brand: string
  model: string
  model_year: number | null
  fuel: string
  vehicle_type: string | null
  segment: string | null
  latest_price: string | null
  latest_reference_month: string | null
}

export type MarketRankingsRow = {
  topExpensive: MarketRankingVehicleRow[]
  topAffordable: MarketRankingVehicleRow[]
  suvTopExpensive: MarketRankingVehicleRow[]
  sedanTopExpensive: MarketRankingVehicleRow[]
  hatchTopAffordable: MarketRankingVehicleRow[]
  pickupTopExpensive: MarketRankingVehicleRow[]
}

export const MARKET_RANKINGS_DEFAULT_LIMIT = 5
export const MARKET_RANKINGS_MAX_LIMIT = 20

const VEHICLE_COLS = `
  vehicle_id::int AS vehicle_id, slug, fipe_code, brand, model, model_year, fuel,
  vehicle_type, segment, latest_price, latest_reference_month::text AS latest_reference_month`

const safeLimit = (limit: number): number =>
  Math.min(
    Math.max(1, Math.floor(limit) || MARKET_RANKINGS_DEFAULT_LIMIT),
    MARKET_RANKINGS_MAX_LIMIT,
  )

async function getPriceRanking(
  direction: 'asc' | 'desc',
  limit: number,
  segment?: string,
): Promise<MarketRankingVehicleRow[]> {
  const params: Array<string | number> = [safeLimit(limit)]
  const segmentClause = segment ? 'AND segment = $2' : ''
  if (segment) params.push(segment)

  const sql = `
    SELECT ${VEHICLE_COLS}
      FROM vehicle_latest_prices
     WHERE latest_price IS NOT NULL
       ${segmentClause}
     ORDER BY latest_price ${direction.toUpperCase()},
              latest_reference_month DESC NULLS LAST,
              brand,
              model,
              model_year DESC NULLS LAST
     LIMIT $1`

  const { rows } = await getPool().query<MarketRankingVehicleRow>(sql, params)
  return rows
}

/** Rankings reais disponíveis hoje: preço FIPE atual em vehicle_latest_prices. */
export async function getMarketRankings(
  limit: number = MARKET_RANKINGS_DEFAULT_LIMIT,
): Promise<MarketRankingsRow> {
  const [
    topExpensive,
    topAffordable,
    suvTopExpensive,
    sedanTopExpensive,
    hatchTopAffordable,
    pickupTopExpensive,
  ] = await Promise.all([
    getPriceRanking('desc', limit),
    getPriceRanking('asc', limit),
    getPriceRanking('desc', limit, 'suv'),
    getPriceRanking('desc', limit, 'sedan'),
    getPriceRanking('asc', limit, 'hatch'),
    getPriceRanking('desc', limit, 'picape'),
  ])

  return {
    topExpensive,
    topAffordable,
    suvTopExpensive,
    sedanTopExpensive,
    hatchTopAffordable,
    pickupTopExpensive,
  }
}
