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

export const vehicleSearch: VehicleSearchProvider = new MockVehicleSearchProvider()
