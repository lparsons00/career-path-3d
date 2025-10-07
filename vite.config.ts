// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'react-vendor': ['react', 'react-dom']
        }
      }
    },
    assetsInlineLimit: 0
  },
  optimizeDeps: {
    include: ['three']
  },
  publicDir: 'public',
  base: '/', // Ensure base is set to root
  server: {
    fs: {
      allow: ['..']
    }
  }
});