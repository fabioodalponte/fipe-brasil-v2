import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MarketPoint } from '../../data/mock/market'

type HistoryChartProps = {
  data: MarketPoint[]
  series: Array<{ key: keyof MarketPoint; label: string; color: string }>
  height?: number
}

export function HistoryChart({ data, series, height = 320 }: HistoryChartProps) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
          <CartesianGrid stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis domain={['dataMin - 2', 'dataMax + 2']} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={36} />
          <Tooltip contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 4 }} formatter={(value) => Number(value).toFixed(2)} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          {series.map((item) => (
            <Line key={String(item.key)} type="monotone" dataKey={item.key} name={item.label} dot={false} stroke={item.color} strokeWidth={2.4} isAnimationActive={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
