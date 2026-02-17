// // vite.config.js
// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
//   appType: 'spa', // ✅ This ensures fallback to index.html for unknown routes
// });

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    port: 5001,
    host: '0.0.0.0',
    allowedHosts: ['https://admin-ajride.delightcoders.com']
  }
})
