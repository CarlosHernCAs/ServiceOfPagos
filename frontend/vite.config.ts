import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/componentes': path.resolve(__dirname, './src/componentes'),
      '@/utilidades': path.resolve(__dirname, './src/utilidades'),
      '@/tipos': path.resolve(__dirname, './src/tipos'),
      '@/servicios': path.resolve(__dirname, './src/servicios'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/contextos': path.resolve(__dirname, './src/contextos'),
      '@/esquemas': path.resolve(__dirname, './src/esquemas'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
