import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin, PreviewServer, ViteDevServer } from 'vite'
import { DEFAULT_LIMIT, MAX_LIMIT, searchVehicles } from './vehicleSearchRepository.ts'

const ROUTE = '/api/vehicles/search'

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body)
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(payload)
}

async function handleSearch(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const url = new URL(req.url ?? '', 'http://localhost')
    const q = url.searchParams.get('q') ?? ''
    const limitParam = Number(url.searchParams.get('limit'))
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : DEFAULT_LIMIT
    const rows = await searchVehicles(q, Math.min(limit, MAX_LIMIT))
    sendJson(res, 200, rows)
  } catch (error) {
    console.error('[vehicle-api] erro na busca:', error)
    sendJson(res, 500, { error: 'vehicle_search_failed' })
  }
}

function attach(server: ViteDevServer | PreviewServer): void {
  server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!req.url || !req.url.startsWith(ROUTE)) {
      next()
      return
    }
    void handleSearch(req, res)
  })
}

/** Plugin Vite que serve GET /api/vehicles/search em dev e preview. */
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
