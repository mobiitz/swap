import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: 'src/widget-test.js',
      name: 'MbtcSwapWidgetTest',
      fileName: () => 'widget-test.js',
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        extend: true,
      },
    },
  },
})
