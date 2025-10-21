import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProduction = mode === 'production';
    
    return {
      base: '/2/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      build: {
        sourcemap: false,
        minify: 'terser',
        rollupOptions: {
          output: {
            manualChunks: undefined,
          }
        }
      },
      plugins: [react()],
      define: {
        'process.env.NODE_ENV': JSON.stringify(mode),
        'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_API_KEY || env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
