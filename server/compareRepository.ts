import { getPool } from './db.ts'

export type ComparePriceHistoryPoint = {
  reference_month: string
  price: string
}

export type CompareVehicleRow = {
  vehicle_id: number
  slug: string
  fipe_code: string
  brand: string
  model: string
  model_year: number | null
  fuel: string
  vehicle_type: string | null
  segment: string | null
  latest_price: string | null
  latest_reference_month: string | null
  change_1m_pct: string | null
  change_6m_pct: string | null
  change_12m_pct: string | null
  price_history: ComparePriceHistoryPoint[]
}

export type CompareSummaryRow = {
  price_difference: number | null
  price_difference_pct: number | null
  better_12m_performer: string | null
  lower_price: string | null
  same_segment: boolean
  same_brand: boolean
}

export type CompareResponseRow = {
  base: CompareVehicleRow
  target: CompareVehicleRow
  comparison: CompareSummaryRow
}

const VEHICLE_SQL = `
  SELECT v.vehicle_id::int AS vehicle_id,
         v.slug,
         v.fipe_code,
         v.brand,
         v.model,
         v.model_year,
         v.fuel,
         v.vehicle_type,
         v.segment,
         v.latest_price,
         v.latest_reference_month::text AS latest_reference_month,
         c.change_1m_pct,
         c.change_6m_pct,
         c.change_12m_pct
    FROM vehicle_latest_prices v
    LEFT JOIN vehicle_price_changes c ON c.vehicle_id = v.vehicle_id
   WHERE v.slug = $1
   LIMIT 1`

async function getCompareVehicle(slug: string): Promise<CompareVehicleRow | null> {
  const pool = getPool()
  const vehicle = await pool.query<Omit<CompareVehicleRow, 'price_history'>>(VEHICLE_SQL, [slug])
  if (vehicle.rows.length === 0) return null

  const history = await pool.query<ComparePriceHistoryPoint>(
    `SELECT reference_month::text AS reference_month, price
       FROM vehicle_price_snapshots
      WHERE vehicle_id = $1
      ORDER BY reference_month ASC`,
    [vehicle.rows[0].vehicle_id],
  )

  return { ...vehicle.rows[0], price_history: history.rows }
}

const toNumber = (value: string | null): number | null => {
  if (value == null) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function compareRows(base: CompareVehicleRow, target: CompareVehicleRow): CompareSummaryRow {
  const basePrice = toNumber(base.latest_price)
  const targetPrice = toNumber(target.latest_price)
  const baseChange12m = toNumber(base.change_12m_pct)
  const targetChange12m = toNumber(target.change_12m_pct)

  const priceDifference =
    basePrice != null && targetPrice != null ? basePrice - targetPrice : null
  const priceDifferencePct =
    priceDifference != null && targetPrice != null && targetPrice !== 0
      ? (priceDifference / targetPrice) * 100
      : null

  let lowerPrice: string | null = null
  if (basePrice != null && targetPrice != null && basePrice !== targetPrice) {
    lowerPrice = basePrice < targetPrice ? base.slug : target.slug
  }

  let better12mPerformer: string | null = null
  if (baseChange12m != null && targetChange12m != null && baseChange12m !== targetChange12m) {
    better12mPerformer = baseChange12m > targetChange12m ? base.slug : target.slug
  }

  return {
    price_difference: priceDifference,
    price_difference_pct: priceDifferencePct,
    better_12m_performer: better12mPerformer,
    lower_price: lowerPrice,
    same_segment: base.segment != null && target.segment != null && base.segment === target.segment,
    same_brand: base.brand === target.brand,
  }
}

/** Compara dois veículos reais por slug. Retorna null se qualquer slug não existir. */
export async function compareVehiclesBySlug(
  baseSlug: string,
  targetSlug: string,
): Promise<CompareResponseRow | null> {
  const base = await getCompareVehicle(baseSlug.trim())
  const target = await getCompareVehicle(targetSlug.trim())
  if (!base || !target) return null

  return {
    base,
    target,
    comparison: compareRows(base, target),
  }
}
