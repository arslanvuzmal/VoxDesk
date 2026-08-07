import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    alias: {
      'server-only': path.resolve(__dirname, 'tests/mocks/empty.js'),
      '@': path.resolve(__dirname, './'),
    },
  },
});
