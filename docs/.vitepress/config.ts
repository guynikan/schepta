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
  
  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      title: 'schepta',
      description: 'Framework-agnostic rendering engine for server-driven UI',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en-US/' },
          { text: 'Concepts', link: '/en-US/concepts/01-factories' },
          { text: 'Examples', link: '/en-US/examples/react' },
        ],
        sidebar: {
          '/en-US/concepts/': [
            {
              text: 'Concepts',
              items: [
                { text: '01. Factories', link: '/en-US/concepts/01-factories' },
                { text: '02. Schema Language', link: '/en-US/concepts/02-schema-language' },
                { text: '03. Provider', link: '/en-US/concepts/03-provider' },
                { text: '04. Schema Resolution', link: '/en-US/concepts/04-schema-resolution' },
                { text: '05. Renderer', link: '/en-US/concepts/05-renderer' },
                { text: '06. Middleware', link: '/en-US/concepts/06-middleware' },
                { text: '07. Debug System', link: '/en-US/concepts/07-debug-system' },
              ],
            },
          ],
          '/en-US/examples/': [
            {
              text: 'Examples',
              items: [
                { text: 'React', link: '/en-US/examples/react' },
                { text: 'React Material UI', link: '/en-US/examples/material-ui' },
                { text: 'React Chakra UI', link: '/en-US/examples/chakra-ui' },
                { text: 'Vue', link: '/en-US/examples/vue' },
                { text: 'Vue Vuetify', link: '/en-US/examples/vuetify' },
              ],
            },
          ],
        },
        socialLinks: [
          { icon: 'github', link: 'https://github.com/guynikan/schepta' },
        ],
      },
    },
    'pt-BR': {
      label: 'Português',
      lang: 'pt-BR',
      title: 'schepta',
      description: 'Motor de renderização agnóstico de framework para UI dirigida por servidor',
      themeConfig: {
        nav: [
          { text: 'Início', link: '/pt-BR/' },
          { text: 'Conceitos', link: '/pt-BR/concepts/01-factories' },
          { text: 'Exemplos', link: '/pt-BR/examples/react' },
        ],
        sidebar: {
          '/pt-BR/concepts/': [
            {
              text: 'Conceitos',
              items: [
                { text: '01. Factories', link: '/pt-BR/concepts/01-factories' },
                { text: '02. Schema Language', link: '/pt-BR/concepts/02-schema-language' },
                { text: '03. Provider', link: '/pt-BR/concepts/03-provider' },
                { text: '04. Schema Resolution', link: '/pt-BR/concepts/04-schema-resolution' },
                { text: '05. Renderer', link: '/pt-BR/concepts/05-renderer' },
                { text: '06. Middleware', link: '/pt-BR/concepts/06-middleware' },
                { text: '07. Debug System', link: '/pt-BR/concepts/07-debug-system' },
              ],
            },
          ],
          '/pt-BR/examples/': [
            {
              text: 'Exemplos',
              items: [
                { text: 'React', link: '/pt-BR/examples/react' },
                { text: 'React Material UI', link: '/pt-BR/examples/material-ui' },
                { text: 'React Chakra UI', link: '/pt-BR/examples/chakra-ui' },
                { text: 'Vue', link: '/pt-BR/examples/vue' },
                { text: 'Vue Vuetify', link: '/pt-BR/examples/vuetify' },
              ],
            },
          ],
        },
        socialLinks: [
          { icon: 'github', link: 'https://github.com/guynikan/schepta' },
        ],
      },
    },
  },
  
  themeConfig: {
    search: {
      provider: 'local',
    },
  },
  
  vite: {
    plugins: [
      vue({
        include: [/\.vue$/],
        exclude: [/node_modules\/vitepress/, /\.md$/, /docs\/components\/examples/],
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

