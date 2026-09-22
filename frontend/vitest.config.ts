import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@sost/shared': fileURLToPath(
        new URL('../shared/src', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.spec.{ts,tsx}'],
  },
});
