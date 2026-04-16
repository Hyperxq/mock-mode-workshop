import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

// https://vite.dev/config/ — defineConfig is imported from
// `vitest/config` so the `test` block is type-safe under `tsc -b`.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
