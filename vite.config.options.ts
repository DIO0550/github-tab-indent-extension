import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/options/index.ts'),
      formats: ['iife'],
      name: 'GithubTabIndentOptions',
      fileName: () => 'options.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: process.env.NODE_ENV === 'development',
  },
})