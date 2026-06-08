import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { GitCompareArrows } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { SEO } from '../../components/seo/SEO'
import { JsonLd } from '../../components/seo/JsonLd'
import { MetricCard } from '../../components/cards/MetricCard'
import { useVehicleCompare } from '../../hooks/useVehicleCompare'
import {
  buildComparisonSummary,
  formatChange,
  popularComparisons,
  type ComparedVehicle,
  type ComparePricePoint,
  type VehicleComparison,
} from '../../services/compareVehicles'
import { formatCurrency, formatPercent } from '../../utils/formatters'
import { slugify } from '../../utils/slug'
import { breadcrumbList } from '../../utils/structuredData'

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function monthLabel(reference: string): string {
  const [year, month] = reference.split('-')
  const idx = Number(month) - 1
  return MESES[idx] ? `${MESES[idx]}/${year.slice(2)}` : reference
}

function yearLabel(vehicle: ComparedVehicle): string {
  return vehicle.vehicle.year === 0 ? '0 km' : String(vehicle.vehicle.year)
}

function changeTone(value: number | null): 'positive' | 'negative' | 'neutral' {
  if (value == null || Math.abs(value) < 0.05) return 'neutral'
  return value > 0 ? 'positive' : 'negative'
}

function formatMetricPercent(value: number | null): string {
  return value == null ? 'Histórico insuficiente' : formatPercent(value)
}

function formatOptionalCurrency(value: number | null): string {
  return value == null ? 'Indisponível' : formatCurrency(value)
}

function modelBySlug(comparison: VehicleComparison, slug: string | null): string {
  if (!slug) return 'Indisponível'
  if (comparison.base.vehicle.id === slug) return comparison.base.vehicle.model
  if (comparison.target.vehicle.id === slug) return comparison.target.vehicle.model
  return slug
}

function compactSideBySlug(comparison: VehicleComparison, slug: string | null): string {
  if (!slug) return 'Indisponível'
  if (comparison.base.vehicle.id === slug) return 'Base'
  if (comparison.target.vehicle.id === slug) return 'Comparado'
  return 'Indisponível'
}

type CompareChartDatum = {
  referenceMonth: string
  month: string
  base?: number
  target?: number
}

function mergeHistory(base: ComparePricePoint[], target: ComparePricePoint[]): CompareChartDatum[] {
  const months = new Map<string, CompareChartDatum>()

  for (const point of base) {
    months.set(point.referenceMonth, {
      referenceMonth: point.referenceMonth,
      month: monthLabel(point.referenceMonth),
      base: point.price,
    })
  }

  for (const point of target) {
    const existing = months.get(point.referenceMonth)
    if (existing) existing.target = point.price
    else {
      months.set(point.referenceMonth, {
        referenceMonth: point.referenceMonth,
        month: monthLabel(point.referenceMonth),
        target: point.price,
      })
    }
  }

  return [...months.values()].sort((a, b) => a.referenceMonth.localeCompare(b.referenceMonth))
}

function CompareHistoryChart({
  comparison,
  height = 340,
}: {
  comparison: VehicleComparison
  height?: number
}) {
  const data = mergeHistory(comparison.base.priceHistory, comparison.target.priceHistory)
  if (data.length === 0) {
    return (
      <div className="flex h-[200px] flex-col items-center justify-center rounded border border-dashed border-slate-200 bg-slate-50 text-center">
        <GitCompareArrows size={22} className="text-slate-300" />
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Histórico insuficiente para montar o gráfico comparativo.
        </p>
      </div>
    )
  }

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
          <CartesianGrid stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            minTickGap={24}
          />
          <YAxis
            domain={['dataMin', 'dataMax']}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            width={72}
            tickFormatter={(value) => formatCurrency(Number(value))}
          />
          <Tooltip
            contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 4 }}
            formatter={(value) => formatCurrency(Number(value))}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="base"
            name={comparison.base.vehicle.model}
            dot={false}
            stroke="#10b981"
            strokeWidth={2.4}
            connectNulls
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="target"
            name={comparison.target.vehicle.model}
            dot={false}
            stroke="#0f172a"
            strokeWidth={2.4}
            connectNulls
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function PopularComparisons() {
  return (
    <div className="flex flex-wrap gap-2">
      {popularComparisons.map((item) => (
        <Link
          key={item.label}
          to={`/compare?base=${item.base}&target=${item.target}`}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <GitCompareArrows size={14} />
          {item.label}
        </Link>
      ))}
    </div>
  )
}

