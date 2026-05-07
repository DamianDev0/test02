import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@/components/ui': path.resolve(here, 'src/shared/ui/shadcn'),
      '@/lib': path.resolve(here, 'src/shared/lib'),
      '@/hooks': path.resolve(here, 'src/shared/hooks'),
      '@': path.resolve(here, 'src'),
      shared: path.resolve(here, 'src/shared'),
      entities: path.resolve(here, 'src/entities'),
      features: path.resolve(here, 'src/features'),
      widgets: path.resolve(here, 'src/widgets'),
      pages: path.resolve(here, 'src/presentation/pages'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    env: {
      NEXT_PUBLIC_API_URL: 'http://localhost:8080',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.stories.tsx',
        'src/**/*.test.{ts,tsx}',
        'src/**/index.ts',
        'src/app/**',
      ],
    },
  },
})
