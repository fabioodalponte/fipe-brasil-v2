import { marketHistory, vehicles } from '../data/mock/market'

export type PricePoint = {
  /** 'YYYY-MM-DD' (dia 01). */
  referenceMonth: string
  price: number
}

export type VehicleDetails = {
  vehicleId: number
  slug: string
  fipeCode: string
  brand: string
  model: string
  modelYear: number | null
  isZeroKm: boolean
  fuel: string
  vehicleType: string | null
  segment: string | null
  latestPrice: number | null
  latestReferenceMonth: string | null
  segmentSource: string | null
  segmentConfidence: string | null
  priceHistory: PricePoint[]
}

export interface VehicleDetailsProvider {
  /** Resolve detalhes por slug; null quando não existe. */
  getBySlug(slug: string, signal?: AbortSignal): Promise<VehicleDetails | null>
}

// ---------------------------------------------------------------------------
// Análise derivada do histórico (variações/volatilidade reais, sem inventar).
// ---------------------------------------------------------------------------
export type PriceAnalysis = {
  monthlyChange: number | null
  yearlyChange: number | null
  volatility: number | null
  min: number | null
  max: number | null
}

const pct = (curr: number, prev: number) => (prev === 0 ? 0 : ((curr - prev) / prev) * 100)

export function analyzePriceHistory(history: PricePoint[]): PriceAnalysis {
  const prices = history.map((p) => p.price).filter((n) => Number.isFinite(n))
  if (prices.length === 0) {
    return { monthlyChange: null, yearlyChange: null, volatility: null, min: null, max: null }
  }
  const last = prices[prices.length - 1]
  const prev = prices.length >= 2 ? prices[prices.length - 2] : null
  const yearAgo = prices.length >= 13 ? prices[prices.length - 13] : prices[0]

  // Volatilidade = desvio-padrão dos retornos mensais (%).
  const returns: number[] = []
  for (let i = 1; i < prices.length; i += 1) returns.push(pct(prices[i], prices[i - 1]))
  let volatility: number | null = null
  if (returns.length > 0) {
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length
    const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length
    volatility = Math.sqrt(variance)
  }

  return {
    monthlyChange: prev != null ? pct(last, prev) : null,
    yearlyChange: prices.length >= 2 ? pct(last, yearAgo) : null,
    volatility,
    min: Math.min(...prices),
    max: Math.max(...prices),
  }
}

// ---------------------------------------------------------------------------
// Provider real (API)
// ---------------------------------------------------------------------------
type ApiPricePoint = { reference_month: string; price: string }
type ApiVehicleDetails = {
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
  segment_source: string | null
  segment_confidence: string | null
  price_history: ApiPricePoint[]
}

function fromApi(row: ApiVehicleDetails): VehicleDetails {
  return {
    vehicleId: row.vehicle_id,
    slug: row.slug,
    fipeCode: row.fipe_code,
    brand: row.brand,
    model: row.model,
    modelYear: row.model_year,
    isZeroKm: row.is_zero_km,
    fuel: row.fuel,
    vehicleType: row.vehicle_type,
    segment: row.segment,
    latestPrice: row.latest_price != null ? Number(row.latest_price) : null,
    latestReferenceMonth: row.latest_reference_month,
    segmentSource: row.segment_source,
    segmentConfidence: row.segment_confidence,
    priceHistory: row.price_history.map((p) => ({
      referenceMonth: p.reference_month,
      price: Number(p.price),
    })),
  }
}

export class ApiVehicleDetailsProvider implements VehicleDetailsProvider {
  async getBySlug(slug: string, signal?: AbortSignal): Promise<VehicleDetails | null> {
    const s = slug.trim()
    if (!s) return null
    const response = await fetch(`/api/vehicles/${encodeURIComponent(s)}`, { signal })
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Detalhes falharam (${response.status})`)
    return fromApi((await response.json()) as ApiVehicleDetails)
  }
}

// ---------------------------------------------------------------------------
// Provider mock (fallback dev) — sintetiza histórico a partir do marketHistory
// ---------------------------------------------------------------------------
export class MockVehicleDetailsProvider implements VehicleDetailsProvider {
  async getBySlug(slug: string, signal?: AbortSignal): Promise<VehicleDetails | null> {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    const v = vehicles.find((item) => item.id === slug)
    if (!v) return null
    const baseIfb = marketHistory[marketHistory.length - 1]?.ifb ?? 100
    const history: PricePoint[] = marketHistory.map((point, index) => ({
      referenceMonth: `2024-${String(index + 1).padStart(2, '0')}-01`,
      price: Math.round(v.price * (point.ifb / baseIfb)),
    }))
    return {
      vehicleId: -1,
      slug: v.id,
      fipeCode: v.fipeCode,
      brand: v.brand,
      model: v.model,
      modelYear: v.year,
      isZeroKm: false,
      fuel: 'Flex',
      vehicleType: 'carro',
      segment: v.segment,
      latestPrice: v.price,
      latestReferenceMonth: history[history.length - 1]?.referenceMonth ?? null,
      segmentSource: 'mock',
      segmentConfidence: 'alta',
      priceHistory: history,
    }
  }
}

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

export const vehicleDetails: VehicleDetailsProvider = useMock
  ? new MockVehicleDetailsProvider()
  : new ApiVehicleDetailsProvider()
