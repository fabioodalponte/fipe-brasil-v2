import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { PageHero } from '../../components/layout/PageHero'
import { StatGrid } from '../../components/layout/StatGrid'
import { RankingList } from '../../components/rankings/RankingList'
import { VehicleGrid } from '../../components/vehicles/VehicleGrid'
import { useBrandPage } from '../../hooks/useBrandPage'
import { toAppreciationEntry } from '../../services/marketRankings'
import { formatCurrency, formatPercent } from '../../utils/formatters'

export function BrandPage() {
  const { slug } = useParams()
  const { page, loading, error } = useBrandPage(slug)

  if (loading) {
    return <div className="h-64 animate-pulse rounded border border-slate-200 bg-slate-100" />
  }

  if (error || !page) {
    return (
      <div className="rounded border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-bold text-slate-950">Marca nao encontrada</h1>
        <p className="mt-2 text-sm text-slate-600">
          Nao encontramos veiculos para esta marca nos dados disponiveis.
        </p>
        <Link to="/" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-slate-700">
          <ArrowLeft size={16} />
          Voltar para a Home
        </Link>
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-5">
      <PageHero
        eyebrow="Marca"
        title={page.name}
        subtitle={`${page.vehicleCount} veiculos monitorados | preco medio ${formatCurrency(page.averagePrice)}`}
      >
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-950">
          <ArrowLeft size={16} />
          Todas as marcas
        </Link>
      </PageHero>

      <StatGrid
        stats={[
          { label: 'Veiculos', value: String(page.vehicleCount) },
          { label: 'Preco medio', value: formatCurrency(page.averagePrice) },
          {
            label: 'Maior valorizacao 12m',
            value: page.topAppreciation ? formatPercent(page.topAppreciation.yearlyChange) : '—',
            tone: 'positive',
          },
          {
            label: 'Maior desvalorizacao 12m',
            value: page.topDepreciation ? formatPercent(page.topDepreciation.yearlyChange) : '—',
            tone: page.topDepreciation ? 'negative' : 'neutral',
          },
        ]}
      />

      <RankingList
        title={`Ranking ${page.name} por valorizacao`}
        badge={{ label: '12 meses', tone: 'positive' }}
        entries={page.ranking.map(toAppreciationEntry)}
        emptyLabel="Sem dados de variacao para esta marca."
      />

      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-950">Veiculos {page.name}</h2>
        <VehicleGrid vehicles={page.vehicles} emptyLabel="Nenhum veiculo desta marca." />
      </section>
    </div>
  )
}
