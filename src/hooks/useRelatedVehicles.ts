import { useEffect, useState } from 'react'
import type { Vehicle } from '../data/mock/market'
import { relatedVehicles } from '../services/relatedVehicles'

type UseRelatedVehiclesResult = {
  vehicles: Vehicle[]
  loading: boolean
  error: boolean
}

type ResolvedState = {
  id: string | null
  vehicles: Vehicle[]
  error: boolean
}

const EMPTY: ResolvedState = { id: null, vehicles: [], error: false }

/**
 * Busca os veiculos relacionados ao veiculo atual via provider (mock hoje,
 * API amanha), cancelando a requisicao anterior quando o veiculo muda.
 * `loading`/`error` sao derivados para evitar setState sincrono no efeito.
 */
export function useRelatedVehicles(
  vehicle: Vehicle | undefined,
  limit = 4,
): UseRelatedVehiclesResult {
  const vehicleId = vehicle?.id
  const [resolved, setResolved] = useState<ResolvedState>(EMPTY)

  useEffect(() => {
    if (!vehicleId) return

    const controller = new AbortController()

    relatedVehicles
      .getRelated(vehicleId, { limit }, controller.signal)
      .then((found) => {
        if (controller.signal.aborted) return
        setResolved({ id: vehicleId, vehicles: found, error: false })
      })
      .catch((err) => {
        if (controller.signal.aborted || (err as Error).name === 'AbortError') return
        setResolved({ id: vehicleId, vehicles: [], error: true })
      })

    return () => controller.abort()
  }, [vehicleId, limit])

  const settled = !!vehicleId && resolved.id === vehicleId

  return {
    vehicles: settled ? resolved.vehicles : [],
    loading: !!vehicleId && !settled,
    error: settled && resolved.error,
  }
}
