DROP MATERIALIZED VIEW IF EXISTS vehicle_price_changes;

CREATE MATERIALIZED VIEW vehicle_price_changes AS
WITH current_snapshot AS (
  SELECT DISTINCT ON (vehicle_id)
         vehicle_id,
         reference_month AS current_reference_month,
         price AS current_price
    FROM vehicle_price_snapshots
   WHERE price IS NOT NULL
   ORDER BY vehicle_id, reference_month DESC
)
SELECT c.vehicle_id,
       c.current_price,
       p1.price AS price_1m_ago,
       p6.price AS price_6m_ago,
       p12.price AS price_12m_ago,
       CASE
         WHEN p1.price > 0 THEN round(((c.current_price - p1.price) / p1.price) * 100, 6)
         ELSE NULL
       END AS change_1m_pct,
       CASE
         WHEN p6.price > 0 THEN round(((c.current_price - p6.price) / p6.price) * 100, 6)
         ELSE NULL
       END AS change_6m_pct,
       CASE
         WHEN p12.price > 0 THEN round(((c.current_price - p12.price) / p12.price) * 100, 6)
         ELSE NULL
       END AS change_12m_pct
  FROM current_snapshot c
  LEFT JOIN vehicle_price_snapshots p1
    ON p1.vehicle_id = c.vehicle_id
   AND p1.reference_month = (c.current_reference_month - interval '1 month')::date
  LEFT JOIN vehicle_price_snapshots p6
    ON p6.vehicle_id = c.vehicle_id
   AND p6.reference_month = (c.current_reference_month - interval '6 months')::date
  LEFT JOIN vehicle_price_snapshots p12
    ON p12.vehicle_id = c.vehicle_id
   AND p12.reference_month = (c.current_reference_month - interval '12 months')::date
WITH DATA;

CREATE UNIQUE INDEX uq_vpc_vehicle_id
  ON vehicle_price_changes (vehicle_id);

CREATE INDEX idx_vpc_change_1m_pct
  ON vehicle_price_changes (change_1m_pct);

CREATE INDEX idx_vpc_change_6m_pct
  ON vehicle_price_changes (change_6m_pct);

CREATE INDEX idx_vpc_change_12m_pct
  ON vehicle_price_changes (change_12m_pct);
