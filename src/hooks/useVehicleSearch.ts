import { useEffect, useState } from 'react'
import { vehicleSearch, type VehicleSearchResult } from '../services/vehicleSearch'
import { useDebouncedValue } from './useDebouncedValue'

export type SearchStatus = 'idle' | 'loading' | 'done' | 'error'

type UseVehicleSearchResult = {
  results: VehicleSearchResult[]
  status: SearchStatus
}

type ResolvedState = {
  query: string
  results: VehicleSearchResult[]
  error: boolean
}

const EMPTY: ResolvedState = { query: '', results: [], error: false }

/**
 * Aplica debounce na query e consulta o provider de busca, cancelando a
 * requisicao anterior quando a query muda. `status` e `results` sao derivados
 * para que nenhum setState aconteca de forma sincrona dentro do efeito — todo
 * commit ocorre no retorno assincrono. O provider e mockado hoje, mas a
 * mecanica (debounce, abort, estados) ja serve para uma API real.
 */
export function useVehicleSearch(query: string, delay = 300): UseVehicleSearchResult {
  const debouncedQuery = useDebouncedValue(query.trim(), delay)
  const [resolved, setResolved] = useState<ResolvedState>(EMPTY)

  useEffect(() => {
    if (!debouncedQuery) return

    const controller = new AbortController()

    vehicleSearch
      .search(debouncedQuery, controller.signal)
      .then((found) => {
        if (controller.signal.aborted) return
        setResolved({ query: debouncedQuery, results: found, error: false })
      })
      .catch((error) => {
        if (controller.signal.aborted || (error as Error).name === 'AbortError') return
        setResolved({ query: debouncedQuery, results: [], error: true })
      })

    return () => controller.abort()
  }, [debouncedQuery])

  const settled = resolved.query === debouncedQuery && debouncedQuery !== ''

  const status: SearchStatus = !debouncedQuery
    ? 'idle'
    : !settled
      ? 'loading'
      : resolved.error
        ? 'error'
        : 'done'

  return { results: settled ? resolved.results : [], status }
}
