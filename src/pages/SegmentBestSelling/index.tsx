import { ArrowRight, ExternalLink, Info, Layers, Trophy } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { PageHero } from '../../components/layout/PageHero'
import { JsonLd } from '../../components/seo/JsonLd'
import { SEO } from '../../components/seo/SEO'
import { useFenabraveSegmentRanking } from '../../hooks/useFenabraveSegmentRanking'
import type {
  FenabraveSegmentRankingVehicle,
  FenabraveSegmentSlug,
} from '../../services/fenabraveRankings'
import { absoluteUrl, breadcrumbList } from '../../utils/structuredData'
import { formatCurrency, formatPercent, numberFormatter } from '../../utils/formatters'

type SegmentPageConfig = {
  path: string
  segment: FenabraveSegmentSlug
  title: string
  description: string
  tableTitle: string
}

const SEGMENT_PAGES: Record<string, SegmentPageConfig> = {
  '/suvs-mais-vendidos': {
    path: '/suvs-mais-vendidos',
    segment: 'suv',
    title: 'SUVs mais vendidos do Brasil em 2026',
    description:
      'Ranking dos SUVs mais vendidos do Brasil em 2026 com emplacamentos Fenabrave e candidatos de preco FIPE quando disponiveis.',
    tableTitle: 'SUVs por emplacamentos acumulados',
  },
  '/picapes-mais-vendidas': {
    path: '/picapes-mais-vendidas',
    segment: 'picape',
    title: 'Picapes mais vendidas do Brasil em 2026',
    description:
      'Ranking das picapes mais vendidas do Brasil em 2026 com emplacamentos Fenabrave e candidatos de preco FIPE quando disponiveis.',
    tableTitle: 'Picapes por emplacamentos acumulados',
  },
}

