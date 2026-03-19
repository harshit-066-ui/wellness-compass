import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    host: true,
    port: process.env.PORT || 4173,
    allowedHosts: [
      'considerate-harmony-production.up.railway.app'
    ]
  }
})
