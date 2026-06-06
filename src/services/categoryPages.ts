import { vehicles, type Vehicle } from '../data/mock/market'
import { slugify } from '../utils/slug'

export type CategoryPage = {
  slug: string
  name: string
  vehicleCount: number
  averagePrice: number
  averageYearlyChange: number
  mostAppreciated: Vehicle[] // por valorizacao 12m (desc)
  cheapest: Vehicle[] // por preco (asc)
  vehicles: Vehicle[] // lista da categoria, do mais caro ao mais barato
}

export type CategorySummary = {
  slug: string
  name: string
  vehicleCount: number
}

/**
 * Contrato das paginas de categoria/segmento. Hoje resolvido em memoria com os
 * mocks; no futuro pode virar `GET /categories/:slug` — basta trocar a
 * instancia exportada em `categoryPages`, sem tocar nos hooks nem na UI.
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

    const averagePrice = average(matches.map((v) => v.price).filter(isFiniteNumber))
    const averageYearlyChange = average(matches.map((v) => v.yearlyChange).filter(isFiniteNumber))

    const mostAppreciated = matches
      .filter((v) => isFiniteNumber(v.yearlyChange))
      .sort((a, b) => b.yearlyChange - a.yearlyChange)
      .slice(0, DEFAULT_HIGHLIGHT)

    const cheapest = matches
      .filter((v) => isFiniteNumber(v.price))
      .sort((a, b) => a.price - b.price)
      .slice(0, DEFAULT_HIGHLIGHT)

    return {
      slug,
      name: matches[0].segment,
      vehicleCount: matches.length,
      averagePrice,
      averageYearlyChange,
      mostAppreciated,
      cheapest,
      vehicles: [...matches].sort((a, b) => b.price - a.price),
    }
  }

  async listCategories(signal?: AbortSignal): Promise<CategorySummary[]> {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

    const counts = new Map<string, CategorySummary>()
    for (const vehicle of this.source) {
      const slug = slugify(vehicle.segment)
      const existing = counts.get(slug)
      if (existing) existing.vehicleCount += 1
      else counts.set(slug, { slug, name: vehicle.segment, vehicleCount: 1 })
    }
    return [...counts.values()].sort((a, b) => a.name.localeCompare(b.name))
  }
}

export const categoryPages: CategoryPageProvider = new MockCategoryPageProvider()
