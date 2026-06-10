import { vehicles, type Vehicle } from '../data/mock/market'
import { slugify } from '../utils/slug'

export type CategoryBrandCount = {
  brand: string
  count: number
}

export type CategoryPage = {
  slug: string
  segment: string // canônico (suv, sedan, ...)
  name: string // rótulo de exibição (SUV, Sedã, ...)
  totalVehicles: number
  averagePrice: number
  highestPrice: number
  lowestPrice: number
  brands: CategoryBrandCount[]
  vehicles: Vehicle[] // amostra (mais caro -> mais barato)
  topExpensive: Vehicle[]
  topAffordable: Vehicle[]
}

export type CategorySummary = {
  slug: string
  name: string
  vehicleCount: number
}

const CATEGORY_LABEL: Record<string, string> = {
  suv: 'SUV',
  sedan: 'Sedã',
  hatch: 'Hatch',
  picape: 'Picape',
  perua: 'Perua',
  minivan: 'Minivan',
  cupe: 'Cupê',
  conversivel: 'Conversível',
  furgao: 'Furgão',
  buggy: 'Buggy',
}

export function categoryLabel(segment: string): string {
  return CATEGORY_LABEL[segment] ?? segment
}

/**
 * Contrato das páginas de categoria/segmento. API real (GET /api/categories/:slug)
 * por padrão; mock como fallback (VITE_USE_MOCK=true). Não inventa valorização.
 */
export interface CategoryPageProvider {
  getCategoryPage(slug: string, signal?: AbortSignal): Promise<CategoryPage | null>
  listCategories(signal?: AbortSignal): Promise<CategorySummary[]>
}

const DEFAULT_HIGHLIGHT = 5

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const average = (values: number[]) =>
  values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length

export class MockCategoryPageProvider implements CategoryPageProvider {
  private readonly source: Vehicle[]

  constructor(source: Vehicle[] = vehicles) {
    this.source = source
  }

  async getCategoryPage(slug: string, signal?: AbortSignal): Promise<CategoryPage | null> {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

    const matches = this.source.filter((vehicle) => slugify(vehicle.segment) === slug)
    if (matches.length === 0) return null

    const prices = matches.map((v) => v.price).filter(isFiniteNumber)
    const byPriceDesc = [...matches].sort((a, b) => b.price - a.price)

    const brandMap = new Map<string, number>()
    for (const v of matches) brandMap.set(v.brand, (brandMap.get(v.brand) ?? 0) + 1)

    const segment = slugify(matches[0].segment)
    return {
      slug,
      segment,
      name: categoryLabel(segment),
      totalVehicles: matches.length,
      averagePrice: average(prices),
      highestPrice: prices.length ? Math.max(...prices) : 0,
      lowestPrice: prices.length ? Math.min(...prices) : 0,
      brands: [...brandMap.entries()]
        .map(([brand, count]) => ({ brand, count }))
        .sort((a, b) => b.count - a.count),
      vehicles: byPriceDesc.slice(0, 24),
      topExpensive: byPriceDesc.slice(0, DEFAULT_HIGHLIGHT),
      topAffordable: [...byPriceDesc].reverse().slice(0, DEFAULT_HIGHLIGHT),
    }
  }

  async listCategories(signal?: AbortSignal): Promise<CategorySummary[]> {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

    const counts = new Map<string, CategorySummary>()
    for (const vehicle of this.source) {
      const slug = slugify(vehicle.segment)
      const existing = counts.get(slug)
      if (existing) existing.vehicleCount += 1
      else counts.set(slug, { slug, name: categoryLabel(slug), vehicleCount: 1 })
    }
    return [...counts.values()].sort((a, b) => a.name.localeCompare(b.name))
  }
}

// ---------------------------------------------------------------------------
// Provider real (API)
// ---------------------------------------------------------------------------
type CategoryApiVehicle = {
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

type CategoryApiResponse = {
  category: string
  slug: string
  totalVehicles: number
  averagePrice: number | null
  highestPrice: number | null
  lowestPrice: number | null
  brands: Array<{ brand: string; count: number }>
  vehicles: CategoryApiVehicle[]
  topExpensive: CategoryApiVehicle[]
  topAffordable: CategoryApiVehicle[]
}

function toVehicle(row: CategoryApiVehicle): Vehicle {
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

export class ApiCategoryPageProvider implements CategoryPageProvider {
  async getCategoryPage(slug: string, signal?: AbortSignal): Promise<CategoryPage | null> {
    const s = slug.trim()
    if (!s) return null
    const response = await fetch(`/api/categories/${encodeURIComponent(s)}`, { signal })
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Categoria falhou (${response.status})`)
    const data = (await response.json()) as CategoryApiResponse
    return {
      slug: data.slug,
      segment: data.category,
      name: categoryLabel(data.category),
      totalVehicles: data.totalVehicles,
      averagePrice: data.averagePrice ?? 0,
      highestPrice: data.highestPrice ?? 0,
      lowestPrice: data.lowestPrice ?? 0,
      brands: data.brands,
      vehicles: data.vehicles.map(toVehicle),
      topExpensive: data.topExpensive.map(toVehicle),
      topAffordable: data.topAffordable.map(toVehicle),
    }
  }

  // Lista de categorias ainda não exposta por API; não usada na app.
  async listCategories(): Promise<CategorySummary[]> {
    return []
  }
}

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

export const categoryPages: CategoryPageProvider = useMock
  ? new MockCategoryPageProvider()
  : new ApiCategoryPageProvider()
