export type FenabraveBestFipeCandidate = {
  vehicle_id: number
  slug: string
  brand: string
  model: string
  segment: string | null
  latest_price: string | number | null
  latest_reference_month: string | null
  change_12m_pct: string | number | null
  similarity_score: string | number | null
}

export type FenabraveBestSellingVehicle = {
  rank: number
  brand_original: string
  model_original: string
  category: string
  registrations_month: number | null
  registrations_accumulated: number | null
  market_share_pct: string | null
  match_status: string
  best_fipe_candidate: FenabraveBestFipeCandidate | null
}

export type FenabraveBestSellingQuery = {
  limit?: number
}

export interface FenabraveRankingsProvider {
  getBestSelling(
    query?: FenabraveBestSellingQuery,
    signal?: AbortSignal,
  ): Promise<FenabraveBestSellingVehicle[]>
}

const DEFAULT_LIMIT = 50

export class ApiFenabraveRankingsProvider implements FenabraveRankingsProvider {
  async getBestSelling(
    query?: FenabraveBestSellingQuery,
    signal?: AbortSignal,
  ): Promise<FenabraveBestSellingVehicle[]> {
    const limit = query?.limit ?? DEFAULT_LIMIT
    const response = await fetch(
      `/api/fenabrave/rankings/mais-vendidos?limit=${encodeURIComponent(limit)}`,
      { signal },
    )
    if (!response.ok) {
      throw new Error(`Ranking Fenabrave falhou (${response.status})`)
    }
    return (await response.json()) as FenabraveBestSellingVehicle[]
  }
}

export const fenabraveRankings: FenabraveRankingsProvider =
  new ApiFenabraveRankingsProvider()
