import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin, PreviewServer, ViteDevServer } from 'vite'
import { DEFAULT_LIMIT, MAX_LIMIT, searchVehicles } from './vehicleSearchRepository.ts'
import { getVehicleBySlug } from './vehicleDetailsRepository.ts'
import { RELATED_DEFAULT_LIMIT, getRelatedBySlug } from './relatedVehiclesRepository.ts'
import { getBrandBySlug } from './brandRepository.ts'

const API_PREFIX = '/api/'
const SEARCH_ROUTE = '/api/vehicles/search'
const VEHICLES_PREFIX = '/api/vehicles/'
const BRANDS_PREFIX = '/api/brands/'

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
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

async function dispatch(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const url = new URL(req.url ?? '', 'http://localhost')
    if (url.pathname === SEARCH_ROUTE) {
      await handleSearch(url, res)
      return
    }
    if (url.pathname.startsWith(BRANDS_PREFIX)) {
      await handleBrand(url.pathname.slice(BRANDS_PREFIX.length), res)
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
    void dispatch(req, res)
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
    },
  }
}
