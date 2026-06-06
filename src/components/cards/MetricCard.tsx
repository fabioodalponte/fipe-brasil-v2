import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

type MetricCardProps = {
  label: string
  value: string
  change?: string
  tone?: 'positive' | 'negative' | 'neutral'
}

export function MetricCard({ label, value, change, tone = 'neutral' }: MetricCardProps) {
  const isPositive = tone === 'positive'
  const isNegative = tone === 'negative'
  const Icon = isNegative ? ArrowDownRight : ArrowUpRight

  return (
    <article className="min-w-0 rounded border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase text-slate-500">{label}</p>
        {change ? (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${
              isPositive
                ? 'bg-emerald-50 text-emerald-700'
                : isNegative
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Icon size={13} />
            {change}
          </span>
        ) : null}
      </div>
      <strong className="mt-3 block font-mono text-2xl text-slate-950">{value}</strong>
    </article>
  )
}
