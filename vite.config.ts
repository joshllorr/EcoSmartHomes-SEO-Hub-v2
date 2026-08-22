import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR can be enabled/disabled via VITE_DISABLE_HMR or DISABLE_HMR environment variables
      hmr:
        process.env.VITE_DISABLE_HMR === 'true' ||
        process.env.DISABLE_HMR === 'true'
          ? false
          : true,
      // Disable file watching when HMR is disabled to save CPU and suppress websocket reconnects
      watch:
        process.env.VITE_DISABLE_HMR === 'true' ||
        process.env.DISABLE_HMR === 'true'
          ? null
          : {},
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        '/health': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        '/ws': {
          target: 'ws://localhost:3000',
          ws: true,
        },
      },
    },
    build: {
      target: ['esnext', 'safari13'],
      cssTarget: 'safari13',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name].[hash].js`,
          chunkFileNames: `assets/[name].[hash].js`,
          assetFileNames: `assets/[name].[hash].[ext]`,
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (
                id.includes('react-dom') ||
                id.includes('/react/') ||
                id.includes('react-router')
              ) {
                return 'vendor-react';
              }
              if (id.includes('recharts') || id.includes('/d3') || id.includes('d3-')) {
                return 'vendor-charts';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('jspdf')) {
                return 'vendor-pdf';
              }
              if (id.includes('motion')) {
                return 'vendor-motion';
              }
              if (id.includes('@sentry')) {
                return 'vendor-sentry';
              }
              if (id.includes('react-markdown')) {
                return 'vendor-markdown';
              }
            }
          },
        },
      },
    },
  };
});
