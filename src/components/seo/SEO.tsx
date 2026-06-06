import { useSEO, type SEOInput } from '../../hooks/useSEO'

/**
 * Wrapper declarativo do hook useSEO. Nao renderiza nada visivel; apenas
 * sincroniza os metadados da rota com o <head>.
 */
export function SEO(props: SEOInput) {
  useSEO(props)
  return null
}
