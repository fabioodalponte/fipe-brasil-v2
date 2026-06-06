import { ArrowRight, Search, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { IFBChart } from '../../components/charts/IFBChart'
import { MetricCard } from '../../components/cards/MetricCard'
import { RankingCard } from '../../components/cards/RankingCard'
import { VehicleCard } from '../../components/cards/VehicleCard'
import { appreciationRanking, depreciationRanking, marketHistory, marketStats, vehicles } from '../../data/mock/market'

export function HomePage() {
  return (
    <div className="min-w-0 space-y-5">
      <section className="grid min-w-0 gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="min-w-0 rounded border border-slate-200 bg-white p-5">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase text-emerald-700">Mercado aberto</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-600">Mock data | UX lab</span>
          </div>
          <h1 className="max-w-3xl break-words text-2xl font-bold leading-tight text-slate-950 sm:text-3xl md:text-5xl">
            Inteligencia de mercado para precos FIPE, liquidez e tendencias.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Explore veiculos, compare historico e acompanhe o IFB em uma interface de leitura rapida inspirada em terminais financeiros.
          </p>
          <div className="mt-6 flex min-w-0 flex-col gap-3 rounded border border-slate-200 bg-slate-50 p-2 md:flex-row">
            <label className="flex min-h-12 min-w-0 flex-1 items-center rounded bg-white px-3 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-slate-900">
              <Search size={18} className="mr-2 text-slate-400" />
              <input className="min-w-0 w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400" placeholder="Digite Corolla, Civic, Compass ou codigo FIPE" />
            </label>
            <button className="inline-flex items-center justify-center gap-2 rounded bg-slate-900 px-4 py-3 text-sm font-bold text-white">
              Buscar
              <ArrowRight size={16} />
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">
              <SlidersHorizontal size={16} />
              Filtros
            </button>
          </div>
        </div>

        <div className="min-w-0 rounded border border-slate-200 bg-slate-950 p-5 text-white">
          <p className="text-[11px] font-bold uppercase text-slate-400">IFB fechamento</p>
          <strong className="mt-3 block font-mono text-5xl">109,10</strong>
          <p className="mt-2 font-mono text-sm font-bold text-emerald-300">+9,3% em 12 meses</p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-400">Melhor segmento</p>
              <p className="mt-1 font-bold">SUV</p>
            </div>
            <div className="rounded border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-400">Maior liquidez</p>
              <p className="mt-1 font-bold">Sedan</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {marketStats.map((stat) => (
          <MetricCard key={stat.label} label={stat.label} value={stat.value} change={stat.change} tone={stat.tone as 'positive' | 'negative'} />
        ))}
      </section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="min-w-0 rounded border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="text-base font-bold text-slate-950">Grafico do IFB</h2>
              <p className="text-sm text-slate-500">Indice mockado agregado do mercado nacional</p>
            </div>
            <Link to="/index" className="text-sm font-bold text-slate-700 hover:text-slate-950">Ver indice</Link>
          </div>
          <div className="p-4">
            <IFBChart data={marketHistory} />
          </div>
        </div>

        <div className="grid min-w-0 gap-5">
          <RankingCard title="Ranking de valorizacao" items={appreciationRanking} type="up" />
          <RankingCard title="Ranking de desvalorizacao" items={depreciationRanking} type="down" />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950">Veiculos em destaque</h2>
          <Link to="/vehicle/toyota-corolla-xei-2020" className="text-sm font-bold text-slate-700">Abrir analise</Link>
        </div>
        <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </section>
    </div>
  )
}
