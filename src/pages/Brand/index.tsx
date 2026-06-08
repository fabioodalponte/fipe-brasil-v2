import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { SEO } from '../../components/seo/SEO'
import { JsonLd } from '../../components/seo/JsonLd'
import { PageHero } from '../../components/layout/PageHero'
import { StatGrid } from '../../components/layout/StatGrid'
import { RankingList } from '../../components/rankings/RankingList'
import { VehicleGrid } from '../../components/vehicles/VehicleGrid'
import { useBrandPage } from '../../hooks/useBrandPage'
import { toPriceEntry } from '../../services/marketRankings'
import { formatCurrency } from '../../utils/formatters'
import { breadcrumbList, collectionPage } from '../../utils/structuredData'

export function BrandPage() {
  const { slug } = useParams()
  const { page, loading, error } = useBrandPage(slug)

  if (loading) {
    return <div className="h-64 animate-pulse rounded border border-slate-200 bg-slate-100" />
  }

  if (error || !page) {
    return (
      <div className="rounded border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-bold text-slate-950">Marca não encontrada</h1>
        <p className="mt-2 text-sm text-slate-600">
          Não encontramos veículos para esta marca nos dados disponíveis.
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
        title={`Carros ${page.name}: preços FIPE, modelos e rankings | FIPE Brasil`}
        description={`${page.totalVehicles} veículos ${page.name} na tabela FIPE. Preço médio ${formatCurrency(
          page.averagePrice,
        )}, do mais caro (${formatCurrency(page.highestPrice)}) ao mais barato (${formatCurrency(
          page.lowestPrice,
        )}), distribuição por segmento e modelos.`}
        canonicalPath={`/marca/${page.slug}`}
      />
      <JsonLd
        id="brand-collection"
        data={collectionPage({
          name: `Carros ${page.name}`,
          path: `/marca/${page.slug}`,
          vehicles: page.vehicles,
        })}
      />
      <JsonLd
        id="brand-breadcrumb"
        data={breadcrumbList([
          { name: 'Home', path: '/' },
          { name: page.name, path: `/marca/${page.slug}` },
        ])}
      />
      <PageHero
        eyebrow="Marca"
        title={page.name}
        subtitle={`${page.totalVehicles} veículos monitorados | preço médio ${formatCurrency(page.averagePrice)}`}
      >
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-950">
          <ArrowLeft size={16} />
          Todas as marcas
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
        <h2 className="text-base font-bold text-slate-950">Distribuição por segmento</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {page.segments.map((seg) => (
            <span
              key={seg.segment}
              className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700"
            >
              {seg.segment}
              <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] text-slate-500">
                {seg.count}
              </span>
            </span>
          ))}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <RankingList
          title={`${page.name}: mais caros`}
          badge={{ label: 'Preço FIPE', tone: 'neutral' }}
          entries={page.mostExpensive.map(toPriceEntry)}
          emptyLabel="Sem dados de preço para esta marca."
        />
        <RankingList
          title={`${page.name}: mais baratos`}
          badge={{ label: 'Preço FIPE', tone: 'neutral' }}
          entries={page.cheapest.map(toPriceEntry)}
          emptyLabel="Sem dados de preço para esta marca."
        />
      </div>

      <section className="rounded border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500">
        Ranking de valorização (12 meses): <span className="font-bold text-slate-700">em breve</span> — depende da série histórica de variação.
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-950">Veículos {page.name}</h2>
        <VehicleGrid vehicles={page.vehicles} emptyLabel="Nenhum veículo desta marca." />
      </section>
    </div>
  )
}
