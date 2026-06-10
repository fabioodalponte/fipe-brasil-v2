import type { IncomingMessage, ServerResponse } from 'node:http'
import { existsSync, readFileSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import type { Plugin, PreviewServer, ViteDevServer } from 'vite'
import { DEFAULT_LIMIT, MAX_LIMIT, searchVehicles } from './vehicleSearchRepository.ts'
import { getVehicleBySlug } from './vehicleDetailsRepository.ts'
import { RELATED_DEFAULT_LIMIT, getRelatedBySlug } from './relatedVehiclesRepository.ts'
import { getBrandBySlug } from './brandRepository.ts'
import { getCategoryBySlug } from './categoryRepository.ts'
import {
  MARKET_RANKINGS_DEFAULT_LIMIT,
  MARKET_RANKINGS_MAX_LIMIT,
  getMarketRankings,
} from './marketRankingsRepository.ts'
import { compareVehiclesBySlug } from './compareRepository.ts'
import {
  FENABRAVE_BEST_SELLING_DEFAULT_LIMIT,
  FENABRAVE_BEST_SELLING_MAX_LIMIT,
  getFenabraveBestSellingVehicles,
  getFenabraveSegmentRanking,
  isSupportedFenabraveSegment,
} from './fenabraveRankingsRepository.ts'
import { getHomeData, getHomeVehicles } from './homeRepository.ts'

const API_PREFIX = '/api/'
const HOME_ROUTE = '/api/home'
const HOME_VEHICLES_ROUTE = '/api/home/vehicles'
const SEARCH_ROUTE = '/api/vehicles/search'
const MARKET_RANKINGS_ROUTE = '/api/market/rankings'
const FENABRAVE_BEST_SELLING_ROUTE = '/api/fenabrave/rankings/mais-vendidos'
const FENABRAVE_SEGMENT_RANKINGS_PREFIX = '/api/fenabrave/rankings/segment/'
const COMPARE_ROUTE = '/api/compare'
const VEHICLES_PREFIX = '/api/vehicles/'
const BRANDS_PREFIX = '/api/brands/'
const CATEGORIES_PREFIX = '/api/categories/'
const FENABRAVE_PREFIX = '/api/fenabrave/'
const RATE_LIMIT_WINDOW_MS = 60_000
const DEFAULT_RATE_LIMIT = 120
const SEARCH_RATE_LIMIT = 30
const COMPARE_RATE_LIMIT = 30
const FENABRAVE_RATE_LIMIT = 60

type RateLimitPolicy = {
  key: string
  limit: number
}

type RateLimitBucket = {
  count: number
  resetAt: number
}

type RateLimitResult = {
  allowed: boolean
  limit: number
  remaining: number
  retryAfterSeconds: number
}

const rateLimitBuckets = new Map<string, RateLimitBucket>()
let lastRateLimitCleanup = Date.now()

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

function headerValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

function getClientIp(req: IncomingMessage): string {
  const cfIp = headerValue(req.headers['cf-connecting-ip'])?.trim()
  if (cfIp) return cfIp

  const forwardedFor = headerValue(req.headers['x-forwarded-for'])
    ?.split(',')[0]
    ?.trim()
  if (forwardedFor) return forwardedFor

  return req.socket.remoteAddress ?? 'unknown'
}

function rateLimitPolicy(pathname: string): RateLimitPolicy {
  if (pathname === SEARCH_ROUTE) return { key: 'search', limit: SEARCH_RATE_LIMIT }
  if (pathname === COMPARE_ROUTE) return { key: 'compare', limit: COMPARE_RATE_LIMIT }
  if (pathname.startsWith(FENABRAVE_PREFIX)) {
    return { key: 'fenabrave', limit: FENABRAVE_RATE_LIMIT }
  }
  return { key: 'default', limit: DEFAULT_RATE_LIMIT }
}

function cleanupRateLimitBuckets(now: number): void {
  if (now - lastRateLimitCleanup < RATE_LIMIT_WINDOW_MS) return
  for (const [key, bucket] of rateLimitBuckets) {
    if (bucket.resetAt <= now) rateLimitBuckets.delete(key)
  }
  lastRateLimitCleanup = now
}

function checkRateLimit(req: IncomingMessage, pathname: string): RateLimitResult {
  const now = Date.now()
  cleanupRateLimitBuckets(now)

  const policy = rateLimitPolicy(pathname)
  const bucketKey = `${policy.key}:${getClientIp(req)}`
  const current = rateLimitBuckets.get(bucketKey)
  const bucket = current && current.resetAt > now
    ? current
    : { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS }

  if (bucket.count >= policy.limit) {
    rateLimitBuckets.set(bucketKey, bucket)
    return {
      allowed: false,
      limit: policy.limit,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    }
  }

  bucket.count += 1
  rateLimitBuckets.set(bucketKey, bucket)

  return {
    allowed: true,
    limit: policy.limit,
    remaining: Math.max(0, policy.limit - bucket.count),
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  }
}

function setRateLimitHeaders(res: ServerResponse, result: RateLimitResult): void {
  res.setHeader('X-RateLimit-Limit', String(result.limit))
  res.setHeader('X-RateLimit-Remaining', String(result.remaining))
  res.setHeader('Retry-After', String(result.retryAfterSeconds))
}

async function handleSearch(url: URL, res: ServerResponse): Promise<void> {
  const q = url.searchParams.get('q') ?? ''
  const limitParam = Number(url.searchParams.get('limit'))
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : DEFAULT_LIMIT
  const rows = await searchVehicles(q, Math.min(limit, MAX_LIMIT))
  sendJson(res, 200, rows)
}

async function handleDetails(slug: string, res: ServerResponse): Promise<void> {
  const details = await getVehicleBySlug(decodeURIComponent(slug))
  if (!details) {
    sendJson(res, 404, { error: 'not_found' })
    return
  }
  sendJson(res, 200, details)
}

async function handleRelated(slug: string, url: URL, res: ServerResponse): Promise<void> {
  const limitParam = Number(url.searchParams.get('limit'))
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : RELATED_DEFAULT_LIMIT
  const rows = await getRelatedBySlug(decodeURIComponent(slug), limit)
  sendJson(res, 200, rows)
}

async function handleBrand(slug: string, res: ServerResponse): Promise<void> {
  const brand = await getBrandBySlug(decodeURIComponent(slug))
  if (!brand) {
    sendJson(res, 404, { error: 'not_found' })
    return
  }
  sendJson(res, 200, brand)
}

async function handleCategory(slug: string, res: ServerResponse): Promise<void> {
  const category = await getCategoryBySlug(decodeURIComponent(slug))
  if (!category) {
    sendJson(res, 404, { error: 'not_found' })
    return
  }
  sendJson(res, 200, category)
}

async function handleMarketRankings(url: URL, res: ServerResponse): Promise<void> {
  const limitParam = Number(url.searchParams.get('limit'))
  const limit = Number.isFinite(limitParam) && limitParam > 0
    ? limitParam
    : MARKET_RANKINGS_DEFAULT_LIMIT
  const rankings = await getMarketRankings(Math.min(limit, MARKET_RANKINGS_MAX_LIMIT))
  sendJson(res, 200, rankings)
}

async function handleFenabraveBestSelling(url: URL, res: ServerResponse): Promise<void> {
  const limitParam = Number(url.searchParams.get('limit'))
  const limit = Number.isFinite(limitParam) && limitParam > 0
    ? limitParam
    : FENABRAVE_BEST_SELLING_DEFAULT_LIMIT
  const rankings = await getFenabraveBestSellingVehicles(
    Math.min(limit, FENABRAVE_BEST_SELLING_MAX_LIMIT),
  )
  sendJson(res, 200, rankings)
}

async function handleFenabraveSegmentRanking(segment: string, url: URL, res: ServerResponse): Promise<void> {
  if (!isSupportedFenabraveSegment(segment)) {
    sendJson(res, 404, { error: 'unsupported_fenabrave_segment' })
    return
  }

  const limitParam = Number(url.searchParams.get('limit'))
  const limit = Number.isFinite(limitParam) && limitParam > 0
    ? limitParam
    : FENABRAVE_BEST_SELLING_DEFAULT_LIMIT
  const rankings = await getFenabraveSegmentRanking(
    segment,
    Math.min(limit, FENABRAVE_BEST_SELLING_MAX_LIMIT),
  )
  sendJson(res, 200, rankings)
}

async function handleCompare(url: URL, res: ServerResponse): Promise<void> {
  const base = url.searchParams.get('base') ?? ''
  const target = url.searchParams.get('target') ?? ''
  if (!base.trim() || !target.trim()) {
    sendJson(res, 400, { error: 'missing_compare_slugs' })
    return
  }

  const comparison = await compareVehiclesBySlug(base, target)
  if (!comparison) {
    sendJson(res, 404, { error: 'not_found' })
    return
  }
  sendJson(res, 200, comparison)
}

async function handleHome(res: ServerResponse): Promise<void> {
  const home = await getHomeData()
  sendJson(res, 200, home)
}

function numberParam(url: URL, key: string): number | undefined {
  const rawValue = url.searchParams.get(key)
  if (!rawValue) return undefined
  const value = Number(rawValue)
  return Number.isFinite(value) ? value : undefined
}

async function handleHomeVehicles(url: URL, res: ServerResponse): Promise<void> {
  const vehicles = await getHomeVehicles({
    brand: url.searchParams.get('brand') || undefined,
    segment: url.searchParams.get('segment') || undefined,
    minPrice: numberParam(url, 'minPrice'),
    maxPrice: numberParam(url, 'maxPrice'),
    limit: numberParam(url, 'limit'),
  })
  sendJson(res, 200, vehicles)
}

async function dispatch(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const url = new URL(req.url ?? '', 'http://localhost')
    if (url.pathname === HOME_VEHICLES_ROUTE) {
      await handleHomeVehicles(url, res)
      return
    }
    if (url.pathname === HOME_ROUTE) {
      await handleHome(res)
      return
    }
    if (url.pathname === SEARCH_ROUTE) {
      await handleSearch(url, res)
      return
    }
    if (url.pathname === MARKET_RANKINGS_ROUTE) {
      await handleMarketRankings(url, res)
      return
    }
    if (url.pathname === FENABRAVE_BEST_SELLING_ROUTE) {
      await handleFenabraveBestSelling(url, res)
      return
    }
    if (url.pathname.startsWith(FENABRAVE_SEGMENT_RANKINGS_PREFIX)) {
      await handleFenabraveSegmentRanking(
        decodeURIComponent(url.pathname.slice(FENABRAVE_SEGMENT_RANKINGS_PREFIX.length)),
        url,
        res,
      )
      return
    }
    if (url.pathname === COMPARE_ROUTE) {
      await handleCompare(url, res)
      return
    }
    if (url.pathname.startsWith(BRANDS_PREFIX)) {
      await handleBrand(url.pathname.slice(BRANDS_PREFIX.length), res)
      return
    }
    if (url.pathname.startsWith(CATEGORIES_PREFIX)) {
      await handleCategory(url.pathname.slice(CATEGORIES_PREFIX.length), res)
      return
    }
    if (url.pathname.startsWith(VEHICLES_PREFIX)) {
      const rest = url.pathname.slice(VEHICLES_PREFIX.length)
      if (rest.endsWith('/related')) {
        await handleRelated(rest.slice(0, -'/related'.length), url, res)
        return
      }
      await handleDetails(rest, res)
      return
    }
    sendJson(res, 404, { error: 'not_found' })
  } catch (error) {
    console.error('[vehicle-api] erro:', error)
    sendJson(res, 500, { error: 'vehicle_api_failed' })
  }
}

