import { MetricCard } from '../cards/MetricCard'

export type Stat = {
  label: string
  value: string
  change?: string
  tone?: 'positive' | 'negative' | 'neutral'
}

type StatGridProps = {
  stats: Stat[]
}

export function StatGrid({ stats }: StatGridProps) {
  return (
    <section className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <MetricCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          change={stat.change}
          tone={stat.tone}
        />
      ))}
    </section>
  )
}
