import { BarChart3, Car, GitCompareArrows, ShieldCheck } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SEO } from '../../components/seo/SEO'
import { JsonLd } from '../../components/seo/JsonLd'
import { PriceHistoryChart, type PriceHistoryDatum } from '../../components/charts/PriceHistoryChart'
import { MetricCard } from '../../components/cards/MetricCard'
import { VehicleCard } from '../../components/cards/VehicleCard'
import type { Vehicle } from '../../data/mock/market'
import { useVehicleDetails } from '../../hooks/useVehicleDetails'
import { useRelatedVehicles } from '../../hooks/useRelatedVehicles'
import { analyzePriceHistory, type VehicleDetails } from '../../services/vehicleDetails'
import { formatCurrency, formatPercent } from '../../utils/formatters'
import { slugify } from '../../utils/slug'
import { breadcrumbList, vehicleProductFromParts } from '../../utils/structuredData'

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function monthLabel(reference: string | null): string {
  if (!reference) return ''
  const [year, month] = reference.split('-')
  const idx = Number(month) - 1
  return MESES[idx] ? `${MESES[idx]}/${year.slice(2)}` : reference
}

function yearLabel(details: VehicleDetails): string {
  return details.isZeroKm || details.modelYear == null ? '0 km' : String(details.modelYear)
}

function toneFor(change: number | null): 'positive' | 'negative' | 'neutral' {
  if (change == null || Math.abs(change) < 0.05) return 'neutral'
  return change > 0 ? 'positive' : 'negative'
}

function toSeed(details: VehicleDetails): Vehicle {
  return {
    id: details.slug,
    name: `${details.brand} ${details.model}`,
    brand: details.brand,
    model: details.model,
    version: '',
    year: details.modelYear ?? 0,
    segment: details.segment ?? '',
    fipeCode: details.fipeCode,
    price: details.latestPrice ?? 0,
    monthlyChange: 0,
    yearlyChange: 0,
    liquidity: 0,
    volatility: 0,
    marketRank: 0,
  }
}

