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
    assetsInlineLimit: 4096, // Keep this reasonable for GLTF textures
    // Optimize for mobile
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
      },
    },
  },
  optimizeDeps: {
    include: ['three']
  },
  publicDir: 'public',
  base: '/',
  server: {
    fs: {
      allow: ['..']
    }
  }
});