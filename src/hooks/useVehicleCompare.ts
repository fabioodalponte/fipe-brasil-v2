import { useEffect, useState } from 'react'
import { compareVehicles, type VehicleComparison } from '../services/compareVehicles'

type UseVehicleCompareResult = {
  comparison: VehicleComparison | null
  loading: boolean
  error: boolean
  notFound: boolean
}

type ResolvedState = {
  key: string | null
  comparison: VehicleComparison | null
  error: boolean
}

const EMPTY: ResolvedState = { key: null, comparison: null, error: false }

/**
 * Resolve a comparacao entre dois veiculos via provider (API real ou mock),
 * cancelando a requisicao anterior quando os slugs mudam. Estados derivados —
 * sem setState sincrono no efeito.
 */
export function useVehicleCompare(
  baseSlug: string | null,
  targetSlug: string | null,
): UseVehicleCompareResult {
  const key = baseSlug && targetSlug ? `${baseSlug}|${targetSlug}` : ''
  const [resolved, setResolved] = useState<ResolvedState>(EMPTY)

  useEffect(() => {
    if (!baseSlug || !targetSlug) return

    const controller = new AbortController()

    compareVehicles
      .compare(baseSlug, targetSlug, controller.signal)
      .then((comparison) => {
        if (controller.signal.aborted) return
        setResolved({ key: `${baseSlug}|${targetSlug}`, comparison, error: false })
      })
      .catch((err) => {
        if (controller.signal.aborted || (err as Error).name === 'AbortError') return
        setResolved({ key: `${baseSlug}|${targetSlug}`, comparison: null, error: true })
      })

    return () => controller.abort()
  }, [baseSlug, targetSlug])

  const settled = !!key && resolved.key === key

  return {
    comparison: settled ? resolved.comparison : null,
    loading: !!key && !settled,
    error: settled && resolved.error,
    notFound: settled && !resolved.error && resolved.comparison === null,
  }
}
