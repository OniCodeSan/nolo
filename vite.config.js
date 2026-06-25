import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';

const sentryEnabled = Boolean(
  process.env.SENTRY_AUTH_TOKEN &&
  process.env.SENTRY_ORG &&
  process.env.SENTRY_PROJECT
);

export default defineConfig({
  plugins: [
    react(),
    sentryEnabled && sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      telemetry: false,
      sourcemaps: { assets: './dist/**' },
    }),
  ].filter(Boolean),
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // Whitelist host (difesa DNS-rebinding): host:0.0.0.0 serve al port-mapping
    // del container, ma allowedHosts blocca richieste con Host header estraneo.
    allowedHosts: ['localhost', '127.0.0.1'],
    watch: { usePolling: true, interval: 300 },
    hmr: { host: 'localhost', clientPort: 8080, protocol: 'ws' },
  },
  preview: { host: '0.0.0.0', port: 4173 },
  build: {
    chunkSizeWarningLimit: 600,
    sourcemap: sentryEnabled,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase':     ['@supabase/supabase-js'],
          'leaflet':      ['leaflet'],
        },
      },
    },
  },
});
