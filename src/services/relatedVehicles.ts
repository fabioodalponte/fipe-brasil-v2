import { vehicles, type Vehicle } from '../data/mock/market'

export type RelatedVehiclesQuery = {
  limit?: number
}

/**
 * Contrato de "veiculos relacionados". Hoje resolvido em memoria com os mocks;
 * no futuro o mesmo contrato pode ser atendido por um endpoint
 * `GET /vehicles/:id/related` — basta trocar a instancia exportada em
 * `relatedVehicles`, sem tocar no hook nem na UI.
 */
export interface RelatedVehiclesProvider {
  getRelated(
    vehicleId: string,
    query?: RelatedVehiclesQuery,
    signal?: AbortSignal,
  ): Promise<Vehicle[]>
}

const DEFAULT_LIMIT = 4

/**
 * Pontua o quao proximo um candidato esta do veiculo base. Pesos: marca e
 * segmento dominam; faixa de preco e ano de fabricacao desempatam/refinam.
 */
function relatednessScore(base: Vehicle, candidate: Vehicle): number {
  let score = 0

  if (candidate.brand === base.brand) score += 40
  if (candidate.segment === base.segment) score += 30

  // Proximidade de preco: ate ~20% de diferenca ainda contribui.
  const priceDelta = Math.abs(candidate.price - base.price) / base.price
  score += Math.max(0, 20 - priceDelta * 100)

  // Proximidade de ano: mesmo ano vale 10, cai 5 por ano de distancia.
  const yearDelta = Math.abs(candidate.year - base.year)
  score += Math.max(0, 10 - yearDelta * 5)

  return score
}

export class MockRelatedVehiclesProvider implements RelatedVehiclesProvider {
  private readonly source: Vehicle[]

  constructor(source: Vehicle[] = vehicles) {
    this.source = source
  }

  async getRelated(
    vehicleId: string,
    query?: RelatedVehiclesQuery,
    signal?: AbortSignal,
  ): Promise<Vehicle[]> {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError')
    }

    const base = this.source.find((vehicle) => vehicle.id === vehicleId)
    if (!base) return []

    const limit = query?.limit ?? DEFAULT_LIMIT

    return this.source
      .filter((vehicle) => vehicle.id !== base.id) // exclui o proprio veiculo
      .map((vehicle) => ({ vehicle, score: relatednessScore(base, vehicle) }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        // Desempate: preco mais proximo primeiro.
        return Math.abs(a.vehicle.price - base.price) - Math.abs(b.vehicle.price - base.price)
      })
      .slice(0, limit)
      .map((entry) => entry.vehicle)
  }
}

export const relatedVehicles: RelatedVehiclesProvider = new MockRelatedVehiclesProvider()
