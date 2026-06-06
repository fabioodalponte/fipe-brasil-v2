import { BarChart3, Car, GitCompareArrows, ShieldCheck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { HistoryChart } from '../../components/charts/HistoryChart'
import { MetricCard } from '../../components/cards/MetricCard'
import { VehicleCard } from '../../components/cards/VehicleCard'
import { marketHistory, vehicleInsights, vehicles } from '../../data/mock/market'
import { useRelatedVehicles } from '../../hooks/useRelatedVehicles'
import { formatCurrency, formatPercent } from '../../utils/formatters'

export function VehiclePage() {
  const { slug } = useParams()
  const vehicle = vehicles.find((item) => item.id === slug) ?? vehicles[0]
  const { vehicles: related, loading: relatedLoading, error: relatedError } = useRelatedVehicles(vehicle, 4)

  return (
    <div className="space-y-5">
      <section className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="rounded border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-600">{vehicle.segment}</span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase text-emerald-700">Alta liquidez</span>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-[1fr_220px]">
            <div>
              <h1 className="break-words text-3xl font-bold text-slate-950 md:text-4xl">{vehicle.name}</h1>
              <p className="mt-2 text-sm text-slate-600">{vehicle.version} | {vehicle.year} | Codigo FIPE {vehicle.fipeCode}</p>
              <div className="mt-5 flex flex-wrap gap-5">
                <div>
                  <p className="text-[11px] font-bold uppercase text-slate-500">Preco atual</p>
                  <p className="mt-1 font-mono text-4xl font-bold text-slate-950">{formatCurrency(vehicle.price)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase text-slate-500">Variacao mensal</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-emerald-700">{formatPercent(vehicle.monthlyChange)}</p>
                </div>
              </div>
            </div>
            {vehicle.image ? (
              <img className="h-40 w-full rounded border border-slate-200 object-cover md:h-full" src={vehicle.image} alt={vehicle.name} />
            ) : null}
          </div>
        </div>

        <div className="rounded border border-slate-200 bg-slate-950 p-5 text-white">
          <div className="flex items-center gap-3">
            <span className="rounded bg-white/10 p-2 text-emerald-300">
              <ShieldCheck size={18} />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase text-slate-400">Leitura automatica</p>
              <h2 className="text-lg font-bold">Preco estavel com momentum positivo</h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            O veiculo combina baixa volatilidade e liquidez alta, mantendo spread competitivo contra sedans equivalentes.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-400">Rank mercado</p>
              <p className="mt-1 font-mono text-xl font-bold">#{vehicle.marketRank}</p>
            </div>
            <div className="rounded border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-400">Volatilidade</p>
              <p className="mt-1 font-mono text-xl font-bold">{vehicle.volatility}%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Preco FIPE" value={formatCurrency(vehicle.price)} change={formatPercent(vehicle.monthlyChange)} tone="positive" />
        <MetricCard label="12 meses" value={formatPercent(vehicle.yearlyChange)} change="+2,6 p.p." tone="positive" />
        <MetricCard label="Liquidez" value={`${vehicle.liquidity}/100`} change="+5 pts" tone="positive" />
        <MetricCard label="Volatilidade" value={`${vehicle.volatility}%`} change="-0,7 p.p." tone="positive" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded border border-slate-200 bg-white">
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
            <BarChart3 size={18} className="text-slate-600" />
            <h2 className="text-base font-bold text-slate-950">Historico do veiculo</h2>
          </div>
          <div className="p-4">
            <HistoryChart
              data={marketHistory}
              series={[
                { key: 'corolla', label: 'Corolla XEi', color: '#10b981' },
                { key: 'sedan', label: 'Sedans', color: '#334155' },
              ]}
            />
          </div>
        </div>

        <div className="rounded border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-base font-bold text-slate-950">Insights automaticos</h2>
            <p className="text-sm text-slate-500">Texto mockado para validar UX</p>
          </div>
          <div className="divide-y divide-slate-100">
            {vehicleInsights.map((insight) => (
              <div key={insight} className="flex gap-3 px-4 py-3 text-sm leading-6 text-slate-700">
                <Car size={16} className="mt-1 shrink-0 text-slate-400" />
                {insight}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-950">Veiculos relacionados</h2>
          <span className="text-sm text-slate-500">Mesma marca, segmento, faixa de preco e ano</span>
        </div>
        {relatedLoading ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-32 animate-pulse rounded border border-slate-200 bg-slate-100" />
            ))}
          </div>
        ) : relatedError ? (
          <p className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-500">
            Nao foi possivel carregar os veiculos relacionados.
          </p>
        ) : related.length === 0 ? (
          <p className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-500">
            Nenhum veiculo relacionado encontrado.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {related.map((item) => (
              <VehicleCard key={item.id} vehicle={item} />
            ))}
          </div>
        )}
      </section>

      {related.length > 0 ? (
        <section className="rounded border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold text-slate-950">Compare com</h2>
          <p className="mt-1 text-sm text-slate-500">Atalhos de comparacao lado a lado</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {related.slice(0, 3).map((target) => (
              <Link
                key={target.id}
                to={`/compare?base=${vehicle.id}&target=${target.id}`}
                className="flex items-center justify-between gap-3 rounded border border-slate-200 p-3 transition hover:border-slate-300 hover:shadow-sm"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-slate-950">
                    {vehicle.model} vs {target.model}
                  </span>
                  <span className="block truncate text-xs text-slate-500">{target.name}</span>
                </span>
                <GitCompareArrows size={16} className="shrink-0 text-slate-400" />
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
