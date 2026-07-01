import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { Agent } from 'https'

// Bypass expired SSL certs on WorldMove servers
const insecureAgent = new Agent({ rejectUnauthorized: false })

export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    strictPort: false,
    proxy: {
      // TEST environment → tfmshippingsys.fastmove.com.tw
      '/api-test': {
        target: 'https://tfmshippingsys.fastmove.com.tw',
        changeOrigin: true,
        secure: false,
        agent: insecureAgent,
        rewrite: (path) => path.replace(/^\/api-test/, ''),
      },
      // PROD environment → fmshippingsys.fastmove.com.tw
      '/api-prod': {
        target: 'https://fmshippingsys.fastmove.com.tw',
        changeOrigin: true,
        secure: false,
        agent: insecureAgent,
        rewrite: (path) => path.replace(/^\/api-prod/, ''),
      },
    },
  },
})

