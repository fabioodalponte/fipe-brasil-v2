import { useEffect } from 'react'
import { SITE_URL } from '../config/site'

/** Imagem default para og:image/twitter:image quando a rota nao define uma. */
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`

export type SEOInput = {
  title: string
  description: string
  /** Caminho para o canonical. Default: rota atual (location.pathname). */
  canonicalPath?: string
  /** og:type. Default: 'website'. */
  type?: string
  image?: string
  /**
   * Marca a pagina com <meta name="robots" content="noindex"> e remove o
   * canonical. Para estados que nao devem ser indexados (404, erro).
   */
  noindex?: boolean
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  const selector = `link[rel="${rel}"]`
  let el = document.head.querySelector<HTMLLinkElement>(selector)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function removeMeta(attr: 'name' | 'property', key: string) {
  document.head.querySelector(`meta[${attr}="${key}"]`)?.remove()
}

function removeLink(rel: string) {
  document.head.querySelector(`link[rel="${rel}"]`)?.remove()
}

/**
 * Atualiza metadados de SEO da rota atual de forma imperativa (sem lib externa,
 * sem SSR): document.title, meta description, canonical e Open Graph basico.
 * Cada pagina sobrescreve as mesmas tags ao montar, entao a navegacao SPA
 * mantem os metadados coerentes com a rota.
 */
export function useSEO({ title, description, canonicalPath, type = 'website', image, noindex }: SEOInput) {
  useEffect(() => {
    const path = canonicalPath ?? window.location.pathname
    const url = `${SITE_URL}${path}`
    const ogImage = image ?? DEFAULT_OG_IMAGE

    document.title = title
    upsertMeta('name', 'description', description)

    // Paginas noindex (404, erro) nao devem declarar canonical nem og:url;
    // remover cobre a navegacao SPA vinda de uma pagina indexavel.
    if (noindex) {
      upsertMeta('name', 'robots', 'noindex')
      removeLink('canonical')
      removeMeta('property', 'og:url')
    } else {
      removeMeta('name', 'robots')
      upsertLink('canonical', url)
      upsertMeta('property', 'og:url', url)
    }

    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:image', ogImage)

    // Twitter Card: espelha os metadados de Open Graph para os crawlers do X.
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', ogImage)
  }, [title, description, canonicalPath, type, image, noindex])
}
