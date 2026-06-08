import pg from 'pg'

/**
 * Pool PostgreSQL para o banco fipe-v2 (lado servidor — nunca exposto ao
 * cliente). DSN vem de FIPE_DATABASE_URL (carregado de .env.local via
 * loadEnv no vite.config.ts).
 */
let pool: pg.Pool | null = null

export function getPool(): pg.Pool {
  if (pool) return pool
  const connectionString = process.env.FIPE_DATABASE_URL
  if (!connectionString) {
    throw new Error('FIPE_DATABASE_URL não definido (DSN do banco fipe-v2).')
  }
  pool = new pg.Pool({
    connectionString,
    max: 4,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 8_000,
  })
  return pool
}
