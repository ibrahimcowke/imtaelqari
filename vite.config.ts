import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'app-logo.png'],
      manifest: {
        name: 'إمتاع القارئ بجمال الكلم وروائع الحكم',
        short_name: 'إمتاع القارئ',
        description: 'تطبيق إمتاع القارئ بجمال الكلم وروائع الحكم',
        theme_color: '#2a1c16',
        background_color: '#090e17',
        display: 'standalone',
        dir: 'rtl',
        lang: 'ar',
        icons: [
          {
            src: 'app-logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'app-logo.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'app-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('dexie')) {
              return 'vendor-db';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
          }
        }
      }
    }
  }
})
