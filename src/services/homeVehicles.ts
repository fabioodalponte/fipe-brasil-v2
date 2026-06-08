import type { Vehicle } from '../data/mock/market'

export type HomeVehicleFilters = {
  brand?: string
  segment?: string
  minPrice?: number
  maxPrice?: number
}

type HomeVehicleApiRow = {
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

function toVehicle(row: HomeVehicleApiRow): Vehicle {
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

export async function getHomeVehicles(
  filters: HomeVehicleFilters,
  signal?: AbortSignal,
): Promise<Vehicle[]> {
  const params = new URLSearchParams({ limit: '12' })
  if (filters.brand) params.set('brand', filters.brand)
  if (filters.segment) params.set('segment', filters.segment)
  if (filters.minPrice != null) params.set('minPrice', String(filters.minPrice))
  if (filters.maxPrice != null) params.set('maxPrice', String(filters.maxPrice))

  const response = await fetch(`/api/home/vehicles?${params.toString()}`, { signal })
  if (!response.ok) {
    throw new Error(`Veiculos da Home falharam (${response.status})`)
  }

  const rows = (await response.json()) as HomeVehicleApiRow[]
  return rows.map(toVehicle)
}
