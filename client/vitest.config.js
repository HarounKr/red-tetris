import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // 👇 Autorise le JSX dans les fichiers .js de ton projet
  esbuild: {
    loader: 'jsx',
    include: [
      /src\/.*\.js$/,
      /tests\/.*\.js$/,
    ],
    exclude: [],
  },

  test: {
    environment: 'jsdom',
    globals: 'true',
    setupFiles: './tests/setup.js',
  },
})
