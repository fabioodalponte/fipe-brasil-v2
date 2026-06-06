import type { Vehicle } from '../../data/mock/market'
import { VehicleCard } from '../cards/VehicleCard'

type VehicleGridProps = {
  vehicles: Vehicle[]
  emptyLabel?: string
}

export function VehicleGrid({ vehicles, emptyLabel = 'Nenhum veiculo encontrado.' }: VehicleGridProps) {
  if (vehicles.length === 0) {
    return (
      <p className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-500">{emptyLabel}</p>
    )
  }

  return (
    <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  )
}
