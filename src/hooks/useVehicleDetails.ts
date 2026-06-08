import { useEffect, useState } from 'react'
import { vehicleDetails, type VehicleDetails } from '../services/vehicleDetails'

export type VehicleDetailsStatus = 'idle' | 'loading' | 'done' | 'notfound' | 'error'

type ResolvedState = {
  slug: string | null
  details: VehicleDetails | null
  notfound: boolean
  error: boolean
}

const EMPTY: ResolvedState = { slug: null, details: null, notfound: false, error: false }

/**
 * Carrega os detalhes de um veículo por slug via provider (API real ou mock),
 * cancelando a requisição anterior quando o slug muda. Estados derivados para
 * evitar setState síncrono no efeito (mesmo padrão de useVehicleSearch).
 */
export function useVehicleDetails(slug: string | undefined): {
  details: VehicleDetails | null
  status: VehicleDetailsStatus
} {
  const [resolved, setResolved] = useState<ResolvedState>(EMPTY)

  useEffect(() => {
    if (!slug) return

    const controller = new AbortController()

    vehicleDetails
      .getBySlug(slug, controller.signal)
      .then((found) => {
        if (controller.signal.aborted) return
        setResolved({ slug, details: found, notfound: found === null, error: false })
      })
      .catch((error) => {
        if (controller.signal.aborted || (error as Error).name === 'AbortError') return
        setResolved({ slug, details: null, notfound: false, error: true })
      })

    return () => controller.abort()
  }, [slug])

  const settled = resolved.slug === slug && !!slug

  const status: VehicleDetailsStatus = !slug
    ? 'idle'
    : !settled
      ? 'loading'
      : resolved.error
        ? 'error'
        : resolved.notfound
          ? 'notfound'
          : 'done'

  return { details: settled && !resolved.error ? resolved.details : null, status }
}
