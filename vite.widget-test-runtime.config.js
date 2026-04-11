import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: 'src/widget-test-runtime.js',
      fileName: () => 'widget-test-runtime.js',
      formats: ['es'],
    },
  },
})
