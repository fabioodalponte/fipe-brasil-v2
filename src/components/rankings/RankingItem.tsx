import { Link } from 'react-router-dom'
import type { RankingEntry } from '../../services/marketRankings'
import { formatCurrency } from '../../utils/formatters'

type RankingItemProps = {
  entry: RankingEntry
  position: number
}

const TONE_CLASS: Record<RankingEntry['tone'], string> = {
  positive: 'text-emerald-700',
  negative: 'text-rose-700',
  neutral: 'text-slate-700',
}

export function RankingItem({ entry, position }: RankingItemProps) {
  const { vehicle, formatted, tone } = entry

  return (
    <Link
      to={`/carro/${vehicle.id}`}
      className="grid grid-cols-[28px_1fr_auto] items-center gap-3 px-4 py-3 transition hover:bg-slate-50"
    >
      <span className="font-mono text-sm font-bold text-slate-400">
        {String(position).padStart(2, '0')}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-slate-900">{vehicle.name}</span>
        <span className="block truncate text-xs text-slate-500">
          {vehicle.segment} | {formatCurrency(vehicle.price)}
        </span>
      </span>
      <span className={`shrink-0 font-mono text-sm font-bold ${TONE_CLASS[tone]}`}>{formatted}</span>
    </Link>
  )
}
