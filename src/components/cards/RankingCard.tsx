import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { formatCurrency, formatPercent } from '../../utils/formatters'

type RankingItem = {
  name: string
  segment: string
  price: number
  change: number
}

type RankingCardProps = {
  title: string
  items: RankingItem[]
  type: 'up' | 'down'
}

export function RankingCard({ title, items, type }: RankingCardProps) {
  const Icon = type === 'up' ? ArrowUpRight : ArrowDownRight
  const tone = type === 'up' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'

  return (
    <section className="min-w-0 rounded border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h2 className="text-base font-bold text-slate-950">{title}</h2>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${tone}`}>
          <Icon size={13} />
          30 dias
        </span>
      </div>
      <div className="divide-y divide-slate-100">
        {items.map((item, index) => (
          <div key={item.name} className="grid grid-cols-[32px_1fr_auto] items-center gap-3 px-4 py-3">
            <span className="font-mono text-sm font-bold text-slate-400">{String(index + 1).padStart(2, '0')}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
              <p className="text-xs text-slate-500">{item.segment} | {formatCurrency(item.price)}</p>
            </div>
            <span className={`font-mono text-sm font-bold ${type === 'up' ? 'text-emerald-700' : 'text-rose-700'}`}>
              {formatPercent(item.change)}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
