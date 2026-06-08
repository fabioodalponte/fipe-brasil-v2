import { useEffect, useState } from 'react'
import type { Vehicle } from '../data/mock/market'
import { getHomeVehicles, type HomeVehicleFilters } from '../services/homeVehicles'

type UseHomeVehiclesResult = {
  vehicles: Vehicle[]
  loading: boolean
  error: boolean
}

type State = {
  vehicles: Vehicle[]
  loading: boolean
  error: boolean
}

const INITIAL: State = { vehicles: [], loading: true, error: false }

export function useHomeVehicles(filters: HomeVehicleFilters): UseHomeVehiclesResult {
  const [state, setState] = useState<State>(INITIAL)
  const { brand = '', segment = '', minPrice, maxPrice } = filters

  useEffect(() => {
    const controller = new AbortController()

    getHomeVehicles(
      {
        brand: brand || undefined,
        segment: segment || undefined,
        minPrice,
        maxPrice,
      },
      controller.signal,
    )
      .then((vehicles) => {
        if (controller.signal.aborted) return
        setState({ vehicles, loading: false, error: false })
      })
      .catch((error) => {
        if (controller.signal.aborted || (error as Error).name === 'AbortError') return
        setState({ vehicles: [], loading: false, error: true })
      })

    return () => controller.abort()
  }, [brand, segment, minPrice, maxPrice])

  return {
    vehicles: state.vehicles,
    loading: state.loading,
    error: state.error,
  }
}
