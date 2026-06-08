import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { vehicleApiPlugin } from './server/apiPlugin.ts'

const DEFAULT_PREVIEW_ALLOWED_HOSTS = [
  'fipebrasil.com',
  'www.fipebrasil.com',
  'o7e088ucwtcw8xu0gtclfi5j.173.212.237.138.sslip.io',
]

function parseAllowedHosts(value: string | undefined): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean)
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega .env* (inclui não-VITE_) para o lado servidor do plugin de API.
  const env = loadEnv(mode, process.cwd(), '')
  if (env.FIPE_DATABASE_URL) {
    process.env.FIPE_DATABASE_URL = env.FIPE_DATABASE_URL
  }
  const previewAllowedHosts = Array.from(
    new Set([
      ...DEFAULT_PREVIEW_ALLOWED_HOSTS,
      ...parseAllowedHosts(env.PREVIEW_ALLOWED_HOSTS),
      ...parseAllowedHosts(env.VITE_PREVIEW_ALLOWED_HOSTS),
    ]),
  )

  return {
    plugins: [react(), tailwindcss(), vehicleApiPlugin()],
    preview: {
      allowedHosts: previewAllowedHosts,
    },
  }
})
