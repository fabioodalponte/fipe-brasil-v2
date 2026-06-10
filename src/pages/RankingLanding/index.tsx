import { ArrowLeft, ArrowRight, BarChart3 } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { PageHero } from '../../components/layout/PageHero'
import { RankingList } from '../../components/rankings/RankingList'
import { JsonLd } from '../../components/seo/JsonLd'
import { SEO } from '../../components/seo/SEO'
import { useMarketRankings } from '../../hooks/useMarketRankings'
import type { MarketRankingKey, RankingEntry, RankingTone } from '../../services/marketRankings'
import { formatCurrency, numberFormatter } from '../../utils/formatters'
import { breadcrumbList, collectionPage } from '../../utils/structuredData'

type RankingLandingConfig = {
  path: string
  title: string
  seoTitle: string
  description: string
  intro: string
  rankingKey: MarketRankingKey
  badge: {
    label: string
    tone: RankingTone
  }
  metricLabel: string
  emptyLabel: string
}

const RANKING_PAGES: Record<string, RankingLandingConfig> = {
  '/mais-valorizados': {
    path: '/mais-valorizados',
    title: 'Carros mais valorizados',
    seoTitle: 'Carros mais valorizados na FIPE | FIPE Brasil',
    description:
      'Ranking real dos carros com maior valorizacao em 12 meses, calculado a partir da serie historica FIPE disponivel.',
    intro:
      'Este ranking usa a variacao real de 12 meses calculada a partir dos snapshots historicos. Veiculos sem historico suficiente nao entram na lista.',
    rankingKey: 'topAppreciation',
    badge: { label: '12 meses', tone: 'positive' },
    metricLabel: 'Valorizacao 12m',
    emptyLabel: 'Sem veiculos com valorizacao real em 12 meses.',
  },
  '/mais-desvalorizados': {
    path: '/mais-desvalorizados',
    title: 'Carros mais desvalorizados',
    seoTitle: 'Carros mais desvalorizados na FIPE | FIPE Brasil',
    description:
      'Ranking real dos carros com maior queda de preco em 12 meses, calculado a partir da serie historica FIPE disponivel.',
    intro:
      'A lista considera apenas variacoes reais de 12 meses. Quando o historico do veiculo e insuficiente, ele nao e usado neste ranking.',
    rankingKey: 'topDepreciation',
    badge: { label: '12 meses', tone: 'negative' },
    metricLabel: 'Desvalorizacao 12m',
    emptyLabel: 'Sem veiculos com desvalorizacao real em 12 meses.',
  },
  '/mais-caros': {
    path: '/mais-caros',
    title: 'Carros mais caros',
    seoTitle: 'Carros mais caros na tabela FIPE | FIPE Brasil',
    description:
      'Ranking real dos veiculos mais caros da base FIPE Brasil, ordenado pelo preco FIPE atual disponivel.',
    intro:
      'Este ranking ordena os veiculos pelo preco FIPE atual disponivel no banco. A lista nao inclui forecast nem recomendacao de compra ou venda.',
    rankingKey: 'topExpensive',
    badge: { label: 'Preco FIPE', tone: 'neutral' },
    metricLabel: 'Preco FIPE',
    emptyLabel: 'Sem veiculos com preco FIPE disponivel.',
  },
  '/mais-baratos': {
    path: '/mais-baratos',
    title: 'Carros mais baratos',
    seoTitle: 'Carros mais baratos na tabela FIPE | FIPE Brasil',
    description:
      'Ranking real dos veiculos mais baratos da base FIPE Brasil, ordenado pelo menor preco FIPE atual disponivel.',
    intro:
      'Este ranking ordena os veiculos pelo menor preco FIPE atual disponivel no banco. A leitura e factual e baseada somente nos dados existentes.',
    rankingKey: 'topAffordable',
    badge: { label: 'Preco FIPE', tone: 'neutral' },
    metricLabel: 'Preco FIPE',
    emptyLabel: 'Sem veiculos com preco FIPE disponivel.',
  },
}

const INTERNAL_LINKS = [
  { to: '/mais-valorizados', label: 'Mais valorizados' },
  { to: '/mais-desvalorizados', label: 'Mais desvalorizados' },
  { to: '/mais-caros', label: 'Mais caros' },
  { to: '/mais-baratos', label: 'Mais baratos' },
]

