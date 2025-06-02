import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true, // автоматически открывать браузер
    host: true, // слушать все сетевые интерфейсы
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
