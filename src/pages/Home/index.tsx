import { useMemo, useState } from 'react'
import { GitCompareArrows, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SEO } from '../../components/seo/SEO'
import { JsonLd } from '../../components/seo/JsonLd'
import { SearchAutocomplete } from '../../components/search/SearchAutocomplete'
import { MetricCard } from '../../components/cards/MetricCard'
import { RankingList } from '../../components/rankings/RankingList'
import { VehicleCard } from '../../components/cards/VehicleCard'
import { VehicleGrid } from '../../components/vehicles/VehicleGrid'
import { popularComparisons } from '../../services/compareVehicles'
import { useHomeData } from '../../hooks/useHomeData'
import { useHomeVehicles } from '../../hooks/useHomeVehicles'
import { useMarketRankings } from '../../hooks/useMarketRankings'
import { formatCurrency, numberFormatter } from '../../utils/formatters'
import { breadcrumbList } from '../../utils/structuredData'

const rankingLandingLinks = [
  { to: '/mais-valorizados', label: 'Mais valorizados' },
  { to: '/mais-desvalorizados', label: 'Mais desvalorizados' },
  { to: '/mais-caros', label: 'Mais caros' },
  { to: '/mais-baratos', label: 'Mais baratos' },
]

const priceBands = [
  { value: '', label: 'Todos os precos' },
  { value: '0-50000', label: 'Ate R$ 50 mil', maxPrice: 50_000 },
  { value: '50000-100000', label: 'R$ 50 mil a R$ 100 mil', minPrice: 50_000, maxPrice: 100_000 },
  { value: '100000-200000', label: 'R$ 100 mil a R$ 200 mil', minPrice: 100_000, maxPrice: 200_000 },
  { value: '200000-', label: 'Acima de R$ 200 mil', minPrice: 200_000 },
]

function monthLabel(reference: string | null): string {
  if (!reference) return 'n/d'
  const [year, month] = reference.split('-')
  return `${month}/${year}`
}

