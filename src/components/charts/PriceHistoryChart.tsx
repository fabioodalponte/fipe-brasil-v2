import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency } from '../../utils/formatters'

export type PriceHistoryDatum = {
  /** Rótulo curto do mês (ex.: "abr/24"). */
  month: string
  price: number
}

type PriceHistoryChartProps = {
  data: PriceHistoryDatum[]
  height?: number
}

/** Série única do preço FIPE ao longo dos meses de referência (dados reais). */
export function PriceHistoryChart({ data, height = 320 }: PriceHistoryChartProps) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
          <CartesianGrid stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            minTickGap={24}
          />
          <YAxis
            domain={['dataMin', 'dataMax']}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            width={72}
            tickFormatter={(value) => formatCurrency(Number(value))}
          />
          <Tooltip
            contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 4 }}
            formatter={(value) => [formatCurrency(Number(value)), 'Preço FIPE']}
          />
          <Line
            type="monotone"
            dataKey="price"
            name="Preço FIPE"
            dot={false}
            stroke="#10b981"
            strokeWidth={2.4}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
