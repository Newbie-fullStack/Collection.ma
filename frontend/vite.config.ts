import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'favicon.svg', 'icons.svg'],
      manifest: {
        name: 'collection.ma',
        short_name: 'collection.ma',
        description: "Marketplace d'objets de collection — enchérissez en direct ou achetez en un clic.",
        lang: 'fr',
        start_url: '/',
        display: 'standalone',
        background_color: '#0e1526',
        theme_color: '#c9a227',
        icons: [
          { src: '/pwa-icon-144.png', sizes: '144x144', type: 'image/png' },
          { src: '/pwa-icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Parcourir les annonces', url: '/listings', icons: [{ src: '/pwa-icon-192.png', sizes: '192x192' }] },
          { name: 'Espace vendeur', url: '/vendeur', icons: [{ src: '/pwa-icon-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        runtimeCaching: [
{
            urlPattern: /^\/storage\//,
            handler: 'CacheFirst',
            options: { cacheName: 'listing-images', expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 } },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/sanctum': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/storage': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})