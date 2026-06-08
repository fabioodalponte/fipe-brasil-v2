import { ArrowRight, Database, ExternalLink, Info, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHero } from '../../components/layout/PageHero'
import { JsonLd } from '../../components/seo/JsonLd'
import { SEO } from '../../components/seo/SEO'
import { useFenabraveBestSelling } from '../../hooks/useFenabraveBestSelling'
import type { FenabraveBestSellingVehicle } from '../../services/fenabraveRankings'
import { absoluteUrl, breadcrumbList } from '../../utils/structuredData'
import { formatCurrency, formatPercent, numberFormatter } from '../../utils/formatters'

const PAGE_PATH = '/mais-vendidos'
const PAGE_TITLE = 'Carros mais vendidos do Brasil em 2026'
const PAGE_DESCRIPTION =
  'Ranking dos carros mais vendidos do Brasil em 2026 com emplacamentos Fenabrave e candidatos de preco FIPE quando disponiveis.'

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

function collectionJsonLd(vehicles: FenabraveBestSellingVehicle[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: absoluteUrl(PAGE_PATH),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: vehicles.length,
      itemListElement: vehicles.map((vehicle, index) => {
        const candidate = vehicle.best_fipe_candidate
        return {
          '@type': 'ListItem',
          position: index + 1,
          name: `${vehicle.brand_original} ${vehicle.model_original}`,
          ...(candidate ? { url: absoluteUrl(`/vehicle/${candidate.slug}`) } : {}),
        }
      }),
    },
  }
}

function totalAccumulated(vehicles: FenabraveBestSellingVehicle[]): number {
  return vehicles.reduce((sum, item) => sum + (item.registrations_accumulated ?? 0), 0)
}

export function BestSellingPage() {
  const { vehicles, loading, error } = useFenabraveBestSelling(50)
  const matchedCount = vehicles.filter((item) => item.best_fipe_candidate).length
  const accumulated = totalAccumulated(vehicles)

  return (
    <div className="min-w-0 space-y-5">
      <SEO
        title={`${PAGE_TITLE} | FIPE Brasil`}
        description={PAGE_DESCRIPTION}
        canonicalPath={PAGE_PATH}
      />
      <JsonLd
        id="best-selling-breadcrumb"
        data={breadcrumbList([
          { name: 'Home', path: '/' },
          { name: PAGE_TITLE, path: PAGE_PATH },
        ])}
      />
      <JsonLd id="best-selling-collection" data={collectionJsonLd(vehicles)} />

      <PageHero
        eyebrow="Fenabrave + FIPE"
        title={PAGE_TITLE}
        subtitle="Os emplacamentos vêm do ranking Fenabrave acumulado de 2026. Precos, variacao de 12 meses e links aparecem somente quando existe candidato FIPE consultavel."
      >
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700">
            <Database size={16} />
            Fenabrave staging
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
              A posicao, marca, modelo e volume vêm da Fenabrave. Quando a base encontrou um candidato FIPE,
              o preco e a variacao em 12 meses sao exibidos como referencia do candidato, nao como relacionamento
              definitivo entre Fenabrave e FIPE.
            </p>
          </div>
        </div>
      </section>

      <section className="min-w-0 rounded border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-base font-bold text-slate-950">Top 50 por emplacamentos acumulados</h2>
          <p className="text-sm text-slate-500">
            Ranking acumulado de 2026, ordenado por emplacamentos. Candidatos ambiguos aparecem como match aproximado.
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
            Nao foi possivel carregar o ranking Fenabrave.
          </p>
        ) : vehicles.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-500">
            Nenhum modelo Fenabrave disponivel para o ranking acumulado de 2026.
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
                  const row = (
                    <>
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
                            {item.category} | rank Fenabrave {item.rank}
                          </p>
                          {candidate ? (
                            <Link
                              to={`/vehicle/${candidate.slug}`}
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
                    </>
                  )

                  return candidate ? (
                    <tr key={`${item.category}-${item.rank}-${item.brand_original}-${item.model_original}`} className="transition hover:bg-slate-50">
                      {row}
                    </tr>
                  ) : (
                    <tr key={`${item.category}-${item.rank}-${item.brand_original}-${item.model_original}`}>
                      {row}
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
            to="/mais-valorizados"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Mais valorizados
            <ArrowRight size={14} />
          </Link>
          <Link
            to="/mais-caros"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Mais caros na FIPE
            <ExternalLink size={14} />
          </Link>
        </div>
      </section>
    </div>
  )
}
