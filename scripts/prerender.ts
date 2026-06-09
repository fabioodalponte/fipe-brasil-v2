import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { preview } from 'vite'
import puppeteer, { type Browser } from 'puppeteer'

/**
 * Prerender estatico via snapshot do app rodando.
 *
 * Sobe o preview server do Vite em processo (estatico `dist/` + API de veiculos +
 * banco), abre cada URL do sitemap num Chromium headless, espera os dados
 * assentarem (skeletons `.animate-pulse` desaparecerem) e grava o HTML final em
 * `dist/<path>/index.html`. O middleware `attachPrerender` (server/apiPlugin.ts)
 * serve esses snapshots no preview/producao para crawlers que nao executam JS.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST_DIR = resolve(ROOT, 'dist')
const SITEMAP_PATH = resolve(DIST_DIR, 'sitemap.xml')
const PORT = Number(process.env.PRERENDER_PORT ?? 4180)
const CONCURRENCY = Number(process.env.PRERENDER_CONCURRENCY ?? 4)
const NAV_TIMEOUT_MS = 30_000
const SETTLE_TIMEOUT_MS = 15_000

// Mais conexoes no pool durante o crawl: cada pagina dispara varias chamadas e a
// concorrencia esgotaria o pool padrao (max 4), gerando estados de erro.
if (!process.env.FIPE_DB_POOL_MAX) process.env.FIPE_DB_POOL_MAX = '12'

/**
 * Predicado (avaliado no browser, como string) que define "pagina pronta para
 * snapshot": sem skeleton de loading, sem card de erro e com <link rel=canonical>
 * (so o estado de sucesso renderiza <SEO>). Usado tanto na espera ativa quanto na
 * validacao final — estados transitorios viram falha e sao retentados.
 */
const READY_PREDICATE = `(function () {
  if (document.querySelector('.animate-pulse')) return false
  var text = (document.body && document.body.innerText) || ''
  if (/Erro ao carregar|Tente novamente em instantes/.test(text)) return false
  return !!document.querySelector('link[rel="canonical"]')
})()`

/** Extrai os caminhos (path) das tags <loc> do sitemap, relativos ao dominio. */
function readSitemapPaths(): string[] {
  if (!existsSync(SITEMAP_PATH)) {
    throw new Error(`sitemap.xml nao encontrado em ${SITEMAP_PATH}. Rode generate:sitemap antes.`)
  }
  const xml = readFileSync(SITEMAP_PATH, 'utf8')
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  const paths = new Set<string>()
  for (const loc of locs) {
    try {
      paths.add(new URL(loc).pathname)
    } catch {
      // ignora <loc> malformado
    }
  }
  return [...paths]
}

/** Resolve o arquivo de saida para um path: '/' -> dist/index.html. */
function outputFileFor(pathname: string): string {
  const relative = pathname.replace(/^\/+/, '').replace(/\/+$/, '')
  return relative === ''
    ? resolve(DIST_DIR, 'index.html')
    : resolve(DIST_DIR, relative, 'index.html')
}

async function snapshot(browser: Browser, baseUrl: string, pathname: string): Promise<void> {
  const page = await browser.newPage()
  try {
    page.setDefaultTimeout(NAV_TIMEOUT_MS)
    // `domcontentloaded` em vez de `networkidle0`: a prontidao real e medida pelo
    // conteudo renderizado, nao pela rede ociosa (graficos/fontes mantem conexoes
    // e estouravam o timeout de navegacao).
    await page.goto(`${baseUrl}${pathname}`, {
      waitUntil: 'domcontentloaded',
      timeout: NAV_TIMEOUT_MS,
    })
    // Espera ativa pelo estado de sucesso (READY_PREDICATE).
    await page
      .waitForFunction(READY_PREDICATE, { timeout: SETTLE_TIMEOUT_MS })
      .catch(() => undefined)

    // Valida antes de gravar: estados de erro/loading viram falha (lancam) e sao
    // retentados, garantindo que so HTML em estado de sucesso seja persistido.
    const ready = await page.evaluate(READY_PREDICATE)
    if (!ready) throw new Error('pagina nao assentou em estado de sucesso')

    const html = await page.evaluate(() => '<!doctype html>\n' + document.documentElement.outerHTML)
    const outFile = outputFileFor(pathname)
    mkdirSync(dirname(outFile), { recursive: true })
    writeFileSync(outFile, html)
  } finally {
    await page.close()
  }
}

/** Executa `worker` sobre os itens com no maximo `limit` em paralelo. */
async function runPool<T>(items: T[], limit: number, worker: (item: T) => Promise<void>): Promise<number> {
  let index = 0
  let failures = 0
  async function next(): Promise<void> {
    while (index < items.length) {
      const current = index++
      try {
        await worker(items[current])
      } catch (error) {
        failures++
        console.error(`[prerender] falha em ${String(items[current])}:`, (error as Error).message)
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => next()))
  return failures
}

async function main(): Promise<void> {
  let paths = readSitemapPaths()
  // PRERENDER_ONLY=/a,/b restringe o crawl a paths especificos (debug/retry).
  const only = (process.env.PRERENDER_ONLY ?? '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
  if (only.length > 0) paths = only
  // PRERENDER_LIMIT permite snapshots de um subconjunto (debug/smoke test).
  const limit = Number(process.env.PRERENDER_LIMIT ?? 0)
  if (limit > 0) paths = paths.slice(0, limit)
  console.log(`[prerender] ${paths.length} URLs a partir do sitemap; concorrencia ${CONCURRENCY}`)

  const server = await preview({
    preview: { port: PORT, strictPort: true },
    logLevel: 'warn',
  })
  const baseUrl = `http://localhost:${PORT}`

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const started = Date.now()
  try {
    await runPool(paths, CONCURRENCY, (pathname) => snapshot(browser, baseUrl, pathname))

    // Passadas de retry (concorrencia reduzida) para URLs sem snapshot — recuperam
    // timeouts transitorios sob carga sem reprocessar o que ja deu certo.
    let missing = paths.filter((p) => !existsSync(outputFileFor(p)))
    for (let attempt = 1; attempt <= 3 && missing.length > 0; attempt++) {
      console.log(`[prerender] retry ${attempt}: ${missing.length} URLs sem snapshot`)
      await runPool(missing, 2, (pathname) => snapshot(browser, baseUrl, pathname))
      missing = paths.filter((p) => !existsSync(outputFileFor(p)))
    }

    const ok = paths.length - missing.length
    const elapsed = ((Date.now() - started) / 1000).toFixed(1)
    console.log(
      `[prerender] concluido: ${ok}/${paths.length} paginas em ${elapsed}s` +
        (missing.length ? ` (${missing.length} sem snapshot)` : ''),
    )
    if (missing.length > 0) {
      console.error(`[prerender] URLs sem snapshot:\n  ${missing.join('\n  ')}`)
      process.exitCode = 1
    }
  } finally {
    await browser.close()
    await new Promise<void>((res) => server.httpServer.close(() => res()))
  }
}

await main()
