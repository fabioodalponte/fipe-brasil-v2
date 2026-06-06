import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SITE_URL } from '../src/config/site'
import { vehicles } from '../src/data/mock/market'
import { slugify } from '../src/utils/slug'

type SitemapEntry = {
  path: string
  changefreq: string
  priority: string
}

const lastmod = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

const uniqueSlugs = (values: string[]) => [...new Set(values)]

const entries: SitemapEntry[] = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  ...vehicles.map((vehicle) => ({
    path: `/vehicle/${vehicle.id}`,
    changefreq: 'weekly',
    priority: '0.8',
  })),
  ...uniqueSlugs(vehicles.map((vehicle) => slugify(vehicle.brand))).map((slug) => ({
    path: `/marca/${slug}`,
    changefreq: 'weekly',
    priority: '0.7',
  })),
  ...uniqueSlugs(vehicles.map((vehicle) => slugify(vehicle.segment))).map((slug) => ({
    path: `/categoria/${slug}`,
    changefreq: 'weekly',
    priority: '0.7',
  })),
]

const urlsXml = entries
  .map(
    (entry) =>
      `  <url>\n` +
      `    <loc>${SITE_URL}${entry.path}</loc>\n` +
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

console.log(`sitemap.xml gerado com ${entries.length} URLs (${SITE_URL})`)
