import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// Standard Vite config. When this repo is imported into Base44, Base44's
// tooling (@base44/vite-plugin) wraps the build; nothing here conflicts.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
