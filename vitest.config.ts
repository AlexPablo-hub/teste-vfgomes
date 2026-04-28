/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // Força resolução do React em modo development durante testes —
    // sem isso, act() do Testing Library não funciona ('act is not
    // supported in production builds of React').
    conditions: process.env.VITEST ? ['development'] : [],
  },
  define: {
    // Garante que process.env.NODE_ENV resolva para 'test' em tempo de bundle.
    'process.env.NODE_ENV': JSON.stringify('test'),
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/test/**',
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/**/*.d.ts',
      ],
    },
  },
})
