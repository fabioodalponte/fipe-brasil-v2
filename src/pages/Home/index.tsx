import { useState } from 'react'
import { GitCompareArrows } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SEO } from '../../components/seo/SEO'
import { JsonLd } from '../../components/seo/JsonLd'
import { SearchAutocomplete } from '../../components/search/SearchAutocomplete'
import { RankingList } from '../../components/rankings/RankingList'
import { VehicleCard } from '../../components/cards/VehicleCard'
import { popularComparisons } from '../../services/compareVehicles'
import { useHomeData } from '../../hooks/useHomeData'
import { useFenabraveBestSelling } from '../../hooks/useFenabraveBestSelling'
import { useMarketRankings } from '../../hooks/useMarketRankings'
import type { FenabraveBestSellingVehicle } from '../../services/fenabraveRankings'
import { numberFormatter } from '../../utils/formatters'
import { breadcrumbList } from '../../utils/structuredData'

const quickLinks = [
  { to: '/mais-vendidos', label: 'Mais vendidos' },
  { to: '/suvs-mais-vendidos', label: 'SUVs mais vendidos' },
  { to: '/picapes-mais-vendidas', label: 'Picapes mais vendidas' },
  { to: '/mais-valorizados', label: 'Mais valorizados' },
  { to: '/compare', label: 'Comparar veiculos' },
]

const rankingLandingLinks = [
  { to: '/mais-vendidos', label: 'Mais vendidos' },
  { to: '/suvs-mais-vendidos', label: 'SUVs mais vendidos' },
  { to: '/picapes-mais-vendidas', label: 'Picapes mais vendidas' },
  { to: '/mais-valorizados', label: 'Mais valorizados' },
  { to: '/mais-desvalorizados', label: 'Mais desvalorizados' },
  { to: '/mais-caros', label: 'Mais caros' },
  { to: '/mais-baratos', label: 'Mais baratos' },
]

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

function monthLabel(reference: string | null): string {
  if (!reference) return ''
  const [year, month] = reference.split('-')
  const name = MESES[Number(month) - 1]
  return name ? `${name} de ${year}` : reference
}

function BestSellingList({
  vehicles,
  loading,
  error,
}: {
  vehicles: FenabraveBestSellingVehicle[]
  loading: boolean
  error: boolean
}) {
  return (
    <section className="min-w-0 rounded border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h2 className="text-base font-bold text-slate-950">Mais vendidos</h2>
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
          Fenabrave
        </span>
      </div>

      {loading ? (
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 px-4 py-3">
              <span className="h-8 w-full animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : error || vehicles.length === 0 ? (
        <p className="px-4 py-6 text-sm text-slate-500">Nao foi possivel carregar este ranking.</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {vehicles.map((vehicle, index) => {
            const name = `${vehicle.brand_original} ${vehicle.model_original}`
            const registrations =
              vehicle.registrations_month != null
                ? `${numberFormatter.format(vehicle.registrations_month)} emplacamentos`
                : vehicle.category
            // `vehicle.rank` e o rank dentro da categoria Fenabrave (repete entre
            // categorias); a posicao exibida e a da lista agregada.
            const row = (
              <>
                <span className="font-mono text-sm font-bold text-slate-400">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-900">{name}</span>
                  <span className="block truncate text-xs text-slate-500">{registrations}</span>
                </span>
              </>
            )
            const slug = vehicle.best_fipe_candidate?.slug
            const key = `${vehicle.category}-${vehicle.rank}`
            return slug ? (
              <Link
                key={key}
                to={`/carro/${slug}`}
                className="grid grid-cols-[28px_1fr] items-center gap-3 px-4 py-3 transition hover:bg-slate-50"
              >
                {row}
              </Link>
            ) : (
              <div key={key} className="grid grid-cols-[28px_1fr] items-center gap-3 px-4 py-3">
                {row}
              </div>
            )
          })}
        </div>
      )}

      {!loading && !error ? (
        <div className="border-t border-slate-100 px-4 py-3">
          <Link to="/mais-vendidos" className="text-sm font-bold text-slate-700 hover:text-slate-950">
            Ver ranking completo →
          </Link>
        </div>
      ) : null}
    </section>
  )
}

