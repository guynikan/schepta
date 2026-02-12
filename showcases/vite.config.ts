import { defineConfig } from 'vite';
import vitePluginSingleSpa from 'vite-plugin-single-spa';
import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    react(),
    vue(),
    vitePluginSingleSpa({
      type: 'root',
      imo: '3.1.1'
    })
  ],
  server: {
    port: 3000
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }
          // Vue
          if (id.includes('node_modules/vue/') || id.includes('node_modules/@vue/')) {
            return 'vue-vendor';
          }
          // TanStack Router
          if (id.includes('node_modules/@tanstack/router')) {
            return 'router-vendor';
          }
          // single-spa
          if (id.includes('node_modules/single-spa')) {
            return 'single-spa-vendor';
          }
          // React Hook Form + @hookform (separate chunk avoids circular init; Formik stays in app bundle so React is available)
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform')) {
            return 'rhf-vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 700
  }
});