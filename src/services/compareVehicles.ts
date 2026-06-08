import { marketHistory, vehicles, type Vehicle } from '../data/mock/market'
import { formatCurrency, formatPercent, numberFormatter } from '../utils/formatters'

export type ComparedVehicle = {
  vehicle: Vehicle
  change1mPct: number | null
  change6mPct: number | null
  change12mPct: number | null
  priceHistory: ComparePricePoint[]
}

export type VehicleComparison = {
  base: ComparedVehicle
  target: ComparedVehicle
  comparison: ComparisonMetrics
}

export type ComparePricePoint = {
  referenceMonth: string
  price: number
}

export type ComparisonMetrics = {
  priceDifference: number | null
  priceDifferencePct: number | null
  better12mPerformer: string | null
  lowerPrice: string | null
  sameSegment: boolean
  sameBrand: boolean
}

export type PopularComparison = {
  label: string
  base: string
  target: string
}

const MOCK_POPULAR_COMPARISONS: PopularComparison[] = [
  { label: 'Corolla vs Civic', base: 'toyota-corolla-xei-2020', target: 'honda-civic-exl-2020' },
  { label: 'Compass vs T-Cross', base: 'jeep-compass-longitude-2021', target: 'volkswagen-tcross-highline-2021' },
  { label: 'HB20 vs Onix', base: 'hyundai-hb20-comfort-2022', target: 'chevrolet-onix-premier-2021' },
]

const API_POPULAR_COMPARISONS: PopularComparison[] = [
  {
    label: 'Corolla vs Civic',
    base: 'toyota-corolla-xei-2-0-flex-16v-aut-2020-flex',
    target: 'honda-civic-sedan-exl-2-0-flex-16v-aut-4p-2020-flex',
  },
  {
    label: 'Compass vs T-Cross',
    base: 'jeep-compass-longitude-2-0-4x2-flex-16v-aut-2021-flex',
    target: 'vw-volkswagen-t-cross-hig-250-tsi-1-4-flex-16v-5p-aut-2021-flex',
  },
]

/**
 * Contrato de comparacao de veiculos. API real por padrao; mock como fallback
 * quando VITE_USE_MOCK=true.
 */
export interface CompareVehiclesProvider {
  compare(
    baseSlug: string,
    targetSlug: string,
    signal?: AbortSignal,
  ): Promise<VehicleComparison | null>
}

export class MockCompareVehiclesProvider implements CompareVehiclesProvider {
  private readonly source: Vehicle[]

  constructor(source: Vehicle[] = vehicles) {
    this.source = source
  }

  async compare(
    baseSlug: string,
    targetSlug: string,
    signal?: AbortSignal,
  ): Promise<VehicleComparison | null> {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

    const base = this.source.find((vehicle) => vehicle.id === baseSlug)
    const target = this.source.find((vehicle) => vehicle.id === targetSlug)
    if (!base || !target) return null

    const baseEntry = toMockComparedVehicle(base)
    const targetEntry = toMockComparedVehicle(target)

    return {
      base: baseEntry,
      target: targetEntry,
      comparison: compareMockVehicles(baseEntry, targetEntry),
    }
  }
}

type ApiPricePoint = {
  reference_month: string
  price: string
}

type ApiCompareVehicle = {
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
  change_1m_pct: string | null
  change_6m_pct: string | null
  change_12m_pct: string | null
  price_history: ApiPricePoint[]
}

type ApiComparisonMetrics = {
  price_difference: number | null
  price_difference_pct: number | null
  better_12m_performer: string | null
  lower_price: string | null
  same_segment: boolean
  same_brand: boolean
}

type ApiCompareResponse = {
  base: ApiCompareVehicle
  target: ApiCompareVehicle
  comparison: ApiComparisonMetrics
}

