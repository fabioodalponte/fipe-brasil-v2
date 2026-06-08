import { useEffect, useState } from 'react'
import {
  fenabraveRankings,
  type FenabraveSegmentRankingVehicle,
  type FenabraveSegmentSlug,
} from '../services/fenabraveRankings'

type UseFenabraveSegmentRankingResult = {
  vehicles: FenabraveSegmentRankingVehicle[]
  loading: boolean
  error: boolean
}

type State = {
  vehicles: FenabraveSegmentRankingVehicle[]
  loading: boolean
  error: boolean
}

const INITIAL: State = {
  vehicles: [],
  loading: true,
  error: false,
}

export function useFenabraveSegmentRanking(
  segment: FenabraveSegmentSlug,
  limit = 50,
): UseFenabraveSegmentRankingResult {
  const [state, setState] = useState<State>(INITIAL)

  useEffect(() => {
    const controller = new AbortController()

    fenabraveRankings
      .getSegmentRanking(segment, { limit }, controller.signal)
      .then((vehicles) => {
        if (controller.signal.aborted) return
        setState({ vehicles, loading: false, error: false })
      })
      .catch((err) => {
        if (controller.signal.aborted || (err as Error).name === 'AbortError') return
        setState({ vehicles: [], loading: false, error: true })
      })

    return () => controller.abort()
  }, [segment, limit])

  return state
}
