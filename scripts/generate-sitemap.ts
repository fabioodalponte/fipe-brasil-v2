import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { SITE_URL } from '../src/config/site'

type SitemapEntry = {
  path: string
  changefreq: string
  priority: string
}

const VALID_CATEGORIES = [
  'suv', 'sedan', 'hatch', 'picape', 'perua',
  'minivan', 'cupe', 'conversivel', 'furgao', 'buggy',
]

const BRAND_SLUG_EXPR = `trim(both '-' from regexp_replace(lower(f_unaccent(brand)), '[^a-z0-9]+', '-', 'g'))`
const VEHICLE_LIMIT = 1000
const RANKING_PATHS = [
  '/mais-valorizados',
  '/mais-desvalorizados',
  '/mais-caros',
  '/mais-baratos',
]

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

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

async function buildEntries(): Promise<SitemapEntry[]> {
  loadLocalEnv()
  const connectionString = process.env.FIPE_DATABASE_URL
  if (!connectionString) {
    throw new Error('FIPE_DATABASE_URL não definido para gerar sitemap real.')
  }

  const pool = new pg.Pool({
    connectionString,
    max: 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 8_000,
  })

  try {
    const [brands, categories, vehicles] = await Promise.all([
      pool.query<{ slug: string }>(
        `WITH base AS (
           SELECT ${BRAND_SLUG_EXPR} AS slug
             FROM vehicle_latest_prices
         )
         SELECT slug
           FROM base
          WHERE slug <> ''
          GROUP BY slug
          ORDER BY count(*) DESC, slug`,
      ),
      pool.query<{ slug: string }>(
        `SELECT segment AS slug
           FROM vehicle_latest_prices
          WHERE segment = ANY($1)
          GROUP BY segment
          ORDER BY count(*) DESC, segment`,
        [VALID_CATEGORIES],
      ),
      pool.query<{ slug: string }>(
        `SELECT slug
           FROM vehicle_latest_prices
          WHERE latest_price IS NOT NULL
          ORDER BY latest_price DESC, latest_reference_month DESC NULLS LAST, brand, model
          LIMIT $1`,
        [VEHICLE_LIMIT],
      ),
    ])

    return [
      { path: '/', changefreq: 'daily', priority: '1.0' },
      ...RANKING_PATHS.map((path) => ({
        path,
        changefreq: 'daily',
        priority: '0.8',
      })),
      ...brands.rows.map((row) => ({
        path: `/marca/${row.slug}`,
        changefreq: 'weekly',
        priority: '0.7',
      })),
      ...categories.rows.map((row) => ({
        path: `/categoria/${row.slug}`,
        changefreq: 'weekly',
        priority: '0.7',
      })),
      ...vehicles.rows.map((row) => ({
        path: `/vehicle/${row.slug}`,
        changefreq: 'weekly',
        priority: '0.8',
      })),
    ]
  } finally {
    await pool.end()
  }
}

const lastmod = new Date().toISOString().slice(0, 10)
const entries = await buildEntries()

const urlsXml = entries
  .map(
    (entry) =>
      `  <url>\n` +
      `    <loc>${escapeXml(`${SITE_URL}${entry.path}`)}</loc>\n` +
      `    <lastmod>${lastmod}</lastmod>\n` +
      `    <changefreq>${entry.changefreq}</changefreq>\n` +
      `    <priority>${entry.priority}</priority>\n` +
      `  </url>`,
  )
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlsXml}\n</urlset>\n`

const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '../public')
mkdirSync(outDir, { recursive: true })
writeFileSync(resolve(outDir, 'sitemap.xml'), xml)

console.log(`sitemap.xml gerado com ${entries.length} URLs reais (${SITE_URL})`)
