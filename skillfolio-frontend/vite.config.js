import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({ fastRefresh: true })],
  test: {
    environment: 'jsdom',
    setupFiles: './src/tests/setupTests.js',
    globals: true
  }
});
