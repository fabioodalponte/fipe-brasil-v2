import { useEffect, useState } from 'react'
import {
  fenabraveRankings,
  type FenabraveBestSellingVehicle,
} from '../services/fenabraveRankings'

type UseFenabraveBestSellingResult = {
  vehicles: FenabraveBestSellingVehicle[]
  loading: boolean
  error: boolean
}

type State = {
  vehicles: FenabraveBestSellingVehicle[]
  loading: boolean
  error: boolean
}

const INITIAL: State = {
  vehicles: [],
  loading: true,
  error: false,
}

export function useFenabraveBestSelling(limit = 50): UseFenabraveBestSellingResult {
  const [state, setState] = useState<State>(INITIAL)

  useEffect(() => {
    const controller = new AbortController()

    fenabraveRankings
      .getBestSelling({ limit }, controller.signal)
      .then((vehicles) => {
        if (controller.signal.aborted) return
        setState({ vehicles, loading: false, error: false })
      })
      .catch((err) => {
        if (controller.signal.aborted || (err as Error).name === 'AbortError') return
        setState({ vehicles: [], loading: false, error: true })
      })

    return () => controller.abort()
  }, [limit])

  return state
}
