import { existsSync, readFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import pg from 'pg'

type CsvRow = Record<string, string>

type DatasetConfig = {
  path: string
  table: 'fenabrave_model_rankings' | 'fenabrave_brand_rankings' | 'fenabrave_segment_model_rankings'
  rankingType: string
  mapRow: (row: CsvRow, sourceFile: string) => StagingRow
}

type StagingRow = {
  report_month: string
  source_file: string
  ranking_type: string
  category: string | null
  segment: string | null
  rank: number
  brand_original: string
  model_original: string | null
  brand_normalized: string
  model_normalized: string | null
  registrations_month: number | null
  registrations_accumulated: number | null
  market_share_pct: number | null
}

const REPORT_MONTH = '2026-05-01'
const DATA_DIR = resolve('data/fenabrave')
const SQL_PATH = resolve('server/sql/fenabrave_staging.sql')

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

function parseCsv(content: string): CsvRow[] {
  const rows: string[][] = []
  let field = ''
  let row: string[] = []
  let quoted = false

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index]
    const next = content[index + 1]

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"'
        index += 1
      } else if (char === '"') {
        quoted = false
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      quoted = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (char !== '\r') {
      field += char
    }
  }

  if (field || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  const [headers, ...dataRows] = rows
  if (!headers) return []

  return dataRows
    .filter((values) => values.some((value) => value.trim() !== ''))
    .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])))
}

function normalizeText(value: string | null): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function normalizeBrand(value: string): string {
  const normalized = normalizeText(value)
  if (normalized === 'gm') return 'chevrolet'
  if (normalized === 'vw') return 'vw volkswagen'
  if (normalized === 'm benz') return 'mercedes benz'
  if (normalized === 'caoa chery') return 'caoa chery'
  return normalized
}

function intValue(value: string | undefined): number | null {
  if (value == null || value === '') return null
  return Number(value)
}

function numberValue(value: string | undefined): number | null {
  if (value == null || value === '') return null
  return Number(value)
}

function baseRow(row: CsvRow, sourceFile: string, rankingType: string): Pick<
  StagingRow,
  'report_month' | 'source_file' | 'ranking_type' | 'rank' | 'brand_original' | 'brand_normalized'
> {
  return {
    report_month: REPORT_MONTH,
    source_file: sourceFile,
    ranking_type: rankingType,
    rank: Number(row.rank),
    brand_original: row.brand,
    brand_normalized: normalizeBrand(row.brand),
  }
}

const datasets: DatasetConfig[] = [
  {
    path: resolve(DATA_DIR, 'ranking_emplacamentos_maio_2026.csv'),
    table: 'fenabrave_model_rankings',
    rankingType: 'model_month',
    mapRow: (row, sourceFile) => ({
      ...baseRow(row, sourceFile, 'model_month'),
      category: row.category,
      segment: null,
      model_original: row.model,
      model_normalized: normalizeText(row.model),
      registrations_month: intValue(row.registrations_month),
      registrations_accumulated: null,
      market_share_pct: null,
    }),
  },
  {
    path: resolve(DATA_DIR, 'ranking_emplacamentos_acumulado_2026.csv'),
    table: 'fenabrave_model_rankings',
    rankingType: 'model_accumulated',
    mapRow: (row, sourceFile) => ({
      ...baseRow(row, sourceFile, 'model_accumulated'),
      category: row.category,
      segment: null,
      model_original: row.model,
      model_normalized: normalizeText(row.model),
      registrations_month: null,
      registrations_accumulated: intValue(row.registrations_accumulated),
      market_share_pct: null,
    }),
  },
  {
    path: resolve(DATA_DIR, 'ranking_marca_maio_2026.csv'),
    table: 'fenabrave_brand_rankings',
    rankingType: 'brand_month',
    mapRow: (row, sourceFile) => ({
      ...baseRow(row, sourceFile, 'brand_month'),
      category: row.category,
      segment: null,
      model_original: null,
      model_normalized: null,
      registrations_month: intValue(row.registrations_month),
      registrations_accumulated: null,
      market_share_pct: numberValue(row.market_share_pct),
    }),
  },
  {
    path: resolve(DATA_DIR, 'ranking_marca_acumulado_2026.csv'),
    table: 'fenabrave_brand_rankings',
    rankingType: 'brand_accumulated',
    mapRow: (row, sourceFile) => ({
      ...baseRow(row, sourceFile, 'brand_accumulated'),
      category: row.category,
      segment: null,
      model_original: null,
      model_normalized: null,
      registrations_month: null,
      registrations_accumulated: intValue(row.registrations_accumulated),
      market_share_pct: numberValue(row.market_share_pct),
    }),
  },
  {
    path: resolve(DATA_DIR, 'ranking_segmentos_modelos_2026.csv'),
    table: 'fenabrave_segment_model_rankings',
    rankingType: 'segment_model_accumulated',
    mapRow: (row, sourceFile) => ({
      ...baseRow(row, sourceFile, 'segment_model_accumulated'),
      category: null,
      segment: row.segment,
      model_original: row.model,
      model_normalized: normalizeText(row.model),
      registrations_month: intValue(row.registrations_may_2026),
      registrations_accumulated: intValue(row.registrations_accumulated_2026),
      market_share_pct: numberValue(row.market_share_pct),
    }),
  },
]

async function insertRows(client: pg.PoolClient, table: DatasetConfig['table'], rows: StagingRow[]): Promise<void> {
  const sql = `
    INSERT INTO ${table} (
      report_month, source_file, ranking_type, category, segment, rank,
      brand_original, model_original, brand_normalized, model_normalized,
      registrations_month, registrations_accumulated, market_share_pct
    ) VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9, $10,
      $11, $12, $13
    )`

  for (const row of rows) {
    await client.query(sql, [
      row.report_month,
      row.source_file,
      row.ranking_type,
      row.category,
      row.segment,
      row.rank,
      row.brand_original,
      row.model_original,
      row.brand_normalized,
      row.model_normalized,
      row.registrations_month,
      row.registrations_accumulated,
      row.market_share_pct,
    ])
  }
}

async function loadDataset(client: pg.PoolClient, config: DatasetConfig): Promise<number> {
  const sourceFile = basename(config.path)
  const csvRows = parseCsv(readFileSync(config.path, 'utf8'))
  const stagingRows = csvRows.map((row) => config.mapRow(row, sourceFile))

  await client.query(
    `DELETE FROM ${config.table}
      WHERE report_month = $1
        AND source_file = $2
        AND ranking_type = $3`,
    [REPORT_MONTH, sourceFile, config.rankingType],
  )
  await insertRows(client, config.table, stagingRows)
  return stagingRows.length
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

try {
  const sql = readFileSync(SQL_PATH, 'utf8')
  await pool.query(sql)

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const summary: Array<{ file: string; table: string; rows: number }> = []
    for (const config of datasets) {
      const rows = await loadDataset(client, config)
      summary.push({ file: basename(config.path), table: config.table, rows })
    }
    await client.query('COMMIT')

    const refreshStart = Date.now()
    await client.query('REFRESH MATERIALIZED VIEW fenabrave_fipe_match_candidates')
    const refreshSeconds = ((Date.now() - refreshStart) / 1000).toFixed(2)

    console.log('Fenabrave staging carregado:')
    for (const item of summary) {
      console.log(`- ${item.file} -> ${item.table}: ${item.rows} linhas`)
    }
    console.log(`- fenabrave_fipe_match_candidates atualizado em ${refreshSeconds}s`)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
} finally {
  await pool.end()
}
