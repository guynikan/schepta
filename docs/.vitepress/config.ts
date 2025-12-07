import { defineConfig } from 'vitepress';
import { whyframe } from '@whyframe/core';
import { whyframeVue } from '@whyframe/vue';
import vue from '@vitejs/plugin-vue';
import react from '@vitejs/plugin-react';
import vuetify from 'vite-plugin-vuetify';
import { resolve } from 'path';

export default defineConfig({
  title: 'schepta',
  description: 'Framework-agnostic rendering engine for server-driven UI',
  base: '/',
  
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Concepts', link: '/concepts/01-factories' },
      { text: 'Examples', link: '/examples/react' },
    ],
    
    sidebar: {
      '/concepts/': [
        {
          text: 'Concepts',
          items: [
            { text: '01. Factories', link: '/concepts/01-factories' },
            { text: '02. Schema Language', link: '/concepts/02-schema-language' },
            { text: '03. Provider', link: '/concepts/03-provider' },
            { text: '04. Schema Resolution', link: '/concepts/04-schema-resolution' },
            { text: '05. Renderer', link: '/concepts/05-renderer' },
            { text: '06. Middleware', link: '/concepts/06-middleware' },
            { text: '07. Debug System', link: '/concepts/07-debug-system' },
          ],
        },
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'React', link: '/examples/react' },
            { text: 'React Material UI', link: '/examples/material-ui' },
            { text: 'React Chakra UI', link: '/examples/chakra-ui' },
            { text: 'Vue', link: '/examples/vue' },
            { text: 'Vue Vuetify', link: '/examples/vuetify' },
          ],
        },
      ],
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com' },
    ],
    
    search: {
      provider: 'local',
    },
  },
  
  vite: {
    plugins: [
      vue({
        include: [/\.vue$/],
        exclude: [/node_modules\/vitepress/, /\.md$/, /components\/examples\//],
      }),
      react(),
      whyframe({
        defaultSrc: '/frames/default',
      }),
      whyframeVue(),
      vuetify({ autoImport: true }),
    ],
    ssr: {
      noExternal: ['vuetify'],
    },
    resolve: {
      alias: {
        '@schepta/core': resolve(__dirname, '../packages/core/src'),
        '@schepta/factory-react': resolve(__dirname, '../packages/factories/react/src'),
        '@schepta/factory-vue': resolve(__dirname, '../packages/factories/vue/src'),
        '@schepta/adapter-react': resolve(__dirname, '../packages/adapters/react/src'),
        '@schepta/adapter-vue': resolve(__dirname, '../packages/adapters/vue/src'),
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'vue', 'vuetify'],
      exclude: ['vitepress'],
    },
    server: {
      hmr: {
        overlay: false,
      },
    },
  },
});

