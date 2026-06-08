import { vehicles, type Vehicle } from '../data/mock/market'
import { formatCurrency, formatPercent } from '../utils/formatters'
import { slugify } from '../utils/slug'

export type MarketPriceRankingKey =
  | 'topExpensive'
  | 'topAffordable'
  | 'suvTopExpensive'
  | 'sedanTopExpensive'
  | 'hatchTopAffordable'
  | 'pickupTopExpensive'

export type MarketChangeRankingKey =
  | 'topAppreciation'
  | 'topDepreciation'

export type MarketRankingKey = MarketPriceRankingKey | MarketChangeRankingKey

export type RankingTone = 'positive' | 'negative' | 'neutral'

export type RankingEntry = {
  vehicle: Vehicle
  value: number // valor bruto do criterio (para ordenacao/depuracao)
  formatted: string // valor ja formatado para exibicao
  tone: RankingTone
}

export type MarketRankings = Record<MarketRankingKey, RankingEntry[]>

export type MarketRankingsQuery = {
  limit?: number
}

/**
 * Contrato dos rankings reais disponíveis hoje: preço FIPE atual e variação
 * de 12 meses calculada em vehicle_price_changes.
 */
export interface MarketRankingsProvider {
  getRankings(query?: MarketRankingsQuery, signal?: AbortSignal): Promise<MarketRankings>
}

const DEFAULT_LIMIT = 5

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

type PriceRankingSpec = {
  direction: 'asc' | 'desc'
  segment?: string
}

type ChangeRankingSpec = {
  direction: 'asc' | 'desc'
  tone: RankingTone
  filter: (value: number) => boolean
}

const PRICE_SPECS: Record<MarketPriceRankingKey, PriceRankingSpec> = {
  topExpensive: {
    direction: 'desc',
  },
  topAffordable: {
    direction: 'asc',
  },
  suvTopExpensive: {
    direction: 'desc',
    segment: 'suv',
  },
  sedanTopExpensive: {
    direction: 'desc',
    segment: 'sedan',
  },
  hatchTopAffordable: {
    direction: 'asc',
    segment: 'hatch',
  },
  pickupTopExpensive: {
    direction: 'desc',
    segment: 'picape',
  },
}

const CHANGE_SPECS: Record<MarketChangeRankingKey, ChangeRankingSpec> = {
  topAppreciation: {
    direction: 'desc',
    tone: 'positive',
    filter: (value) => value > 0,
  },
  topDepreciation: {
    direction: 'asc',
    tone: 'negative',
    filter: (value) => value < 0,
  },
}

function buildPriceRanking(source: Vehicle[], spec: PriceRankingSpec, limit: number): RankingEntry[] {
  return source
    .filter((vehicle) => (spec.segment ? slugify(vehicle.segment) === spec.segment : true))
    .map((vehicle) => ({ vehicle, value: vehicle.price }))
    .filter((entry) => isFiniteNumber(entry.value))
    .sort((a, b) => (spec.direction === 'desc' ? b.value - a.value : a.value - b.value))
    .slice(0, limit)
    .map(({ vehicle, value }) => ({
      vehicle,
      value,
      formatted: formatCurrency(value),
      tone: 'neutral',
    }))
}

function buildChangeRanking(source: Vehicle[], spec: ChangeRankingSpec, limit: number): RankingEntry[] {
  return source
    .map((vehicle) => ({ vehicle, value: vehicle.yearlyChange }))
    .filter((entry) => isFiniteNumber(entry.value))
    .filter((entry) => spec.filter(entry.value))
    .sort((a, b) => (spec.direction === 'desc' ? b.value - a.value : a.value - b.value))
    .slice(0, limit)
    .map(({ vehicle, value }) => ({
      vehicle,
      value,
      formatted: formatPercent(value),
      tone: spec.tone,
    }))
}

export class MockMarketRankingsProvider implements MarketRankingsProvider {
  private readonly source: Vehicle[]

