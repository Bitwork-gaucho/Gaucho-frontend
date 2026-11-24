import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// BASE_PATH lets the same app be built for a subfolder, e.g. /host/gaucho/
// for bitwork.dk/host/gaucho/. Netlify builds without it and serves from /.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
})
