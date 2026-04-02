import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  base: '/swap/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        host: resolve(__dirname, 'host/index.html'),
      },
    },
  },
})
