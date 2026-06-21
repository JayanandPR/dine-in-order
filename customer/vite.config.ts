import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5176,
    host: true,
    proxy: {
      '/api': {
        target: 'http://192.168.42.229:3000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://192.168.42.229:3000',
        ws: true,
      },
    },
  },
});
