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
  }
});