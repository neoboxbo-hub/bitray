import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Mobile-First PWA. host:true permite abrir desde el celular en la misma red (http://IP-PC:5173)
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
})