  constructor(source: Vehicle[] = vehicles) {
    this.source = source
  }

  async getRankings(query?: MarketRankingsQuery, signal?: AbortSignal): Promise<MarketRankings> {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError')
    }

    const limit = query?.limit ?? DEFAULT_LIMIT
    const priceMetrics = Object.keys(PRICE_SPECS) as MarketPriceRankingKey[]
    const changeMetrics = Object.keys(CHANGE_SPECS) as MarketChangeRankingKey[]

    const rankings = priceMetrics.reduce((acc, metric) => {
      acc[metric] = buildPriceRanking(this.source, PRICE_SPECS[metric], limit)
      return acc
    }, {} as MarketRankings)

    return changeMetrics.reduce((acc, metric) => {
      acc[metric] = buildChangeRanking(this.source, CHANGE_SPECS[metric], limit)
      return acc
    }, rankings)
  }
}

type MarketRankingApiRow = {
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

type MarketChangeRankingApiRow = MarketRankingApiRow & {
  current_price: string | null
  price_1m_ago: string | null
  price_6m_ago: string | null
  price_12m_ago: string | null
  change_1m_pct: string | null
  change_6m_pct: string | null
  change_12m_pct: string | null
}

type MarketRankingsApiResponse = Record<MarketPriceRankingKey, MarketRankingApiRow[]> &
  Record<MarketChangeRankingKey, MarketChangeRankingApiRow[]>

function toVehicle(row: MarketRankingApiRow): Vehicle {
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

function toRankingEntry(row: MarketRankingApiRow): RankingEntry {
  const vehicle = toVehicle(row)
  return {
    vehicle,
    value: vehicle.price,
    formatted: formatCurrency(vehicle.price),
    tone: 'neutral',
  }
}

function toChangeRankingEntry(row: MarketChangeRankingApiRow, tone: RankingTone): RankingEntry {
  const vehicle = toVehicle(row)
  const value = row.change_12m_pct != null ? Number(row.change_12m_pct) : 0
  return {
    vehicle,
    value,
    formatted: formatPercent(value),
    tone,
  }
}

export class ApiMarketRankingsProvider implements MarketRankingsProvider {
  async getRankings(query?: MarketRankingsQuery, signal?: AbortSignal): Promise<MarketRankings> {
    const limit = query?.limit ?? DEFAULT_LIMIT
    const response = await fetch(`/api/market/rankings?limit=${encodeURIComponent(limit)}`, { signal })
    if (!response.ok) {
      throw new Error(`Rankings falharam (${response.status})`)
    }
    const data = (await response.json()) as MarketRankingsApiResponse
    return {
      topExpensive: data.topExpensive.map(toRankingEntry),
      topAffordable: data.topAffordable.map(toRankingEntry),
      topAppreciation: data.topAppreciation.map((row) => toChangeRankingEntry(row, 'positive')),
      topDepreciation: data.topDepreciation.map((row) => toChangeRankingEntry(row, 'negative')),
      suvTopExpensive: data.suvTopExpensive.map(toRankingEntry),
      sedanTopExpensive: data.sedanTopExpensive.map(toRankingEntry),
      hatchTopAffordable: data.hatchTopAffordable.map(toRankingEntry),
      pickupTopExpensive: data.pickupTopExpensive.map(toRankingEntry),
    }
  }
}

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

export const marketRankings: MarketRankingsProvider = useMock
  ? new MockMarketRankingsProvider()
  : new ApiMarketRankingsProvider()

/** Monta uma entrada de ranking por preco FIPE (reuso em paginas). */
export function toPriceEntry(vehicle: Vehicle): RankingEntry {
  const value = isFiniteNumber(vehicle.price) ? vehicle.price : 0
  return {
    vehicle,
    value,
    formatted: formatCurrency(value),
    tone: 'neutral',
  }
}
