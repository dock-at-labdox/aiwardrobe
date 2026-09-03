import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@aiwardrobe/shared-web': path.resolve(__dirname, '../../packages/shared-web/src'),
      '@aiwardrobe/shared-schemas': path.resolve(__dirname, '../../packages/shared-schemas/src'),
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
});
