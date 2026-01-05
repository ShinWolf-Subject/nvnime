import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.DATA_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    },
    host: true
  },
  build: {
    rollupOptions: {
      external: ['@vite-plugin-pwa/pwa-entry']
    }
  }
})
