import type { Vehicle } from '../data/mock/market'

export type HomeLink = {
  slug: string
  name: string
  count: number
}

export type HomeMarketStats = {
  totalVehicles: number
  averagePrice: number | null
  highestPrice: number | null
  lowestPrice: number | null
  latestReferenceMonth: string | null
}

export type HomeData = {
  featuredVehicles: Vehicle[]
  brands: HomeLink[]
  categories: HomeLink[]
  marketStats: HomeMarketStats
}

type HomeApiVehicle = {
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

type HomeApiResponse = {
  featuredVehicles: HomeApiVehicle[]
  brands: HomeLink[]
  categories: HomeLink[]
  marketStats: HomeMarketStats
}

function toVehicle(row: HomeApiVehicle): Vehicle {
  return {
    id: row.slug,
    name: `${row.brand} ${row.model}`,
    brand: row.brand,
    model: row.model,
    version: row.fuel,
    year: row.model_year ?? 0,
    segment: row.segment ?? '',
    fipeCode: row.fipe_code,
    price: row.latest_price != null ? Number(row.latest_price) : 0,
    monthlyChange: 0,
    yearlyChange: 0,
    liquidity: 0,
    volatility: 0,
    marketRank: 0,
  }
}

export async function getHomeData(signal?: AbortSignal): Promise<HomeData> {
  const response = await fetch('/api/home', { signal })
  if (!response.ok) {
    throw new Error(`Home falhou (${response.status})`)
  }
  const data = (await response.json()) as HomeApiResponse
  return {
    featuredVehicles: data.featuredVehicles.map(toVehicle),
    brands: data.brands,
    categories: data.categories,
    marketStats: data.marketStats,
  }
}
