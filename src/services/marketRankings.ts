import { vehicles, type Vehicle } from '../data/mock/market'
import { formatCurrency, formatPercent, numberFormatter } from '../utils/formatters'

export type RankingMetric =
  | 'appreciation'
  | 'depreciation'
  | 'stable'
  | 'volatile'
  | 'expensive'
  | 'cheap'

export type RankingTone = 'positive' | 'negative' | 'neutral'

export type RankingEntry = {
  vehicle: Vehicle
  value: number // valor bruto do criterio (para ordenacao/depuracao)
  formatted: string // valor ja formatado para exibicao
  tone: RankingTone
}

export type MarketRankings = Record<RankingMetric, RankingEntry[]>

export type MarketRankingsQuery = {
  limit?: number
}

/**
 * Contrato dos rankings de mercado. Hoje calculado em memoria a partir dos
 * mocks; no futuro pode virar `GET /market/rankings` — basta trocar a instancia
 * exportada em `marketRankings`, sem tocar no hook nem na UI.
 */
export interface MarketRankingsProvider {
  getRankings(query?: MarketRankingsQuery, signal?: AbortSignal): Promise<MarketRankings>
}

const DEFAULT_LIMIT = 5

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const formatVolatility = (value: number) => `${numberFormatter.format(value)}%`

type RankingSpec = {
  /** Campo numerico usado para ordenar. Veiculos sem esse dado sao ignorados. */
  getValue: (vehicle: Vehicle) => number | undefined
  direction: 'asc' | 'desc'
  format: (value: number) => string
  tone: (value: number) => RankingTone
}

const SPECS: Record<RankingMetric, RankingSpec> = {
  appreciation: {
    getValue: (v) => v.yearlyChange,
    direction: 'desc',
    format: formatPercent,
    tone: (value) => (value >= 0 ? 'positive' : 'negative'),
  },
  depreciation: {
    getValue: (v) => v.yearlyChange,
    direction: 'asc',
    format: formatPercent,
    tone: (value) => (value >= 0 ? 'positive' : 'negative'),
  },
  stable: {
    getValue: (v) => v.volatility,
    direction: 'asc',
    format: formatVolatility,
    tone: () => 'neutral',
  },
  volatile: {
    getValue: (v) => v.volatility,
    direction: 'desc',
    format: formatVolatility,
    tone: () => 'neutral',
  },
  expensive: {
    getValue: (v) => v.price,
    direction: 'desc',
    format: formatCurrency,
    tone: () => 'neutral',
  },
  cheap: {
    getValue: (v) => v.price,
    direction: 'asc',
    format: formatCurrency,
    tone: () => 'neutral',
  },
}

function buildRanking(source: Vehicle[], spec: RankingSpec, limit: number): RankingEntry[] {
  return source
    // Fallback limpo: descarta quem nao tem o dado, em vez de inventar numero.
    .map((vehicle) => ({ vehicle, value: spec.getValue(vehicle) }))
    .filter((entry): entry is { vehicle: Vehicle; value: number } => isFiniteNumber(entry.value))
    .sort((a, b) => (spec.direction === 'desc' ? b.value - a.value : a.value - b.value))
    .slice(0, limit)
    .map(({ vehicle, value }) => ({
      vehicle,
      value,
      formatted: spec.format(value),
      tone: spec.tone(value),
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
    const metrics = Object.keys(SPECS) as RankingMetric[]

    return metrics.reduce((acc, metric) => {
      acc[metric] = buildRanking(this.source, SPECS[metric], limit)
      return acc
    }, {} as MarketRankings)
  }
}

export const marketRankings: MarketRankingsProvider = new MockMarketRankingsProvider()
