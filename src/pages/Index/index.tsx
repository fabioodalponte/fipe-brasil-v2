import { Activity, Layers, TrendingUp } from 'lucide-react'
import { IFBChart } from '../../components/charts/IFBChart'
import { HistoryChart } from '../../components/charts/HistoryChart'
import { MetricCard } from '../../components/cards/MetricCard'
import { marketHistory, segmentTable } from '../../data/mock/market'
import { formatPercent } from '../../utils/formatters'

export function IFBIndexPage() {
  return (
    <div className="space-y-5">
      <section className="rounded border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500">Indice FIPE Brasil</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">IFB Index</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Indicador mockado que agrega a evolucao de precos por segmento para testar leitura financeira, filtros e navegacao.
            </p>
          </div>
          <div className="rounded bg-slate-950 px-4 py-3 text-white">
            <p className="text-xs font-bold uppercase text-slate-400">Ultimo fechamento</p>
            <p className="mt-1 font-mono text-3xl font-bold">109,10</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <MetricCard label="Performance 12m" value="+9,3%" change="+1,2 p.p." tone="positive" />
        <MetricCard label="Amplitude mensal" value="3,1 pts" change="-0,4 p.p." tone="positive" />
        <MetricCard label="Segmentos" value="4" change="SUV lidera" tone="neutral" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded border border-slate-200 bg-white">
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
            <Activity size={18} className="text-slate-600" />
            <h2 className="text-base font-bold text-slate-950">Evolucao historica</h2>
          </div>
          <div className="p-4">
            <IFBChart data={marketHistory} height={360} />
          </div>
        </div>

        <div className="rounded border border-slate-200 bg-white">
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
            <Layers size={18} className="text-slate-600" />
            <h2 className="text-base font-bold text-slate-950">Segmentos</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {segmentTable.map((segment) => (
              <div key={segment.segment} className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3">
                <div>
                  <p className="font-bold text-slate-950">{segment.segment}</p>
                  <p className="text-xs text-slate-500">Liquidez {segment.liquidity}/100</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-slate-950">{segment.index.toFixed(1)}</p>
                  <p className="font-mono text-xs font-bold text-emerald-700">{formatPercent(segment.month)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <TrendingUp size={18} className="text-slate-600" />
          <h2 className="text-base font-bold text-slate-950">SUV, Sedan, Hatch e Pickup</h2>
        </div>
        <div className="p-4">
          <HistoryChart
            data={marketHistory}
            height={330}
            series={[
              { key: 'suv', label: 'SUV', color: '#10b981' },
              { key: 'sedan', label: 'Sedan', color: '#0f172a' },
              { key: 'hatch', label: 'Hatch', color: '#f43f5e' },
              { key: 'pickup', label: 'Pickup', color: '#2563eb' },
            ]}
          />
        </div>
      </section>
    </div>
  )
}
