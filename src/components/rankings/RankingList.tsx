import type { RankingEntry, RankingTone } from '../../services/marketRankings'
import { RankingItem } from './RankingItem'

type RankingBadge = {
  label: string
  tone?: RankingTone
}

type RankingListProps = {
  title: string
  entries: RankingEntry[]
  badge?: RankingBadge
  loading?: boolean
  error?: boolean
  emptyLabel?: string
}

const BADGE_CLASS: Record<RankingTone, string> = {
  positive: 'bg-emerald-50 text-emerald-700',
  negative: 'bg-rose-50 text-rose-700',
  neutral: 'bg-slate-100 text-slate-600',
}

export function RankingList({
  title,
  entries,
  badge,
  loading = false,
  error = false,
  emptyLabel = 'Sem dados suficientes',
}: RankingListProps) {
  return (
    <section className="min-w-0 rounded border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h2 className="text-base font-bold text-slate-950">{title}</h2>
        {badge ? (
          <span
            className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${BADGE_CLASS[badge.tone ?? 'neutral']}`}
          >
            {badge.label}
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 px-4 py-3">
              <span className="h-8 w-full animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="px-4 py-6 text-sm text-slate-500">Nao foi possivel carregar este ranking.</p>
      ) : entries.length === 0 ? (
        <p className="px-4 py-6 text-sm text-slate-500">{emptyLabel}</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {entries.map((entry, index) => (
            <RankingItem key={entry.vehicle.id} entry={entry} position={index + 1} />
          ))}
        </div>
      )}
    </section>
  )
}
