import { vehicles, type Vehicle } from '../data/mock/market'
import { slugify } from '../utils/slug'

export type BrandPage = {
  slug: string
  name: string
  vehicleCount: number
  averagePrice: number
  topAppreciation: Vehicle | null
  topDepreciation: Vehicle | null // so quando existe variacao 12m negativa
  vehicles: Vehicle[] // lista da marca, do mais caro ao mais barato
  ranking: Vehicle[] // veiculos da marca por valorizacao 12m (desc)
}

export type BrandSummary = {
  slug: string
  name: string
  vehicleCount: number
}

/**
 * Contrato das paginas de marca. Hoje resolvido em memoria com os mocks; no
 * futuro pode virar `GET /brands/:slug` — basta trocar a instancia exportada
 * em `brandPages`, sem tocar nos hooks nem na UI.
 */
export interface BrandPageProvider {
  getBrandPage(slug: string, signal?: AbortSignal): Promise<BrandPage | null>
  listBrands(signal?: AbortSignal): Promise<BrandSummary[]>
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const average = (values: number[]) =>
  values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length

export class MockBrandPageProvider implements BrandPageProvider {
  private readonly source: Vehicle[]

  constructor(source: Vehicle[] = vehicles) {
    this.source = source
  }

  async getBrandPage(slug: string, signal?: AbortSignal): Promise<BrandPage | null> {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

    const matches = this.source.filter((vehicle) => slugify(vehicle.brand) === slug)
    if (matches.length === 0) return null

    const averagePrice = average(matches.map((v) => v.price).filter(isFiniteNumber))

    const byYearly = matches
      .filter((v) => isFiniteNumber(v.yearlyChange))
      .sort((a, b) => b.yearlyChange - a.yearlyChange)

    const lowest = byYearly[byYearly.length - 1] ?? null

    return {
      slug,
      name: matches[0].brand,
      vehicleCount: matches.length,
      averagePrice,
      topAppreciation: byYearly[0] ?? null,
      topDepreciation: lowest && lowest.yearlyChange < 0 ? lowest : null,
      vehicles: [...matches].sort((a, b) => b.price - a.price),
      ranking: byYearly,
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

export const brandPages: BrandPageProvider = new MockBrandPageProvider()
