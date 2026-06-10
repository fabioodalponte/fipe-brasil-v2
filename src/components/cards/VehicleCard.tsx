import { Car, Gauge } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Vehicle } from '../../data/mock/market'
import { formatCurrency, formatPercent } from '../../utils/formatters'

type VehicleCardProps = {
  vehicle: Vehicle
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <Link
      to={`/carro/${vehicle.id}`}
      className="block min-w-0 rounded border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-700">
          <Car size={18} />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-slate-950">{vehicle.name}</h3>
          <p className="text-xs text-slate-500">{vehicle.version} | {vehicle.year}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase text-slate-500">Preco FIPE</p>
          <p className="mt-1 font-mono text-lg font-bold">{formatCurrency(vehicle.price)}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase text-slate-500">Mes</p>
          <p className={`mt-1 font-mono text-lg font-bold ${vehicle.monthlyChange >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {formatPercent(vehicle.monthlyChange)}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-600">
        <Gauge size={14} />
        Liquidez {vehicle.liquidity}/100 | Rank #{vehicle.marketRank}
      </div>
    </Link>
  )
}
