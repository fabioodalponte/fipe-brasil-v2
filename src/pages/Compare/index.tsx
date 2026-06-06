import { GitCompareArrows, Sparkles } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { SEO } from '../../components/seo/SEO'
import { JsonLd } from '../../components/seo/JsonLd'
import { HistoryChart } from '../../components/charts/HistoryChart'
import { MetricCard } from '../../components/cards/MetricCard'
import { marketHistory } from '../../data/mock/market'
import { useVehicleCompare } from '../../hooks/useVehicleCompare'
import {
  buildComparisonSummary,
  popularComparisons,
  type ComparedVehicle,
  type CompareSeriesKey,
} from '../../services/compareVehicles'
import { formatCurrency, formatPercent } from '../../utils/formatters'
import { slugify } from '../../utils/slug'
import { breadcrumbList } from '../../utils/structuredData'

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
      <p className="mt-1 text-sm text-slate-500">{vehicle.version} | {vehicle.year}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Preco atual" value={formatCurrency(vehicle.price)} />
        <MetricCard
          label="12 meses"
          value={formatPercent(vehicle.yearlyChange)}
          tone={vehicle.yearlyChange >= 0 ? 'positive' : 'negative'}
        />
        <MetricCard label="Volatilidade" value={`${vehicle.volatility}%`} />
      </div>
    </div>
  )
}

export function ComparePage() {
  const [searchParams] = useSearchParams()
  const baseSlug = searchParams.get('base')
  const targetSlug = searchParams.get('target')
  const { comparison, loading, error } = useVehicleCompare(baseSlug, targetSlug)

  // Sem parametros: convida a escolher uma comparacao.
  if (!baseSlug || !targetSlug) {
    return (
      <div className="rounded border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-950">Comparar veiculos</h1>
        <p className="mt-2 text-sm text-slate-600">
          Escolha dois veiculos para comparar preco FIPE, valorizacao e volatilidade.
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

  if (error || !comparison) {
    return (
      <div className="rounded border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-bold text-slate-950">Comparacao indisponivel</h1>
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
  const summary = buildComparisonSummary(base.vehicle, target.vehicle)
  const title = `${base.vehicle.model} vs ${target.vehicle.model}`

  type ChartSeries = { key: CompareSeriesKey; label: string; color: string }
  const series = [
    base.historyKey ? { key: base.historyKey, label: base.vehicle.name, color: '#10b981' } : null,
    target.historyKey ? { key: target.historyKey, label: target.vehicle.name, color: '#0f172a' } : null,
  ].filter((item): item is ChartSeries => item !== null)
  const canChart = series.length === 2

  const rows: Array<[string, string, string]> = [
    ['Marca', base.vehicle.brand, target.vehicle.brand],
    ['Categoria', base.vehicle.segment, target.vehicle.segment],
    ['Ano', String(base.vehicle.year), String(target.vehicle.year)],
    ['Preco atual', formatCurrency(base.vehicle.price), formatCurrency(target.vehicle.price)],
    ['Variacao 12 meses', formatPercent(base.vehicle.yearlyChange), formatPercent(target.vehicle.yearlyChange)],
    ['Volatilidade', `${base.vehicle.volatility}%`, `${target.vehicle.volatility}%`],
  ]

  return (
    <div className="space-y-5">
      <SEO
        title={`${title}: comparacao FIPE e valorizacao | FIPE Brasil`}
        description={`Compare precos FIPE, historico e valorizacao entre ${base.vehicle.model} e ${target.vehicle.model}.`}
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

      <section className="rounded border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-slate-600" />
          <h2 className="text-base font-bold text-slate-950">Resumo automatico</h2>
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
          <p className="text-sm text-slate-500">Base 100 simulada para leitura relativa</p>
        </div>
        <div className="p-4">
          {canChart ? (
            <HistoryChart data={marketHistory} height={340} series={series} />
          ) : (
            <div className="flex h-[200px] flex-col items-center justify-center rounded border border-dashed border-slate-200 bg-slate-50 text-center">
              <GitCompareArrows size={22} className="text-slate-300" />
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Ainda nao ha serie historica comparavel para estes dois veiculos.
              </p>
            </div>
          )}
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
