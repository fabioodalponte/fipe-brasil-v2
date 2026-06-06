import { useEffect } from 'react'
import { SITE_URL } from '../config/site'

export type SEOInput = {
  title: string
  description: string
  /** Caminho para o canonical. Default: rota atual (location.pathname). */
  canonicalPath?: string
  /** og:type. Default: 'website'. */
  type?: string
  image?: string
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

/**
 * Atualiza metadados de SEO da rota atual de forma imperativa (sem lib externa,
 * sem SSR): document.title, meta description, canonical e Open Graph basico.
 * Cada pagina sobrescreve as mesmas tags ao montar, entao a navegacao SPA
 * mantem os metadados coerentes com a rota.
 */
export function useSEO({ title, description, canonicalPath, type = 'website', image }: SEOInput) {
  useEffect(() => {
    const path = canonicalPath ?? window.location.pathname
    const url = `${SITE_URL}${path}`

    document.title = title
    upsertMeta('name', 'description', description)
    upsertLink('canonical', url)
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:url', url)
    if (image) upsertMeta('property', 'og:image', image)
  }, [title, description, canonicalPath, type, image])
}
