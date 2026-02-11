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
          // MUI + Emotion
          if (id.includes('node_modules/@mui/') || id.includes('node_modules/@emotion/')) {
            return 'mui-vendor';
          }
          // Chakra UI + Framer Motion
          if (id.includes('node_modules/@chakra-ui/') || id.includes('node_modules/framer-motion/')) {
            return 'chakra-vendor';
          }
          // TanStack Router
          if (id.includes('node_modules/@tanstack/router')) {
            return 'router-vendor';
          }
          // single-spa
          if (id.includes('node_modules/single-spa')) {
            return 'single-spa-vendor';
          }
          // Form libs (só carregados na rota /react)
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/formik') || id.includes('node_modules/@hookform')) {
            return 'form-vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 400
  }
});