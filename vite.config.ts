import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { vehicleApiPlugin } from './server/apiPlugin.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega .env* (inclui não-VITE_) para o lado servidor do plugin de API.
  const env = loadEnv(mode, process.cwd(), '')
  if (env.FIPE_DATABASE_URL) {
    process.env.FIPE_DATABASE_URL = env.FIPE_DATABASE_URL
  }

  return {
    plugins: [react(), tailwindcss(), vehicleApiPlugin()],
  }
})