function metricClass(tone: RankingTone): string {
  if (tone === 'positive') return 'text-emerald-700'
  if (tone === 'negative') return 'text-rose-700'
  return 'text-slate-900'
}

function vehicleSubtitle(entry: RankingEntry): string {
  const { vehicle } = entry
  return [vehicle.brand, vehicle.segment, vehicle.year ? String(vehicle.year) : null]
    .filter(Boolean)
    .join(' | ')
}

export function RankingLandingPage() {
  const location = useLocation()
  const config = RANKING_PAGES[location.pathname] ?? RANKING_PAGES['/mais-caros']
  const { rankings, loading, error } = useMarketRankings(20)
  const entries = rankings?.[config.rankingKey] ?? []
  const vehicles = entries.map((entry) => entry.vehicle)
  const toneClass = metricClass(config.badge.tone)

  return (
    <div className="min-w-0 space-y-5">
      <SEO
        title={config.seoTitle}
        description={config.description}
        canonicalPath={config.path}
      />
      <JsonLd
        id="ranking-breadcrumb"
        data={breadcrumbList([
          { name: 'Home', path: '/' },
          { name: config.title, path: config.path },
        ])}
      />
      <JsonLd
        id="ranking-collection"
        data={collectionPage({
          name: config.title,
          path: config.path,
          vehicles,
        })}
      />

      <PageHero
        eyebrow="Ranking FIPE"
        title={config.title}
        subtitle={config.description}
      >
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-950">
          <ArrowLeft size={16} />
          Voltar para a Home
        </Link>
      </PageHero>

      <section className="grid min-w-0 gap-5 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="min-w-0 space-y-5">
          <section className="rounded border border-slate-200 bg-white p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-700">
                <BarChart3 size={18} />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-950">Como este ranking e calculado</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{config.intro}</p>
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded border border-slate-100 bg-slate-50 p-3">
                <dt className="text-xs font-bold uppercase text-slate-500">Itens</dt>
                <dd className="mt-1 font-mono text-2xl font-bold text-slate-950">
                  {loading ? '...' : numberFormatter.format(entries.length)}
                </dd>
              </div>
              <div className="rounded border border-slate-100 bg-slate-50 p-3">
                <dt className="text-xs font-bold uppercase text-slate-500">Fonte</dt>
                <dd className="mt-2 text-xs font-bold text-slate-700">/api/market/rankings</dd>
              </div>
            </dl>
          </section>

          <section className="rounded border border-slate-200 bg-white p-5">
            <h2 className="text-base font-bold text-slate-950">Outros rankings</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {INTERNAL_LINKS.filter((item) => item.to !== config.path).map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  {item.label}
                  <ArrowRight size={14} />
                </Link>
              ))}
            </div>
          </section>
        </div>

        <section className="min-w-0">
          <RankingList
            title={config.title}
            badge={config.badge}
            entries={entries}
            loading={loading}
            error={error}
            emptyLabel={config.emptyLabel}
          />
        </section>
      </section>

      <section className="min-w-0 rounded border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-base font-bold text-slate-950">Lista completa</h2>
          <p className="text-sm text-slate-500">
            Cada veiculo abre sua pagina individual. A coluna principal mostra {config.metricLabel.toLowerCase()}.
          </p>
        </div>
        {loading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="grid gap-3 px-4 py-4 md:grid-cols-[44px_1fr_160px_160px]">
                <span className="h-6 animate-pulse rounded bg-slate-100" />
                <span className="h-6 animate-pulse rounded bg-slate-100" />
                <span className="h-6 animate-pulse rounded bg-slate-100" />
                <span className="h-6 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="px-4 py-6 text-sm text-slate-500">Nao foi possivel carregar o ranking real.</p>
        ) : entries.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-500">{config.emptyLabel}</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {entries.map((entry, index) => (
              <Link
                key={entry.vehicle.id}
                to={`/carro/${entry.vehicle.id}`}
                className="grid min-w-0 gap-3 px-4 py-4 transition hover:bg-slate-50 md:grid-cols-[44px_1fr_160px_160px] md:items-center"
              >
                <span className="font-mono text-sm font-bold text-slate-400">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-slate-950">
                    {entry.vehicle.name}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {vehicleSubtitle(entry)}
                  </span>
                </span>
                <span className={`font-mono text-sm font-bold ${toneClass}`}>
                  {entry.formatted}
                </span>
                <span className="font-mono text-sm font-bold text-slate-700">
                  {formatCurrency(entry.vehicle.price)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