export function HomePage() {
  const [showAllBrands, setShowAllBrands] = useState(false)
  const { data: homeData, loading: homeLoading, error: homeError } = useHomeData()
  const { rankings, loading, error } = useMarketRankings(5)
  const {
    vehicles: bestSelling,
    loading: bestSellingLoading,
    error: bestSellingError,
  } = useFenabraveBestSelling(5)
  const stats = homeData?.marketStats
  const brands = homeData?.brands ?? []

  return (
    <div className="min-w-0 space-y-8">
      <SEO
        title="FIPE Brasil — Inteligencia de mercado automotivo"
        description="Consulte precos FIPE, historico, rankings reais de preco e variacao do mercado automotivo brasileiro."
        canonicalPath="/"
      />
      <JsonLd id="home-breadcrumb" data={breadcrumbList([{ name: 'Home', path: '/' }])} />

      <section className="min-w-0 rounded border border-slate-200 bg-white px-5 py-10 md:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold leading-tight text-slate-950 md:text-4xl">
            Preço FIPE, histórico e rankings do mercado automotivo
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Busque um veículo e veja o preço atual, a valorização e como ele se compara com o mercado.
          </p>
          <div className="mt-7">
            <SearchAutocomplete placeholder="Digite Corolla, Civic, Compass ou codigo FIPE" />
          </div>
          <p className="mt-4 text-sm text-slate-500">
            {stats
              ? `${numberFormatter.format(stats.totalVehicles)} veículos monitorados · referência ${monthLabel(stats.latestReferenceMonth)} · dados da tabela FIPE`
              : 'Dados da tabela FIPE com histórico mensal real'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {quickLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="min-w-0">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-950">Destaques do mês</h2>
          <p className="text-sm text-slate-500">
            {stats?.latestReferenceMonth ? `Referência ${monthLabel(stats.latestReferenceMonth)}` : ''}
          </p>
        </div>
        <div className="grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <RankingList
            title="Maior valorização"
            badge={{ label: '12 meses', tone: 'positive' }}
            entries={rankings?.topAppreciation ?? []}
            loading={loading}
            error={error}
            emptyLabel="Sem veiculos com valorizacao real em 12 meses."
            footerLink={{ to: '/mais-valorizados', label: 'Ver ranking completo' }}
          />
          <RankingList
            title="Maior desvalorização"
            badge={{ label: '12 meses', tone: 'negative' }}
            entries={rankings?.topDepreciation ?? []}
            loading={loading}
            error={error}
            emptyLabel="Sem veiculos com desvalorizacao real em 12 meses."
            footerLink={{ to: '/mais-desvalorizados', label: 'Ver ranking completo' }}
          />
          <BestSellingList
            vehicles={bestSelling}
            loading={bestSellingLoading}
            error={bestSellingError}
          />
        </div>
      </section>

      <section className="min-w-0">
        <h2 className="mb-3 text-lg font-bold text-slate-950">Explore por categoria</h2>
        {homeLoading ? (
          <div className="grid min-w-0 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded border border-slate-200 bg-slate-100" />
            ))}
          </div>
        ) : homeError || !homeData || homeData.categories.length === 0 ? (
          <p className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-500">
            Categorias indisponiveis.
          </p>
        ) : (
          <div className="grid min-w-0 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
            {homeData.categories.map((category) => (
              <Link
                key={category.slug}
                to={`/categoria/${category.slug}`}
                className="rounded border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <span className="block text-base font-bold capitalize text-slate-950">{category.name}</span>
                <span className="mt-1 block text-sm text-slate-500">
                  {numberFormatter.format(category.count)} veículos
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="min-w-0 rounded border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold text-slate-950">Comparações populares</h2>
        <p className="mt-1 text-sm text-slate-500">
          Veja lado a lado preço, histórico e variação de dois veículos.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
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
      </section>

      <section className="min-w-0">
        <h2 className="mb-3 text-lg font-bold text-slate-950">Veículos em destaque</h2>
        {homeLoading ? (
          <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-32 animate-pulse rounded border border-slate-200 bg-slate-100" />
            ))}
          </div>
        ) : homeError || !homeData || homeData.featuredVehicles.length === 0 ? (
          <p className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-500">
            Nao foi possivel carregar os veiculos em destaque.
          </p>
        ) : (
          <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {homeData.featuredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </section>

      <section className="min-w-0 rounded border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold text-slate-950">Navegue pelo FIPE Brasil</h2>

        <h3 className="mt-4 text-sm font-bold uppercase text-slate-500">Rankings</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {rankingLandingLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <h3 className="mt-5 text-sm font-bold uppercase text-slate-500">Marcas</h3>
        {homeLoading ? (
          <p className="mt-2 text-sm text-slate-500">Carregando marcas...</p>
        ) : homeError || brands.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Marcas indisponiveis.</p>
        ) : (
          <>
            {/* Todas as marcas ficam no DOM (links internos para crawlers no HTML
                prerenderizado); o recolhimento e so visual, via max-height. */}
            <div className={`mt-2 flex flex-wrap gap-2 ${showAllBrands ? '' : 'max-h-24 overflow-hidden'}`}>
              {brands.map((brand) => (
                <Link
                  key={brand.slug}
                  to={`/marca/${brand.slug}`}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  {brand.name}
                </Link>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowAllBrands((value) => !value)}
              className="mt-3 rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              {showAllBrands
                ? 'Mostrar menos'
                : `Ver todas as ${numberFormatter.format(brands.length)} marcas`}
            </button>
          </>
        )}
      </section>
    </div>
  )
}
