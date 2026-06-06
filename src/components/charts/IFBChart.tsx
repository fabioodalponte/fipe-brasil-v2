import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MarketPoint } from '../../data/mock/market'

type IFBChartProps = {
  data: MarketPoint[]
  height?: number
}

export function IFBChart({ data, height = 320 }: IFBChartProps) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="ifbFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis domain={['dataMin - 2', 'dataMax + 2']} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={36} />
          <Tooltip
            contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 4, boxShadow: '0 12px 32px rgba(30, 41, 59, 0.1)' }}
            formatter={(value) => [Number(value).toFixed(2), 'IFB']}
          />
          <Area type="monotone" dataKey="ifb" stroke="#10b981" strokeWidth={2.5} fill="url(#ifbFill)" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
