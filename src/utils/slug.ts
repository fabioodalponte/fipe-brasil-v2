/**
 * Converte um texto em slug seguro para URL: minusculo, sem acentos, com
 * hifens no lugar de espacos/simbolos. Ex.: "Volkswagen" -> "volkswagen",
 * "SUV" -> "suv".
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
