import { GitCompareArrows } from 'lucide-react'
import { HistoryChart } from '../../components/charts/HistoryChart'
import { MetricCard } from '../../components/cards/MetricCard'
import { marketHistory, vehicles } from '../../data/mock/market'
import { formatCurrency, formatPercent } from '../../utils/formatters'

const [leftVehicle, rightVehicle] = vehicles

const rows = [
  ['Preco FIPE', formatCurrency(leftVehicle.price), formatCurrency(rightVehicle.price)],
  ['Variacao mensal', formatPercent(leftVehicle.monthlyChange), formatPercent(rightVehicle.monthlyChange)],
  ['Variacao 12 meses', formatPercent(leftVehicle.yearlyChange), formatPercent(rightVehicle.yearlyChange)],
  ['Liquidez', `${leftVehicle.liquidity}/100`, `${rightVehicle.liquidity}/100`],
  ['Volatilidade', `${leftVehicle.volatility}%`, `${rightVehicle.volatility}%`],
  ['Rank mercado', `#${leftVehicle.marketRank}`, `#${rightVehicle.marketRank}`],
]

export function ComparePage() {
  return (
    <div className="space-y-5">
      <section className="rounded border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500">Comparacao lado a lado</p>
            <h1 className="mt-2 break-words text-3xl font-bold text-slate-950 md:text-4xl">Corolla XEi vs Civic EXL</h1>
            <p className="mt-2 text-sm text-slate-600">Dois sedans medios com historico, liquidez e volatilidade mockados para validar a navegacao.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded bg-slate-900 px-3 py-2 text-sm font-bold text-white">
            <GitCompareArrows size={16} />
            2 veiculos
          </span>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {[leftVehicle, rightVehicle].map((vehicle) => (
          <div key={vehicle.id} className="rounded border border-slate-200 bg-white p-5">
            <p className="text-[11px] font-bold uppercase text-slate-500">{vehicle.brand} | {vehicle.segment}</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">{vehicle.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{vehicle.version} | {vehicle.year}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <MetricCard label="Preco" value={formatCurrency(vehicle.price)} />
              <MetricCard label="Mes" value={formatPercent(vehicle.monthlyChange)} tone={vehicle.monthlyChange >= 0 ? 'positive' : 'negative'} />
              <MetricCard label="Liquidez" value={`${vehicle.liquidity}/100`} />
            </div>
          </div>
        ))}
      </section>

      <section className="rounded border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-base font-bold text-slate-950">Grafico comparativo</h2>
          <p className="text-sm text-slate-500">Base 100 simulada para leitura relativa</p>
        </div>
        <div className="p-4">
          <HistoryChart
            data={marketHistory}
            height={340}
            series={[
              { key: 'corolla', label: 'Toyota Corolla XEi', color: '#10b981' },
              { key: 'civic', label: 'Honda Civic EXL', color: '#0f172a' },
            ]}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-base font-bold text-slate-950">Tabela de metricas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-sm">
            <thead className="sticky top-0 bg-slate-50 text-left text-[11px] uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-bold">Metrica</th>
                <th className="px-4 py-3 font-bold">{leftVehicle.name}</th>
                <th className="px-4 py-3 font-bold">{rightVehicle.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(([label, left, right]) => (
                <tr key={label}>
                  <td className="px-4 py-3 font-semibold text-slate-700">{label}</td>
                  <td className="px-4 py-3 font-mono text-slate-950">{left}</td>
                  <td className="px-4 py-3 font-mono text-slate-950">{right}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
