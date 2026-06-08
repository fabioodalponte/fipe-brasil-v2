import { useEffect, useState } from 'react'
import { marketRankings, type MarketRankings } from '../services/marketRankings'

type UseMarketRankingsResult = {
  rankings: MarketRankings | null
  loading: boolean
  error: boolean
}

type State = {
  rankings: MarketRankings | null
  error: boolean
}

const INITIAL: State = { rankings: null, error: false }

/**
 * Carrega os rankings de mercado via provider (API real ou mock),
 * cancelando a requisicao anterior se o limite mudar. Todo setState ocorre no
 * retorno assincrono — nenhum commit sincrono dentro do efeito.
 */
export function useMarketRankings(limit = 5): UseMarketRankingsResult {
  const [state, setState] = useState<State>(INITIAL)

  useEffect(() => {
    const controller = new AbortController()

    marketRankings
      .getRankings({ limit }, controller.signal)
      .then((rankings) => {
        if (controller.signal.aborted) return
        setState({ rankings, error: false })
      })
      .catch((err) => {
        if (controller.signal.aborted || (err as Error).name === 'AbortError') return
        setState({ rankings: null, error: true })
      })

    return () => controller.abort()
  }, [limit])

  return {
    rankings: state.rankings,
    loading: state.rankings === null && !state.error,
    error: state.error,
  }
}
