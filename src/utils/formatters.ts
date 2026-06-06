export const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

export const numberFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2,
})

export function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

export function formatPercent(value: number) {
  const sign = value > 0 ? '+' : ''
  return `${sign}${numberFormatter.format(value)}%`
}
