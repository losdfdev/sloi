import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: [
      'concentrative-scoldedly-jessica.ngrok-free.dev',
      'localhost',
      '127.0.0.1'
    ]
  }
})
