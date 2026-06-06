import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { SEO } from '../../components/seo/SEO'
import { JsonLd } from '../../components/seo/JsonLd'
import { PageHero } from '../../components/layout/PageHero'
import { StatGrid } from '../../components/layout/StatGrid'
import { RankingList } from '../../components/rankings/RankingList'
import { VehicleGrid } from '../../components/vehicles/VehicleGrid'
import { useCategoryPage } from '../../hooks/useCategoryPage'
import { toAppreciationEntry, toPriceEntry } from '../../services/marketRankings'
import { formatCurrency, formatPercent } from '../../utils/formatters'
import { breadcrumbList, collectionPage } from '../../utils/structuredData'

export function CategoryPage() {
  const { slug } = useParams()
  const { page, loading, error } = useCategoryPage(slug)

  if (loading) {
    return <div className="h-64 animate-pulse rounded border border-slate-200 bg-slate-100" />
  }

  if (error || !page) {
    return (
      <div className="rounded border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-bold text-slate-950">Categoria nao encontrada</h1>
        <p className="mt-2 text-sm text-slate-600">
          Nao encontramos veiculos para esta categoria nos dados disponiveis.
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
      <SEO
        title={`${page.name}s: precos FIPE, valorizacao e rankings | FIPE Brasil`}
        description={`Compare ${page.name}s por preco FIPE, valorizacao em 12 meses, preco medio e principais modelos.`}
        canonicalPath={`/categoria/${page.slug}`}
      />
      <JsonLd
        id="category-collection"
        data={collectionPage({
          name: `${page.name}s`,
          path: `/categoria/${page.slug}`,
          vehicles: page.vehicles,
        })}
      />
      <JsonLd
        id="category-breadcrumb"
        data={breadcrumbList([
          { name: 'Home', path: '/' },
          { name: page.name, path: `/categoria/${page.slug}` },
        ])}
      />
      <PageHero
        eyebrow="Categoria"
        title={page.name}
        subtitle={`${page.vehicleCount} veiculos monitorados | preco medio ${formatCurrency(page.averagePrice)}`}
      >
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-950">
          <ArrowLeft size={16} />
          Todas as categorias
        </Link>
      </PageHero>

      <StatGrid
        stats={[
          { label: 'Veiculos', value: String(page.vehicleCount) },
          { label: 'Preco medio', value: formatCurrency(page.averagePrice) },
          {
            label: 'Valorizacao media 12m',
            value: formatPercent(page.averageYearlyChange),
            tone: page.averageYearlyChange >= 0 ? 'positive' : 'negative',
          },
        ]}
      />

      <section className="grid min-w-0 gap-5 xl:grid-cols-2">
        <RankingList
          title="Mais valorizados da categoria"
          badge={{ label: '12 meses', tone: 'positive' }}
          entries={page.mostAppreciated.map(toAppreciationEntry)}
          emptyLabel="Sem dados de variacao nesta categoria."
        />
        <RankingList
          title="Mais baratos da categoria"
          badge={{ label: 'preco FIPE' }}
          entries={page.cheapest.map(toPriceEntry)}
          emptyLabel="Sem dados de preco nesta categoria."
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-950">Veiculos {page.name}</h2>
        <VehicleGrid vehicles={page.vehicles} emptyLabel="Nenhum veiculo nesta categoria." />
      </section>
    </div>
  )
}