export function VehiclePage() {
  const { slug } = useParams()
  const { details, status } = useVehicleDetails(slug)

  const analysis = useMemo(
    () => (details ? analyzePriceHistory(details.priceHistory) : null),
    [details],
  )
  const seed = useMemo(() => (details ? toSeed(details) : undefined), [details])
  const { vehicles: related, loading: relatedLoading, error: relatedError } = useRelatedVehicles(seed, 4)

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="space-y-5">
        <div className="h-56 animate-pulse rounded border border-slate-200 bg-slate-100" />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded border border-slate-200 bg-slate-100" />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded border border-slate-200 bg-slate-100" />
      </div>
    )
  }

  if (status === 'notfound') {
    return (
      <div className="rounded border border-slate-200 bg-white p-8 text-center">
        <SEO
          title="Veículo não encontrado | FIPE Brasil"
          description="O veículo procurado não foi localizado na tabela FIPE."
          noindex
        />
        <h1 className="text-xl font-bold text-slate-950">Veículo não encontrado</h1>
        <p className="mt-2 text-sm text-slate-500">
          Não localizamos o veículo <span className="font-mono">{slug}</span> na tabela FIPE.
        </p>
        <Link to="/" className="mt-4 inline-block rounded bg-slate-900 px-4 py-2 text-sm font-bold text-white">
          Voltar para a home
        </Link>
      </div>
    )
  }

  if (status === 'error' || !details || !analysis) {
    return (
      <div className="rounded border border-slate-200 bg-white p-8 text-center">
        <h1 className="text-xl font-bold text-slate-950">Erro ao carregar o veículo</h1>
        <p className="mt-2 text-sm text-slate-500">Tente novamente em instantes.</p>
      </div>
    )
  }

  const year = yearLabel(details)
  const refLabel = monthLabel(details.latestReferenceMonth)
  const chartData: PriceHistoryDatum[] = details.priceHistory.map((p) => ({
    month: monthLabel(p.referenceMonth),
    price: p.price,
  }))

  const insights = [
    analysis.yearlyChange != null
      ? `Variação em 12 meses: ${formatPercent(analysis.yearlyChange)}.`
      : 'Histórico insuficiente para variação anual.',
    analysis.min != null && analysis.max != null
      ? `No período monitorado, o preço variou entre ${formatCurrency(analysis.min)} e ${formatCurrency(analysis.max)}.`
      : '',
    `Preço FIPE de referência ${refLabel}, com ${details.priceHistory.length} meses de histórico.`,
    details.segment
      ? `Segmento ${details.segment} (origem: ${details.segmentSource ?? 'n/d'}, confiança ${details.segmentConfidence ?? 'n/d'}).`
      : 'Segmento ainda em revisão.',
  ].filter(Boolean)

  return (
    <div className="space-y-5">
      <SEO
        title={`${details.brand} ${details.model} ${year}: preço FIPE, histórico e variação | FIPE Brasil`}
        description={`Preço FIPE do ${details.brand} ${details.model} ${year}${
          details.segment ? ` (${details.segment})` : ''
        }: ${details.latestPrice != null ? formatCurrency(details.latestPrice) : 'indisponível'} em ${refLabel}. Histórico de ${
          details.priceHistory.length
        } meses e variação.`}
        canonicalPath={`/carro/${details.slug}`}
        type="article"
      />
      <JsonLd
        id="vehicle-product"
        data={vehicleProductFromParts({
          name: `${details.brand} ${details.model} ${year}`,
          brand: details.brand,
          segment: details.segment,
          year: details.modelYear,
          price: details.latestPrice,
          path: `/carro/${details.slug}`,
          referenceMonth: details.latestReferenceMonth,
        })}
      />
      <JsonLd
        id="vehicle-breadcrumb"
        data={breadcrumbList([
          { name: 'Home', path: '/' },
          { name: details.brand, path: `/marca/${slugify(details.brand)}` },
          { name: `${details.model} ${year}`, path: `/carro/${details.slug}` },
        ])}
      />

      <section className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="rounded border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/marca/${slugify(details.brand)}`}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-600 transition hover:bg-slate-200"
            >
              {details.brand}
            </Link>
            {details.segment ? (
              <Link
                to={`/categoria/${slugify(details.segment)}`}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-600 transition hover:bg-slate-200"
              >
                {details.segment}
              </Link>
            ) : null}
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase text-emerald-700">
              {details.isZeroKm ? '0 km' : details.fuel}
            </span>
          </div>
          <div className="mt-5">
            <h1 className="break-words text-3xl font-bold text-slate-950 md:text-4xl">{details.model}</h1>
            <p className="mt-2 text-sm text-slate-600">
              {details.brand} | {year} | {details.fuel} | Código FIPE {details.fipeCode}
            </p>
            <div className="mt-5 flex flex-wrap gap-5">
              <div>
                <p className="text-[11px] font-bold uppercase text-slate-500">Preço atual</p>
                <p className="mt-1 font-mono text-4xl font-bold text-slate-950">
                  {details.latestPrice != null ? formatCurrency(details.latestPrice) : '—'}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase text-slate-500">Variação mensal</p>
                <p className="mt-1 font-mono text-2xl font-bold text-slate-900">
                  {analysis.monthlyChange != null ? formatPercent(analysis.monthlyChange) : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded border border-slate-200 bg-slate-950 p-5 text-white">
          <div className="flex items-center gap-3">
            <span className="rounded bg-white/10 p-2 text-emerald-300">
              <ShieldCheck size={18} />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase text-slate-400">Leitura automática</p>
              <h2 className="text-lg font-bold">Histórico FIPE consolidado</h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Preço de referência {refLabel} com {details.priceHistory.length} meses monitorados na tabela FIPE.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-400">Variação 12m</p>
              <p className="mt-1 font-mono text-xl font-bold">
                {analysis.yearlyChange != null ? formatPercent(analysis.yearlyChange) : '—'}
              </p>
            </div>
            <div className="rounded border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-400">Volatilidade</p>
              <p className="mt-1 font-mono text-xl font-bold">
                {analysis.volatility != null ? `${analysis.volatility.toFixed(1)}%` : '—'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Preço FIPE"
          value={details.latestPrice != null ? formatCurrency(details.latestPrice) : '—'}
          change={refLabel}
          tone="neutral"
        />
        <MetricCard
          label="Variação mensal"
          value={analysis.monthlyChange != null ? formatPercent(analysis.monthlyChange) : '—'}
          tone={toneFor(analysis.monthlyChange)}
        />
        <MetricCard
          label="Variação 12 meses"
          value={analysis.yearlyChange != null ? formatPercent(analysis.yearlyChange) : '—'}
          tone={toneFor(analysis.yearlyChange)}
        />
        <MetricCard
          label="Volatilidade"
          value={analysis.volatility != null ? `${analysis.volatility.toFixed(1)}%` : '—'}
          tone="neutral"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded border border-slate-200 bg-white">
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
            <BarChart3 size={18} className="text-slate-600" />
            <h2 className="text-base font-bold text-slate-950">Histórico de preço FIPE</h2>
          </div>
          <div className="p-4">
            {chartData.length > 0 ? (
              <PriceHistoryChart data={chartData} />
            ) : (
              <p className="py-12 text-center text-sm text-slate-500">Sem histórico de preços.</p>
            )}
          </div>
        </div>

        <div className="rounded border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-base font-bold text-slate-950">Insights automáticos</h2>
            <p className="text-sm text-slate-500">Derivados do histórico FIPE</p>
          </div>
          <div className="divide-y divide-slate-100">
            {insights.map((insight) => (
              <div key={insight} className="flex gap-3 px-4 py-3 text-sm leading-6 text-slate-700">
                <Car size={16} className="mt-1 shrink-0 text-slate-400" />
                {insight}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-950">Veículos relacionados</h2>
          <span className="text-sm text-slate-500">Mesma marca, segmento, faixa de preço e ano</span>
        </div>
        {relatedLoading ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-32 animate-pulse rounded border border-slate-200 bg-slate-100" />
            ))}
          </div>
        ) : relatedError ? (
          <p className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-500">
            Não foi possível carregar os veículos relacionados.
          </p>
        ) : related.length === 0 ? (
          <p className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-500">
            Nenhum veículo relacionado encontrado.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {related.map((item) => (
              <VehicleCard key={item.id} vehicle={item} />
            ))}
          </div>
        )}
      </section>

      {related.length > 0 ? (
        <section className="rounded border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold text-slate-950">Compare com</h2>
          <p className="mt-1 text-sm text-slate-500">Atalhos de comparação lado a lado</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {related.slice(0, 3).map((target) => (
              <Link
                key={target.id}
                to={`/compare?base=${details.slug}&target=${target.id}`}
                className="flex items-center justify-between gap-3 rounded border border-slate-200 p-3 transition hover:border-slate-300 hover:shadow-sm"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-slate-950">
                    {details.model} vs {target.model}
                  </span>
                  <span className="block truncate text-xs text-slate-500">{target.name}</span>
                </span>
                <GitCompareArrows size={16} className="shrink-0 text-slate-400" />
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