function numberOrNull(value: string | number | null): number | null {
  if (value == null) return null
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function toApiComparedVehicle(row: ApiCompareVehicle): ComparedVehicle {
  const latestPrice = numberOrNull(row.latest_price)
  const change1mPct = numberOrNull(row.change_1m_pct)
  const change6mPct = numberOrNull(row.change_6m_pct)
  const change12mPct = numberOrNull(row.change_12m_pct)

  return {
    vehicle: {
      id: row.slug,
      name: `${row.brand} ${row.model}`,
      brand: row.brand,
      model: row.model,
      version: row.fuel,
      year: row.model_year ?? 0,
      segment: row.segment ?? '',
      fipeCode: row.fipe_code,
      price: latestPrice ?? 0,
      monthlyChange: change1mPct ?? 0,
      yearlyChange: change12mPct ?? 0,
      liquidity: 0,
      volatility: 0,
      marketRank: 0,
    },
    change1mPct,
    change6mPct,
    change12mPct,
    priceHistory: row.price_history.map((point) => ({
      referenceMonth: point.reference_month,
      price: Number(point.price),
    })),
  }
}

function toComparisonMetrics(row: ApiComparisonMetrics): ComparisonMetrics {
  return {
    priceDifference: row.price_difference,
    priceDifferencePct: row.price_difference_pct,
    better12mPerformer: row.better_12m_performer,
    lowerPrice: row.lower_price,
    sameSegment: row.same_segment,
    sameBrand: row.same_brand,
  }
}

export class ApiCompareVehiclesProvider implements CompareVehiclesProvider {
  async compare(
    baseSlug: string,
    targetSlug: string,
    signal?: AbortSignal,
  ): Promise<VehicleComparison | null> {
    const base = baseSlug.trim()
    const target = targetSlug.trim()
    if (!base || !target) return null

    const response = await fetch(
      `/api/compare?base=${encodeURIComponent(base)}&target=${encodeURIComponent(target)}`,
      { signal },
    )
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Comparacao falhou (${response.status})`)

    const data = (await response.json()) as ApiCompareResponse
    return {
      base: toApiComparedVehicle(data.base),
      target: toApiComparedVehicle(data.target),
      comparison: toComparisonMetrics(data.comparison),
    }
  }
}

function toMockComparedVehicle(vehicle: Vehicle): ComparedVehicle {
  const baseIfb = marketHistory[marketHistory.length - 1]?.ifb ?? 100
  return {
    vehicle,
    change1mPct: vehicle.monthlyChange,
    change6mPct: null,
    change12mPct: vehicle.yearlyChange,
    priceHistory: marketHistory.map((point, index) => ({
      referenceMonth: `2024-${String(index + 1).padStart(2, '0')}-01`,
      price: Math.round(vehicle.price * (point.ifb / baseIfb)),
    })),
  }
}

function compareMockVehicles(base: ComparedVehicle, target: ComparedVehicle): ComparisonMetrics {
  const priceDifference = base.vehicle.price - target.vehicle.price
  const priceDifferencePct = target.vehicle.price === 0
    ? null
    : (priceDifference / target.vehicle.price) * 100
  const better12mPerformer =
    base.change12mPct == null || target.change12mPct == null || base.change12mPct === target.change12mPct
      ? null
      : base.change12mPct > target.change12mPct
        ? base.vehicle.id
        : target.vehicle.id
  const lowerPrice = base.vehicle.price === target.vehicle.price
    ? null
    : base.vehicle.price < target.vehicle.price
      ? base.vehicle.id
      : target.vehicle.id

  return {
    priceDifference,
    priceDifferencePct,
    better12mPerformer,
    lowerPrice,
    sameSegment: base.vehicle.segment === target.vehicle.segment,
    sameBrand: base.vehicle.brand === target.vehicle.brand,
  }
}

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

export const popularComparisons: PopularComparison[] = useMock
  ? MOCK_POPULAR_COMPARISONS
  : API_POPULAR_COMPARISONS

export const compareVehicles: CompareVehiclesProvider = useMock
  ? new MockCompareVehiclesProvider()
  : new ApiCompareVehiclesProvider()

/**
 * Resumo automatico factual. Sem forecast e sem recomendacao de compra/venda.
 */
export function buildComparisonSummary(comparison: VehicleComparison): string[] {
  const lines: string[] = []
  const { base, target } = comparison

  const priceDiff = comparison.comparison.priceDifference
  if (priceDiff == null) {
    lines.push('Preco atual insuficiente para calcular diferenca.')
  } else if (priceDiff === 0) {
    lines.push('Ambos tem o mesmo preco FIPE.')
  } else {
    const higher = priceDiff > 0 ? base.vehicle : target.vehicle
    lines.push(`${higher.model} custa ${formatCurrency(Math.abs(priceDiff))} a mais.`)
  }

  if (base.change12mPct == null || target.change12mPct == null) {
    lines.push('Historico insuficiente para comparar variacao em 12 meses.')
  } else if (base.change12mPct === target.change12mPct) {
    lines.push('Variacao em 12 meses equivalente.')
  } else {
    const winner = base.change12mPct > target.change12mPct ? base : target
    const other = base.change12mPct > target.change12mPct ? target : base
    const diff = Math.abs(base.change12mPct - target.change12mPct)
    lines.push(
      `${winner.vehicle.model} teve variacao 12m ${numberFormatter.format(diff)} p.p. acima do ${other.vehicle.model}.`,
    )
  }

  lines.push(
    comparison.comparison.sameSegment
      ? 'Os dois veiculos estao no mesmo segmento.'
      : 'Os veiculos pertencem a segmentos diferentes.',
  )

  return lines
}

export function formatChange(value: number | null): string {
  return value == null ? 'Historico insuficiente' : formatPercent(value)
}
