import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' — сайт работает из любой папки (GitHub Pages, Netlify, Vercel, просто файл)
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { chunkSizeWarningLimit: 2000 },
})
