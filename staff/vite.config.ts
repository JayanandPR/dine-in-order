import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    proxy: {
      '/api': {
        target: 'https://dine-in-order-api.onrender.com',
        changeOrigin: true,
      },
      '/ws': {
        target: 'wss://dine-in-order-api.onrender.com',
        ws: true,
      },
    },
  },
});
