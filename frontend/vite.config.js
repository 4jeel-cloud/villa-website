import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('firebase'))       return 'firebase';
          if (id.includes('@fullcalendar'))  return 'calendar';
          if (id.includes('leaflet'))        return 'map';
          if (id.includes('node_modules'))   return 'vendor';
        },
      },
    },
    chunkSizeWarningLimit: 500,
    sourcemap: false,
    assetsInlineLimit: 4096,
    modulePreload: false,
  },
})
