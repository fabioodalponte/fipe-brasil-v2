import { vehicles, type MarketPoint, type Vehicle } from '../data/mock/market'
import { formatCurrency, numberFormatter } from '../utils/formatters'

export type CompareSeriesKey = keyof MarketPoint

/**
 * Mapa de veiculos que possuem serie historica dedicada nos mocks. Quem nao
 * estiver aqui simplesmente nao tem grafico comparativo (estado vazio na UI).
 */
const HISTORY_KEYS: Partial<Record<string, CompareSeriesKey>> = {
  'toyota-corolla-xei-2020': 'corolla',
  'honda-civic-exl-2020': 'civic',
}

export type ComparedVehicle = {
  vehicle: Vehicle
  historyKey: CompareSeriesKey | null
}

export type VehicleComparison = {
  base: ComparedVehicle
  target: ComparedVehicle
}

export type PopularComparison = {
  label: string
  base: string
  target: string
}

/** Comparacoes sugeridas — usam apenas slugs existentes nos mocks. */
export const popularComparisons: PopularComparison[] = [
  { label: 'Corolla vs Civic', base: 'toyota-corolla-xei-2020', target: 'honda-civic-exl-2020' },
  { label: 'Compass vs T-Cross', base: 'jeep-compass-longitude-2021', target: 'volkswagen-tcross-highline-2021' },
  { label: 'HB20 vs Onix', base: 'hyundai-hb20-comfort-2022', target: 'chevrolet-onix-premier-2021' },
]

/**
 * Contrato de comparacao de veiculos. Hoje resolvido em memoria com os mocks;
 * no futuro pode virar `GET /compare?base=&target=` — basta trocar a instancia
 * exportada em `compareVehicles`, sem tocar no hook nem na UI.
 */
export interface CompareVehiclesProvider {
  compare(
    baseSlug: string,
    targetSlug: string,
    signal?: AbortSignal,
  ): Promise<VehicleComparison | null>
}

export class MockCompareVehiclesProvider implements CompareVehiclesProvider {
  private readonly source: Vehicle[]

  constructor(source: Vehicle[] = vehicles) {
    this.source = source
  }

  async compare(
    baseSlug: string,
    targetSlug: string,
    signal?: AbortSignal,
  ): Promise<VehicleComparison | null> {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

    const base = this.source.find((vehicle) => vehicle.id === baseSlug)
    const target = this.source.find((vehicle) => vehicle.id === targetSlug)
    if (!base || !target) return null

    return {
      base: { vehicle: base, historyKey: HISTORY_KEYS[base.id] ?? null },
      target: { vehicle: target, historyKey: HISTORY_KEYS[target.id] ?? null },
    }
  }
}

export const compareVehicles: CompareVehiclesProvider = new MockCompareVehiclesProvider()

/**
 * Resumo automatico por calculo simples (sem IA, sem inventar numeros):
 * diferenca de preco, vantagem de valorizacao 12m e menor volatilidade.
 */
export function buildComparisonSummary(base: Vehicle, target: Vehicle): string[] {
  const lines: string[] = []

  const priceDiff = base.price - target.price
  if (priceDiff === 0) {
    lines.push('Ambos tem o mesmo preco FIPE.')
  } else {
    const higher = priceDiff > 0 ? base : target
    lines.push(`${higher.model} custa ${formatCurrency(Math.abs(priceDiff))} a mais.`)
  }

  const yearlyDiff = base.yearlyChange - target.yearlyChange
  if (yearlyDiff === 0) {
    lines.push('Valorizacao em 12 meses equivalente.')
  } else {
    const winner = yearlyDiff > 0 ? base : target
    const other = yearlyDiff > 0 ? target : base
    lines.push(
      `${winner.model} valorizou ${numberFormatter.format(Math.abs(yearlyDiff))}% acima do ${other.model}.`,
    )
  }

  const volDiff = base.volatility - target.volatility
  if (volDiff === 0) {
    lines.push('Volatilidade equivalente.')
  } else {
    const lower = volDiff < 0 ? base : target
    lines.push(`${lower.model} apresenta menor volatilidade.`)
  }

  return lines
}
