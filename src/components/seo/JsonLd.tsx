import { useEffect } from 'react'

type JsonLdProps = {
  /** Identificador estavel do script (1 script por id ativo por vez). */
  id: string
  /** Objeto JSON-LD serializavel. */
  data: unknown
}

/**
 * Insere/atualiza um <script type="application/ld+json"> no <head>, identificado
 * por `id`. Remove o script ao desmontar, garantindo que a navegacao SPA nunca
 * acumule dados estruturados duplicados.
 */
export function JsonLd({ id, data }: JsonLdProps) {
  const json = JSON.stringify(data)

  useEffect(() => {
    const scriptId = `jsonld-${id}`
    let el = document.getElementById(scriptId) as HTMLScriptElement | null
    if (!el) {
      el = document.createElement('script')
      el.type = 'application/ld+json'
      el.id = scriptId
      document.head.appendChild(el)
    }
    el.textContent = json

    return () => {
      document.getElementById(scriptId)?.remove()
    }
  }, [id, json])

  return null
}