function numberValue(value: string | number | null | undefined): number | null {
  if (value == null || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function formatOptionalCurrency(value: string | number | null | undefined): string {
  const parsed = numberValue(value)
  return parsed == null ? 'Sem preco FIPE' : formatCurrency(parsed)
}

function formatOptionalPercent(value: string | number | null | undefined): string {
  const parsed = numberValue(value)
  return parsed == null ? 'n/d' : formatPercent(parsed)
}

function matchLabel(status: string, hasCandidate: boolean): string {
  if (!hasCandidate) return 'Sem candidato FIPE'
  if (status === 'ambiguous') return 'Match aproximado'
  if (status === 'exact') return 'Match forte'
  if (status === 'fuzzy') return 'Revisar match'
  return 'Candidato FIPE'
}

function matchClass(status: string, hasCandidate: boolean): string {
  if (!hasCandidate) return 'border-slate-200 bg-slate-50 text-slate-500'
  if (status === 'ambiguous') return 'border-amber-200 bg-amber-50 text-amber-800'
  if (status === 'exact') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  return 'border-slate-200 bg-slate-100 text-slate-700'
}

function monthLabel(referenceMonth: string | null | undefined): string {
  if (!referenceMonth) return 'n/d'
  const [year, month] = referenceMonth.split('-')
  if (!year || !month) return referenceMonth
  return `${month}/${year}`
}

function totalAccumulated(vehicles: FenabraveSegmentRankingVehicle[]): number {
  return vehicles.reduce((sum, item) => sum + (item.registrations_accumulated ?? 0), 0)
}

function collectionJsonLd(config: SegmentPageConfig, vehicles: FenabraveSegmentRankingVehicle[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: config.title,
    description: config.description,
    url: absoluteUrl(config.path),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: vehicles.length,
      itemListElement: vehicles.map((vehicle, index) => {
        const candidate = vehicle.best_fipe_candidate
        return {
          '@type': 'ListItem',
          position: index + 1,
          name: `${vehicle.brand_original} ${vehicle.model_original}`,
          ...(candidate ? { url: absoluteUrl(`/carro/${candidate.slug}`) } : {}),
        }
      }),
    },
  }
}

export function SegmentBestSellingPage() {
  const location = useLocation()
  const config = SEGMENT_PAGES[location.pathname] ?? SEGMENT_PAGES['/suvs-mais-vendidos']
  const { vehicles, loading, error } = useFenabraveSegmentRanking(config.segment, 50)
  const matchedCount = vehicles.filter((item) => item.best_fipe_candidate).length
  const accumulated = totalAccumulated(vehicles)

  return (
    <div className="min-w-0 space-y-5">
      <SEO
        title={`${config.title} | FIPE Brasil`}
        description={config.description}
        canonicalPath={config.path}
      />
      <JsonLd
        id={`${config.segment}-best-selling-breadcrumb`}
        data={breadcrumbList([
          { name: 'Home', path: '/' },
          { name: config.title, path: config.path },
        ])}
      />
      <JsonLd
        id={`${config.segment}-best-selling-collection`}
        data={collectionJsonLd(config, vehicles)}
      />

      <PageHero
        eyebrow="Fenabrave + FIPE"
        title={config.title}
        subtitle="Emplacamentos Fenabrave por segmento, cruzados com preco FIPE e variacao de 12 meses apenas quando existe candidato consultavel."
      >
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700">
            <Layers size={16} />
            Segmento Fenabrave
          </span>
          <span className="inline-flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700">
            <Info size={16} />
            Sem match definitivo
          </span>
        </div>
      </PageHero>

      <section className="grid min-w-0 gap-3 md:grid-cols-3">
        <div className="rounded border border-slate-200 bg-white p-4">
          <p className="text-xs font-bold uppercase text-slate-500">Modelos listados</p>
          <p className="mt-2 font-mono text-3xl font-bold text-slate-950">
            {loading ? '...' : numberFormatter.format(vehicles.length)}
          </p>
        </div>
        <div className="rounded border border-slate-200 bg-white p-4">
          <p className="text-xs font-bold uppercase text-slate-500">Com candidato FIPE</p>
          <p className="mt-2 font-mono text-3xl font-bold text-slate-950">
            {loading ? '...' : numberFormatter.format(matchedCount)}
          </p>
        </div>
        <div className="rounded border border-slate-200 bg-white p-4">
          <p className="text-xs font-bold uppercase text-slate-500">Emplacamentos acumulados</p>
          <p className="mt-2 font-mono text-3xl font-bold text-slate-950">
            {loading ? '...' : numberFormatter.format(accumulated)}
          </p>
        </div>
      </section>

      <section className="rounded border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-700">
            <Trophy size={18} />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-950">Como ler este ranking</h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
              A posicao e o volume vêm do ranking Fenabrave por segmento. Quando há candidato FIPE,
              o preco e a variacao em 12 meses sao mostrados como referencia aproximada do candidato.
              Linhas sem candidato mantêm apenas os dados Fenabrave.
            </p>
          </div>
        </div>
      </section>

      <section className="min-w-0 rounded border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-base font-bold text-slate-950">{config.tableTitle}</h2>
          <p className="text-sm text-slate-500">
            Ordenado por emplacamentos acumulados de 2026. Candidatos ambiguos aparecem como match aproximado.
          </p>
        </div>

        {loading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="grid gap-3 px-4 py-4 lg:grid-cols-[56px_1.2fr_170px_170px_150px]">
                <span className="h-6 animate-pulse rounded bg-slate-100" />
                <span className="h-6 animate-pulse rounded bg-slate-100" />
                <span className="h-6 animate-pulse rounded bg-slate-100" />
                <span className="h-6 animate-pulse rounded bg-slate-100" />
                <span className="h-6 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="px-4 py-6 text-sm text-slate-500">
            Nao foi possivel carregar o ranking Fenabrave por segmento.
          </p>
        ) : vehicles.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-500">
            Nenhum modelo Fenabrave disponivel para este segmento.
          </p>
        ) : (
          <div className="min-w-0 overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-bold">Pos.</th>
                  <th className="px-4 py-3 font-bold">Fenabrave</th>
                  <th className="px-4 py-3 font-bold">Emplacamentos</th>
                  <th className="px-4 py-3 font-bold">Preco FIPE</th>
                  <th className="px-4 py-3 font-bold">Variacao FIPE 12m</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.map((item, index) => {
                  const candidate = item.best_fipe_candidate
                  const hasCandidate = Boolean(candidate)

                  return (
                    <tr
                      key={`${item.fenabrave_segment}-${item.rank}-${item.brand_original}-${item.model_original}`}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 align-top">
                        <span className="font-mono text-sm font-bold text-slate-400">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-950">
                            {item.brand_original} {item.model_original}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.fenabrave_segment} | rank Fenabrave {item.rank}
                          </p>
                          {candidate ? (
                            <Link
                              to={`/carro/${candidate.slug}`}
                              className="mt-1 inline-flex max-w-lg items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-950"
                            >
                              <span className="truncate">
                                FIPE: {candidate.brand} {candidate.model}
                              </span>
                              <ExternalLink size={12} className="shrink-0" />
                            </Link>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span className="font-mono text-sm font-bold text-slate-950">
                          {numberFormatter.format(item.registrations_accumulated ?? 0)}
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">
                          Maio: {numberFormatter.format(item.registrations_month ?? 0)}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span className="font-mono text-sm font-bold text-slate-950">
                          {formatOptionalCurrency(candidate?.latest_price)}
                        </span>
                        {candidate ? (
                          <span className="mt-1 block text-xs text-slate-500">
                            Ref. {monthLabel(candidate.latest_reference_month)}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span className="font-mono text-sm font-bold text-slate-700">
                          {formatOptionalPercent(candidate?.change_12m_pct)}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span className={`inline-flex items-center rounded border px-2 py-1 text-xs font-bold ${matchClass(item.match_status, hasCandidate)}`}>
                          {matchLabel(item.match_status, hasCandidate)}
                        </span>
                        {candidate ? (
                          <span className="mt-1 block font-mono text-[11px] text-slate-500">
                            score {candidate.similarity_score ?? 'n/d'}
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded border border-slate-200 bg-white p-5">
        <h2 className="text-base font-bold text-slate-950">Links relacionados</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            to="/mais-vendidos"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Mais vendidos
            <ArrowRight size={14} />
          </Link>
          <Link
            to={config.segment === 'suv' ? '/picapes-mais-vendidas' : '/suvs-mais-vendidos'}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            {config.segment === 'suv' ? 'Picapes mais vendidas' : 'SUVs mais vendidos'}
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  )
}
