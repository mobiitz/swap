import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: 'src/widget-runtime.js',
      fileName: () => 'widget-runtime.js',
      formats: ['es'],
    },
  },
})
