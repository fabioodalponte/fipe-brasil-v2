import { useEffect, useState } from 'react'
import { getHomeData, type HomeData } from '../services/homeData'

type UseHomeDataResult = {
  data: HomeData | null
  loading: boolean
  error: boolean
}

type State = {
  data: HomeData | null
  error: boolean
}

const INITIAL: State = { data: null, error: false }

export function useHomeData(): UseHomeDataResult {
  const [state, setState] = useState<State>(INITIAL)

  useEffect(() => {
    const controller = new AbortController()

    getHomeData(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return
        setState({ data, error: false })
      })
      .catch((error) => {
        if (controller.signal.aborted || (error as Error).name === 'AbortError') return
        setState({ data: null, error: true })
      })

    return () => controller.abort()
  }, [])

  return {
    data: state.data,
    loading: state.data === null && !state.error,
    error: state.error,
  }
}
