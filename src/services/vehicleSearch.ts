import { vehicles, type Vehicle } from '../data/mock/market'

export type VehicleSearchResult = Vehicle

/**
 * Contrato de busca de veiculos. Hoje resolvido com dados mockados; no futuro
 * basta implementar este mesmo contrato com `fetch` contra a API real e trocar
 * a instancia exportada em `vehicleSearch` — a UI nao muda.
 */
export interface VehicleSearchProvider {
  search(query: string, signal?: AbortSignal): Promise<VehicleSearchResult[]>
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove acentos
    .trim()

function matchesVehicle(vehicle: Vehicle, terms: string[]) {
  const haystack = normalize(
    `${vehicle.brand} ${vehicle.model} ${vehicle.version} ${vehicle.name} ${vehicle.fipeCode}`,
  )
  return terms.every((term) => haystack.includes(term))
}

/**
 * Provider que busca nos dados mockados. Async de proposito para espelhar o
 * formato de uma chamada de rede e ja respeitar cancelamento via AbortSignal.
 */
export class MockVehicleSearchProvider implements VehicleSearchProvider {
  private readonly source: Vehicle[]

  constructor(source: Vehicle[] = vehicles) {
    this.source = source
  }

  async search(query: string, signal?: AbortSignal): Promise<VehicleSearchResult[]> {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError')
    }

    const terms = normalize(query).split(/\s+/).filter(Boolean)
    if (terms.length === 0) {
      return []
    }

    return this.source.filter((vehicle) => matchesVehicle(vehicle, terms))
  }
}

/** Linha crua vinda de GET /api/vehicles/search (espelha vehicle_latest_prices). */
type VehicleSearchApiRow = {
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

/** Mapeia a linha da API para o formato Vehicle usado pela UI (id = slug). */
function toVehicle(row: VehicleSearchApiRow): VehicleSearchResult {
  return {
    id: row.slug, // navega para /carro/:slug
    name: `${row.brand} ${row.model}`,
    brand: row.brand,
    model: row.model,
    version: '',
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

/**
 * Provider real: consome GET /api/vehicles/search (servido pelo plugin Vite
 * contra a materialized view vehicle_latest_prices do banco fipe-v2).
 */
export class ApiVehicleSearchProvider implements VehicleSearchProvider {
  async search(query: string, signal?: AbortSignal): Promise<VehicleSearchResult[]> {
    const q = query.trim()
    if (!q) return []
    const response = await fetch(`/api/vehicles/search?q=${encodeURIComponent(q)}`, { signal })
    if (!response.ok) {
      throw new Error(`Busca falhou (${response.status})`)
    }
    const rows = (await response.json()) as VehicleSearchApiRow[]
    return rows.map(toVehicle)
  }
}

// Default: API real. Fallback para mock quando VITE_USE_MOCK === 'true'.
const useMock = import.meta.env.VITE_USE_MOCK === 'true'

export const vehicleSearch: VehicleSearchProvider = useMock
  ? new MockVehicleSearchProvider()
  : new ApiVehicleSearchProvider()