function CompareCard({ entry }: { entry: ComparedVehicle }) {
  const { vehicle } = entry
  return (
    <div className="rounded border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          to={`/marca/${slugify(vehicle.brand)}`}
          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-600 transition hover:bg-slate-200"
        >
          {vehicle.brand}
        </Link>
        <Link
          to={`/categoria/${slugify(vehicle.segment)}`}
          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-600 transition hover:bg-slate-200"
        >
          {vehicle.segment}
        </Link>
      </div>
      <h2 className="mt-3 text-2xl font-bold text-slate-950">
        <Link to={`/vehicle/${vehicle.id}`} className="hover:underline">
          {vehicle.name}
        </Link>
      </h2>
      <p className="mt-1 text-sm text-slate-500">{vehicle.version} | {yearLabel(entry)}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Preco atual" value={formatCurrency(vehicle.price)} />
        <MetricCard
          label="12 meses"
          value={formatMetricPercent(entry.change12mPct)}
          tone={changeTone(entry.change12mPct)}
        />
        <MetricCard
          label="6 meses"
          value={formatMetricPercent(entry.change6mPct)}
          tone={changeTone(entry.change6mPct)}
        />
      </div>
    </div>
  )
}

export function ComparePage() {
  const [searchParams] = useSearchParams()
  const baseSlug = searchParams.get('base')
  const targetSlug = searchParams.get('target')
  const { comparison, loading, error, notFound } = useVehicleCompare(baseSlug, targetSlug)

  // Sem parametros: convida a escolher uma comparacao.
  if (!baseSlug || !targetSlug) {
    return (
      <div className="rounded border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-950">Comparar veiculos</h1>
        <p className="mt-2 text-sm text-slate-600">
          Escolha dois veiculos para comparar preco FIPE, historico e variacao real.
        </p>
        <div className="mt-5">
          <p className="mb-2 text-[11px] font-bold uppercase text-slate-500">Comparacoes populares</p>
          <PopularComparisons />
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="h-64 animate-pulse rounded border border-slate-200 bg-slate-100" />
  }

  if (error) {
    return (
      <div className="rounded border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-bold text-slate-950">Comparacao indisponivel</h1>
        <p className="mt-2 text-sm text-slate-600">Tente novamente em instantes.</p>
      </div>
    )
  }

  if (notFound || !comparison) {
    return (
      <div className="rounded border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-bold text-slate-950">Comparacao nao encontrada</h1>
        <p className="mt-2 text-sm text-slate-600">
          Nao encontramos um dos veiculos selecionados. Tente uma comparacao sugerida:
        </p>
        <div className="mt-4">
          <PopularComparisons />
        </div>
      </div>
    )
  }

  const { base, target } = comparison
  const summary = buildComparisonSummary(comparison)
  const title = `${base.vehicle.model} vs ${target.vehicle.model}`
  const better12mLabel =
    base.change12mPct == null || target.change12mPct == null
      ? 'Histórico insuficiente'
      : comparison.comparison.better12mPerformer == null
        ? 'Equivalente'
        : compactSideBySlug(comparison, comparison.comparison.better12mPerformer)
  const lowerPriceLabel =
    comparison.comparison.priceDifference == null
      ? 'Indisponível'
      : comparison.comparison.priceDifference === 0
        ? 'Mesmo preço'
        : compactSideBySlug(comparison, comparison.comparison.lowerPrice)

  const rows: Array<[string, string, string]> = [
    ['Marca', base.vehicle.brand, target.vehicle.brand],
    ['Categoria', base.vehicle.segment, target.vehicle.segment],
    ['Ano', yearLabel(base), yearLabel(target)],
    ['Combustivel', base.vehicle.version, target.vehicle.version],
    ['Preco atual', formatCurrency(base.vehicle.price), formatCurrency(target.vehicle.price)],
    ['Variacao 1 mes', formatChange(base.change1mPct), formatChange(target.change1mPct)],
    ['Variacao 6 meses', formatChange(base.change6mPct), formatChange(target.change6mPct)],
    ['Variacao 12 meses', formatChange(base.change12mPct), formatChange(target.change12mPct)],
    [
      'Melhor 12 meses',
      comparison.comparison.better12mPerformer === base.vehicle.id ? modelBySlug(comparison, base.vehicle.id) : '-',
      comparison.comparison.better12mPerformer === target.vehicle.id ? modelBySlug(comparison, target.vehicle.id) : '-',
    ],
    [
      'Menor preco',
      comparison.comparison.lowerPrice === base.vehicle.id ? modelBySlug(comparison, base.vehicle.id) : '-',
      comparison.comparison.lowerPrice === target.vehicle.id ? modelBySlug(comparison, target.vehicle.id) : '-',
    ],
  ]

  return (
    <div className="space-y-5">
      <SEO
        title={`${title}: comparacao FIPE e valorizacao | FIPE Brasil`}
        description={`Compare precos FIPE reais, historico e variacao entre ${base.vehicle.model} e ${target.vehicle.model}.`}
        canonicalPath={`/compare?base=${base.vehicle.id}&target=${target.vehicle.id}`}
      />
      <JsonLd
        id="compare-breadcrumb"
        data={breadcrumbList([
          { name: 'Home', path: '/' },
          { name: 'Comparar', path: '/compare' },
          { name: title, path: `/compare?base=${base.vehicle.id}&target=${target.vehicle.id}` },
        ])}
      />

      <section className="rounded border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500">Comparacao lado a lado</p>
            <h1 className="mt-2 break-words text-3xl font-bold text-slate-950 md:text-4xl">{title}</h1>
          </div>
          <span className="inline-flex items-center gap-2 rounded bg-slate-900 px-3 py-2 text-sm font-bold text-white">
            <GitCompareArrows size={16} />
            2 veiculos
          </span>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <CompareCard entry={base} />
        <CompareCard entry={target} />
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Diferenca de preco"
          value={formatOptionalCurrency(comparison.comparison.priceDifference)}
          change={
            comparison.comparison.priceDifferencePct == null
              ? undefined
              : formatPercent(comparison.comparison.priceDifferencePct)
          }
          tone={changeTone(comparison.comparison.priceDifference)}
        />
        <MetricCard label="Menor preco" value={lowerPriceLabel} />
        <MetricCard label="Melhor 12 meses" value={better12mLabel} />
        <MetricCard
          label="Mesmo recorte"
          value={`${comparison.comparison.sameBrand ? 'Marca' : 'Marcas distintas'} | ${
            comparison.comparison.sameSegment ? 'Segmento' : 'Segmentos distintos'
          }`}
        />
      </section>

      <section className="rounded border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <GitCompareArrows size={18} className="text-slate-600" />
          <h2 className="text-base font-bold text-slate-950">Resumo factual</h2>
        </div>
        <ul className="mt-3 space-y-2">
          {summary.map((line) => (
            <li key={line} className="flex gap-2 text-sm leading-6 text-slate-700">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-base font-bold text-slate-950">Grafico comparativo</h2>
          <p className="text-sm text-slate-500">Precos FIPE reais ordenados por mes de referencia</p>
        </div>
        <div className="p-4">
          <CompareHistoryChart comparison={comparison} />
        </div>
      </section>

      <section className="overflow-hidden rounded border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-base font-bold text-slate-950">Tabela de metricas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-sm">
            <thead className="bg-slate-50 text-left text-[11px] uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-bold">Metrica</th>
                <th className="px-4 py-3 font-bold">{base.vehicle.name}</th>
                <th className="px-4 py-3 font-bold">{target.vehicle.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(([label, left, right]) => (
                <tr key={label}>
                  <td className="px-4 py-3 font-semibold text-slate-700">{label}</td>
                  <td className="px-4 py-3 font-mono text-slate-950">{left}</td>
                  <td className="px-4 py-3 font-mono text-slate-950">{right}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
