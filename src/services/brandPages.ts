import { vehicles, type Vehicle } from '../data/mock/market'
import { slugify } from '../utils/slug'

export type BrandSegmentCount = {
  segment: string
  count: number
}

export type BrandPage = {
  slug: string
  name: string
  totalVehicles: number
  averagePrice: number
  highestPrice: number
  lowestPrice: number
  segments: BrandSegmentCount[]
  vehicles: Vehicle[] // amostra da marca (mais caro -> mais barato)
  mostExpensive: Vehicle[]
  cheapest: Vehicle[]
}

export type BrandSummary = {
  slug: string
  name: string
  vehicleCount: number
}

/**
 * Contrato das páginas de marca. API real (GET /api/brands/:slug) por padrão;
 * mock como fallback (VITE_USE_MOCK=true). Não inventa valorização (sem view
 * de variação ainda) — prioriza preço e distribuição.
 */
export interface BrandPageProvider {
  getBrandPage(slug: string, signal?: AbortSignal): Promise<BrandPage | null>
  listBrands(signal?: AbortSignal): Promise<BrandSummary[]>
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const average = (values: number[]) =>
  values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length

const SEM_SEGMENTO = 'Sem segmento'

export class MockBrandPageProvider implements BrandPageProvider {
  private readonly source: Vehicle[]

  constructor(source: Vehicle[] = vehicles) {
    this.source = source
  }

  async getBrandPage(slug: string, signal?: AbortSignal): Promise<BrandPage | null> {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

    const matches = this.source.filter((vehicle) => slugify(vehicle.brand) === slug)
    if (matches.length === 0) return null

    const prices = matches.map((v) => v.price).filter(isFiniteNumber)
    const byPriceDesc = [...matches].sort((a, b) => b.price - a.price)

    const segmentMap = new Map<string, number>()
    for (const v of matches) {
      const key = v.segment || SEM_SEGMENTO
      segmentMap.set(key, (segmentMap.get(key) ?? 0) + 1)
    }

    return {
      slug,
      name: matches[0].brand,
      totalVehicles: matches.length,
      averagePrice: average(prices),
      highestPrice: prices.length ? Math.max(...prices) : 0,
      lowestPrice: prices.length ? Math.min(...prices) : 0,
      segments: [...segmentMap.entries()]
        .map(([segment, count]) => ({ segment, count }))
        .sort((a, b) => b.count - a.count),
      vehicles: byPriceDesc.slice(0, 24),
      mostExpensive: byPriceDesc.slice(0, 5),
      cheapest: [...byPriceDesc].reverse().slice(0, 5),
    }
  }

  async listBrands(signal?: AbortSignal): Promise<BrandSummary[]> {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

    const counts = new Map<string, BrandSummary>()
    for (const vehicle of this.source) {
      const slug = slugify(vehicle.brand)
      const existing = counts.get(slug)
      if (existing) existing.vehicleCount += 1
      else counts.set(slug, { slug, name: vehicle.brand, vehicleCount: 1 })
    }
    return [...counts.values()].sort((a, b) => a.name.localeCompare(b.name))
  }
}

// ---------------------------------------------------------------------------
// Provider real (API)
// ---------------------------------------------------------------------------
type BrandApiVehicle = {
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

type BrandApiResponse = {
  brand: string
  slug: string
  totalVehicles: number
  averagePrice: number | null
  highestPrice: number | null
  lowestPrice: number | null
  segments: Array<{ segment: string | null; count: number }>
  vehicles: BrandApiVehicle[]
  rankings: { mostExpensive: BrandApiVehicle[]; cheapest: BrandApiVehicle[] }
}

function toVehicle(row: BrandApiVehicle): Vehicle {
  return {
    id: row.slug, // card -> /carro/:slug
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

export class ApiBrandPageProvider implements BrandPageProvider {
  async getBrandPage(slug: string, signal?: AbortSignal): Promise<BrandPage | null> {
    const s = slug.trim()
    if (!s) return null
    const response = await fetch(`/api/brands/${encodeURIComponent(s)}`, { signal })
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Marca falhou (${response.status})`)
    const data = (await response.json()) as BrandApiResponse
    return {
      slug: data.slug,
      name: data.brand,
      totalVehicles: data.totalVehicles,
      averagePrice: data.averagePrice ?? 0,
      highestPrice: data.highestPrice ?? 0,
      lowestPrice: data.lowestPrice ?? 0,
      segments: data.segments.map((seg) => ({
        segment: seg.segment ?? SEM_SEGMENTO,
        count: seg.count,
      })),
      vehicles: data.vehicles.map(toVehicle),
      mostExpensive: data.rankings.mostExpensive.map(toVehicle),
      cheapest: data.rankings.cheapest.map(toVehicle),
    }
  }

  // Lista de marcas ainda não exposta por API; não usada na app.
  async listBrands(): Promise<BrandSummary[]> {
    return []
  }
}

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

export const brandPages: BrandPageProvider = useMock
  ? new MockBrandPageProvider()
  : new ApiBrandPageProvider()