function attach(server: ViteDevServer | PreviewServer): void {
  server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!req.url || !req.url.startsWith(API_PREFIX)) {
      next()
      return
    }

    const url = new URL(req.url, 'http://localhost')
    const rateLimit = checkRateLimit(req, url.pathname)
    setRateLimitHeaders(res, rateLimit)
    if (!rateLimit.allowed) {
      sendJson(res, 429, { error: 'rate_limited' })
      return
    }

    void dispatch(req, res)
  })
}

const DIST_DIR = resolve(process.cwd(), 'dist')

/**
 * Serve o HTML prerenderizado (snapshot estatico gerado por scripts/prerender.ts)
 * para requisicoes de pagina: `GET /carro/<slug>` -> `dist/carro/<slug>/index.html`.
 * Roda apenas no preview/producao, antes do fallback SPA do Vite. Requisicoes de
 * API, assets (qualquer path com extensao) e rotas sem snapshot caem no `next()`,
 * preservando o comportamento estatico/SPA padrao.
 */
function attachPrerender(server: PreviewServer): void {
  server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!req.url || (req.method !== 'GET' && req.method !== 'HEAD')) {
      next()
      return
    }

    const { pathname } = new URL(req.url, 'http://localhost')
    if (pathname.startsWith(API_PREFIX) || extname(pathname) !== '') {
      next()
      return
    }

    // Rota legada: /vehicle/<slug> -> /carro/<slug> com 301 permanente, para
    // crawlers e links externos que ainda apontem para o prefixo antigo.
    if (pathname.startsWith('/vehicle/')) {
      res.statusCode = 301
      res.setHeader('Location', pathname.replace(/^\/vehicle\//, '/carro/'))
      res.end()
      return
    }

    let decoded: string
    try {
      decoded = decodeURIComponent(pathname)
    } catch {
      next()
      return
    }
    // Defesa contra path traversal: nenhum segmento '..'.
    if (decoded.split('/').includes('..')) {
      next()
      return
    }

    const relative = decoded.replace(/^\/+/, '').replace(/\/+$/, '')
    const filePath = resolve(DIST_DIR, relative, 'index.html')
    if (!filePath.startsWith(DIST_DIR) || !existsSync(filePath)) {
      next()
      return
    }

    const html = readFileSync(filePath)
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(req.method === 'HEAD' ? undefined : html)
  })
}

/** Plugin Vite que serve a API de veículos em dev e preview. */
export function vehicleApiPlugin(): Plugin {
  return {
    name: 'fipe-vehicle-api',
    configureServer(server) {
      attach(server)
    },
    configurePreviewServer(server) {
      attach(server)
      attachPrerender(server)
    },
  }
}
