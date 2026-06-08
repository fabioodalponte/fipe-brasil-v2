import { existsSync, readFileSync } from 'node:fs'
import pg from 'pg'

function loadLocalEnv(): void {
  if (!existsSync('.env.local')) return

  const lines = readFileSync('.env.local', 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(trimmed)
    if (!match) continue
    const [, key, rawValue] = match
    if (process.env[key]) continue
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '')
  }
}

loadLocalEnv()

if (!process.env.FIPE_DATABASE_URL) {
  throw new Error('FIPE_DATABASE_URL não definido.')
}

const pool = new pg.Pool({
  connectionString: process.env.FIPE_DATABASE_URL,
  max: 1,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 8_000,
})

const start = Date.now()
try {
  await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY vehicle_price_changes')
  const seconds = ((Date.now() - start) / 1000).toFixed(2)
  console.log(`vehicle_price_changes atualizado em ${seconds}s`)
} finally {
  await pool.end()
}
