import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'tests/unit/**/*.test.ts',
      'tests/integration/**/*.test.ts',
      'tests/e2e/**/*.test.ts',
    ],
    setupFiles: ['./tests/setup.ts'],
    onConsoleLog: (_log, type) => {
      if (type === 'stderr') {
        return false
      }
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
