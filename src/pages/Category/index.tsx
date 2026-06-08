import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { SEO } from '../../components/seo/SEO'
import { JsonLd } from '../../components/seo/JsonLd'
import { PageHero } from '../../components/layout/PageHero'
import { StatGrid } from '../../components/layout/StatGrid'
import { RankingList } from '../../components/rankings/RankingList'
import { VehicleGrid } from '../../components/vehicles/VehicleGrid'
import { useCategoryPage } from '../../hooks/useCategoryPage'
import { toPriceEntry } from '../../services/marketRankings'
import { formatCurrency } from '../../utils/formatters'
import { slugify } from '../../utils/slug'
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
        <h1 className="text-xl font-bold text-slate-950">Categoria não encontrada</h1>
        <p className="mt-2 text-sm text-slate-600">
          Não encontramos veículos para esta categoria nos dados disponíveis.
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
        title={`${page.name}s - Preços FIPE, modelos e análise | FIPE Brasil`}
        description={`${page.totalVehicles} ${page.name}s na tabela FIPE. Preço médio ${formatCurrency(
          page.averagePrice,
        )}, do mais caro (${formatCurrency(page.highestPrice)}) ao mais barato (${formatCurrency(
          page.lowestPrice,
        )}), marcas e modelos.`}
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
        subtitle={`${page.totalVehicles} veículos monitorados | preço médio ${formatCurrency(page.averagePrice)}`}
      >
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-950">
          <ArrowLeft size={16} />
          Todas as categorias
        </Link>
      </PageHero>

      <StatGrid
        stats={[
          { label: 'Veículos', value: String(page.totalVehicles) },
          { label: 'Preço médio', value: formatCurrency(page.averagePrice) },
          { label: 'Maior preço', value: formatCurrency(page.highestPrice) },
          { label: 'Menor preço', value: formatCurrency(page.lowestPrice) },
        ]}
      />

      <section className="rounded border border-slate-200 bg-white p-4">
        <h2 className="text-base font-bold text-slate-950">Marcas na categoria</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {page.brands.slice(0, 16).map((b) => (
            <Link
              key={b.brand}
              to={`/marca/${slugify(b.brand)}`}
              className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
            >
              {b.brand}
              <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] text-slate-500">
                {b.count}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-2">
        <RankingList
          title={`${page.name}s: mais caros`}
          badge={{ label: 'Preço FIPE', tone: 'neutral' }}
          entries={page.topExpensive.map(toPriceEntry)}
          emptyLabel="Sem dados de preço nesta categoria."
        />
        <RankingList
          title={`${page.name}s: mais baratos`}
          badge={{ label: 'Preço FIPE', tone: 'neutral' }}
          entries={page.topAffordable.map(toPriceEntry)}
          emptyLabel="Sem dados de preço nesta categoria."
        />
      </section>

      <section className="rounded border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500">
        Valorização média (12 meses): <span className="font-bold text-slate-700">em breve</span> — depende da série histórica de variação.
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-950">Veículos {page.name}</h2>
        <VehicleGrid vehicles={page.vehicles} emptyLabel="Nenhum veículo nesta categoria." />
      </section>
    </div>
  )
}