export function HomePage() {
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedSegment, setSelectedSegment] = useState('')
  const [selectedPriceBand, setSelectedPriceBand] = useState('')
  const { data: homeData, loading: homeLoading, error: homeError } = useHomeData()
  const { rankings, loading, error } = useMarketRankings(5)
  const useMock = import.meta.env.VITE_USE_MOCK === 'true'
  const stats = homeData?.marketStats
  const activePriceBand = priceBands.find((band) => band.value === selectedPriceBand) ?? priceBands[0]
  const homeVehicleFilters = useMemo(
    () => ({
      brand: selectedBrand || undefined,
      segment: selectedSegment || undefined,
      minPrice: activePriceBand.minPrice,
      maxPrice: activePriceBand.maxPrice,
    }),
    [selectedBrand, selectedSegment, activePriceBand.minPrice, activePriceBand.maxPrice],
  )
  const {
    vehicles: exploreVehicles,
    loading: exploreLoading,
    error: exploreError,
  } = useHomeVehicles(homeVehicleFilters)
  const hasHomeVehicleFilters = Boolean(selectedBrand || selectedSegment || selectedPriceBand)

  function clearHomeVehicleFilters() {
    setSelectedBrand('')
    setSelectedSegment('')
    setSelectedPriceBand('')
  }

  return (
    <div className="min-w-0 space-y-5">
      <SEO
        title="FIPE Brasil — Inteligencia de mercado automotivo"
        description="Consulte precos FIPE, historico, rankings reais de preco e variacao do mercado automotivo brasileiro."
        canonicalPath="/"
      />
      <JsonLd id="home-breadcrumb" data={breadcrumbList([{ name: 'Home', path: '/' }])} />
      <section className="grid min-w-0 gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="min-w-0 rounded border border-slate-200 bg-white p-5">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase text-emerald-700">Mercado aberto</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-600">
              {useMock ? 'Mock data | UX lab' : 'Rankings reais FIPE'}
            </span>
          </div>
          <h1 className="max-w-3xl break-words text-2xl font-bold leading-tight text-slate-950 sm:text-3xl md:text-5xl">
            Inteligencia de mercado para precos FIPE, variacao real e rankings por categoria.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Explore veiculos, compare historico e acompanhe o IFB em uma interface de leitura rapida inspirada em terminais financeiros.
          </p>
          <div className="mt-6 flex min-w-0 flex-col gap-3 rounded border border-slate-200 bg-slate-50 p-2 md:flex-row">
            <SearchAutocomplete
              className="flex-1"
              placeholder="Digite Corolla, Civic, Compass ou codigo FIPE"
            />
            <button
              type="button"
              onClick={() => document.getElementById('explorar-veiculos')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center justify-center gap-2 rounded border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700"
            >
              <SlidersHorizontal size={16} />
              Filtros
            </button>
          </div>
        </div>

        <div className="min-w-0 rounded border border-slate-200 bg-slate-950 p-5 text-white">
          <p className="text-[11px] font-bold uppercase text-slate-400">Base FIPE atual</p>
          <strong className="mt-3 block font-mono text-5xl">
            {stats ? numberFormatter.format(stats.totalVehicles) : '—'}
          </strong>
          <p className="mt-2 font-mono text-sm font-bold text-emerald-300">
            Referencia {monthLabel(stats?.latestReferenceMonth ?? null)}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-400">Preco medio</p>
              <p className="mt-1 font-bold">
                {stats?.averagePrice != null ? formatCurrency(stats.averagePrice) : '—'}
              </p>
            </div>
            <div className="rounded border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-400">Maior preco</p>
              <p className="mt-1 font-bold">
                {stats?.highestPrice != null ? formatCurrency(stats.highestPrice) : '—'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Veiculos monitorados"
          value={stats ? numberFormatter.format(stats.totalVehicles) : '—'}
          change={monthLabel(stats?.latestReferenceMonth ?? null)}
        />
        <MetricCard
          label="Preco medio"
          value={stats?.averagePrice != null ? formatCurrency(stats.averagePrice) : '—'}
        />
        <MetricCard
          label="Maior preco"
          value={stats?.highestPrice != null ? formatCurrency(stats.highestPrice) : '—'}
        />
        <MetricCard
          label="Menor preco"
          value={stats?.lowestPrice != null ? formatCurrency(stats.lowestPrice) : '—'}
        />
      </section>

      <section id="explorar-veiculos" className="min-w-0 rounded border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Explorar veiculos</h2>
            <p className="mt-1 text-sm text-slate-500">
              Filtros reais por marca, categoria e faixa de preco.
            </p>
          </div>
          <button
            type="button"
            onClick={clearHomeVehicleFilters}
            disabled={!hasHomeVehicleFilters}
            className="inline-flex items-center justify-center rounded border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Limpar filtros
          </button>
        </div>

        <div className="grid min-w-0 gap-3 py-4 md:grid-cols-3">
          <label className="min-w-0">
            <span className="mb-1 block text-xs font-bold uppercase text-slate-500">Marca</span>
            <select
              value={selectedBrand}
              onChange={(event) => setSelectedBrand(event.target.value)}
              className="h-11 w-full rounded border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-400"
            >
              <option value="">Todas as marcas</option>
              {homeData?.brands.map((brand) => (
                <option key={brand.slug} value={brand.slug}>
                  {brand.name}
                </option>
              ))}
            </select>
          </label>

          <label className="min-w-0">
            <span className="mb-1 block text-xs font-bold uppercase text-slate-500">Categoria</span>
            <select
              value={selectedSegment}
              onChange={(event) => setSelectedSegment(event.target.value)}
              className="h-11 w-full rounded border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-400"
            >
              <option value="">Todas as categorias</option>
              {homeData?.categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="min-w-0">
            <span className="mb-1 block text-xs font-bold uppercase text-slate-500">Faixa de preco</span>
            <select
              value={selectedPriceBand}
              onChange={(event) => setSelectedPriceBand(event.target.value)}
              className="h-11 w-full rounded border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-400"
            >
              {priceBands.map((band) => (
                <option key={band.value || 'all'} value={band.value}>
                  {band.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {exploreLoading ? (
          <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-36 animate-pulse rounded border border-slate-200 bg-slate-100" />
            ))}
          </div>
        ) : exploreError ? (
          <p className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-500">
            Nao foi possivel carregar os veiculos filtrados.
          </p>
        ) : (
          <VehicleGrid
            vehicles={exploreVehicles}
            emptyLabel="Nenhum veiculo encontrado para os filtros selecionados."
          />
        )}
      </section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="min-w-0 rounded border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="text-base font-bold text-slate-950">Cobertura da base FIPE</h2>
              <p className="text-sm text-slate-500">Resumo real dos veiculos disponiveis no banco</p>
            </div>
            <Link to="/index" className="text-sm font-bold text-slate-700 hover:text-slate-950">Ver indice</Link>
          </div>
          <div className="grid gap-3 p-4 md:grid-cols-3">
            <div className="rounded border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-500">Marcas</p>
              <p className="mt-2 font-mono text-3xl font-bold text-slate-950">
                {homeData ? numberFormatter.format(homeData.brands.length) : '—'}
              </p>
            </div>
            <div className="rounded border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-500">Categorias</p>
              <p className="mt-2 font-mono text-3xl font-bold text-slate-950">
                {homeData ? numberFormatter.format(homeData.categories.length) : '—'}
              </p>
            </div>
            <div className="rounded border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-500">Destaques</p>
              <p className="mt-2 font-mono text-3xl font-bold text-slate-950">
                {homeData ? numberFormatter.format(homeData.featuredVehicles.length) : '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid min-w-0 gap-5">
          <RankingList
            title="Maior valorizacao"
            badge={{ label: '12 meses', tone: 'positive' }}
            entries={rankings?.topAppreciation ?? []}
            loading={loading}
            error={error}
            emptyLabel="Sem veiculos com valorizacao real em 12 meses."
          />
          <RankingList
            title="Maior desvalorizacao"
            badge={{ label: '12 meses', tone: 'negative' }}
            entries={rankings?.topDepreciation ?? []}
            loading={loading}
            error={error}
            emptyLabel="Sem veiculos com desvalorizacao real em 12 meses."
          />
        </div>
      </section>

      <section className="grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <RankingList
          title="Mais caros"
          badge={{ label: 'preco FIPE' }}
          entries={rankings?.topExpensive ?? []}
          loading={loading}
          error={error}
        />
        <RankingList
          title="Mais baratos"
          badge={{ label: 'preco FIPE' }}
          entries={rankings?.topAffordable ?? []}
          loading={loading}
          error={error}
        />
        <RankingList
          title="SUVs mais caros"
          badge={{ label: 'preco FIPE' }}
          entries={rankings?.suvTopExpensive ?? []}
          loading={loading}
          error={error}
        />
        <RankingList
          title="Sedans mais caros"
          badge={{ label: 'preco FIPE' }}
          entries={rankings?.sedanTopExpensive ?? []}
          loading={loading}
          error={error}
        />
        <RankingList
          title="Hatchs mais baratos"
          badge={{ label: 'preco FIPE' }}
          entries={rankings?.hatchTopAffordable ?? []}
          loading={loading}
          error={error}
        />
        <RankingList
          title="Picapes mais caras"
          badge={{ label: 'preco FIPE' }}
          entries={rankings?.pickupTopExpensive ?? []}
          loading={loading}
          error={error}
        />
      </section>

      <section className="min-w-0 rounded border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold text-slate-950">Rankings FIPE</h2>
        <p className="mt-1 text-sm text-slate-500">
          Paginas com rankings reais por preco atual e variacao historica disponivel.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
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
      </section>

      <section className="grid min-w-0 gap-5 md:grid-cols-2">
        <div className="min-w-0 rounded border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold text-slate-950">Explore por marca</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {homeLoading ? (
              <span className="text-sm text-slate-500">Carregando marcas...</span>
            ) : homeError || !homeData || homeData.brands.length === 0 ? (
              <span className="text-sm text-slate-500">Marcas indisponiveis.</span>
            ) : homeData.brands.map((brand) => (
              <Link
                key={brand.slug}
                to={`/marca/${brand.slug}`}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="min-w-0 rounded border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold text-slate-950">Explore por categoria</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {homeLoading ? (
              <span className="text-sm text-slate-500">Carregando categorias...</span>
            ) : homeError || !homeData || homeData.categories.length === 0 ? (
              <span className="text-sm text-slate-500">Categorias indisponiveis.</span>
            ) : homeData.categories.map((category) => (
              <Link
                key={category.slug}
                to={`/categoria/${category.slug}`}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="min-w-0 rounded border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold text-slate-950">Comparacoes populares</h2>
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

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950">Veiculos em destaque</h2>
        </div>
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
    </div>
  )
}
