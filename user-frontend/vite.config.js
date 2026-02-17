// // // vite.config.js
// // import { defineConfig } from 'vite';
// // import react from '@vitejs/plugin-react';

// // export default defineConfig({
// //   plugins: [react()],
// //   appType: 'spa', // ✅ This ensures fallback to index.html for unknown routes
// // });

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   preview: {
//     port: 4000,
//     host: '0.0.0.0',
//     allowedHosts: ['ajride.delightcoders.com']
//   }
// })


import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Dev server port
    proxy: {
      '/api': {
        target: 'https://api-ajride.delightcoders.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  preview: {
    port: 4000,
    host: '0.0.0.0',
    allowedHosts: ['ajride.delightcoders.com']
  }
});
