export const SITE_NAME = 'FIPE Brasil'
export const SITE_URL = 'https://fipebrasil.com'

/** Resolve um caminho para URL absoluta no dominio canonico do site. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`
}
