import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const { SERVER_URL, GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_MAP_ID } = loadEnv(mode, process.cwd(), "")

  return {
    plugins: [react(), tailwindcss()],
    // https://github.com/visgl/react-google-maps/blob/main/examples/basic-map/vite.config.js
    define: {
      'GOOGLE_MAPS_API_KEY': JSON.stringify(GOOGLE_MAPS_API_KEY),
      'GOOGLE_MAPS_MAP_ID': JSON.stringify(GOOGLE_MAPS_MAP_ID),
    },
    server: {
      proxy: { '/api': SERVER_URL ?? 'http://localhost:3000' },
    },
    resolve: {
      alias: {
        "@shared": path.resolve(import.meta.dirname, "../LLH_Shared")
      }
    }
  }
})
