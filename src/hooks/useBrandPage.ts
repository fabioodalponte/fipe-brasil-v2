import { useEffect, useState } from 'react'
import { brandPages, type BrandPage } from '../services/brandPages'

type UseBrandPageResult = {
  page: BrandPage | null
  loading: boolean
  error: boolean
}

type ResolvedState = {
  slug: string | null
  page: BrandPage | null
  error: boolean
}

const EMPTY: ResolvedState = { slug: null, page: null, error: false }

/**
 * Carrega a pagina de marca via provider (mock hoje, API amanha), cancelando a
 * requisicao anterior quando o slug muda. Estados derivados — sem setState
 * sincrono no efeito. `page === null` com `loading`/`error` falsos significa
 * marca nao encontrada.
 */
export function useBrandPage(slug: string | undefined): UseBrandPageResult {
  const [resolved, setResolved] = useState<ResolvedState>(EMPTY)

  useEffect(() => {
    if (!slug) return

    const controller = new AbortController()

    brandPages
      .getBrandPage(slug, controller.signal)
      .then((page) => {
        if (controller.signal.aborted) return
        setResolved({ slug, page, error: false })
      })
      .catch((err) => {
        if (controller.signal.aborted || (err as Error).name === 'AbortError') return
        setResolved({ slug, page: null, error: true })
      })

    return () => controller.abort()
  }, [slug])

  const settled = !!slug && resolved.slug === slug

  return {
    page: settled ? resolved.page : null,
    loading: !!slug && !settled,
    error: settled && resolved.error,
  }
}
