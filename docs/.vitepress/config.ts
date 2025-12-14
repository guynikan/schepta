import { defineConfig } from 'vitepress';
import react from '@vitejs/plugin-react';
import vuetify from 'vite-plugin-vuetify';
import { resolve } from 'path';

export default defineConfig({
  title: 'Schepta',
  description: 'Framework-agnostic rendering engine for server-driven UI',
  base: '/',

  head: [
    ['link', { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
  ],
  
  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      title: 'Schepta',
      description: 'Framework-agnostic rendering engine for server-driven UI',
      themeConfig: {
        logo: '/guanche-gecko-head.svg',
        nav: [
          { text: 'Home', link: '/en-US/' },
          { text: 'Quick Start', link: '/en-US/guide/quick-start' },
          { text: 'Concepts', link: '/en-US/concepts/01-factories' },
          { text: 'Examples', link: '/en-US/examples/react' },
        ],
        sidebar: {
          '/en-US/guide/': [
            {
              text: 'Guide',
              items: [
                { text: 'Quick Start', link: '/en-US/guide/quick-start' },
              ],
            },
          ],
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
      title: 'Schepta',
      description: 'Motor de renderização agnóstico de framework para UI dirigida por servidor',
      themeConfig: {
        logo: '/guanche-gecko-head.svg',
        nav: [
          { text: 'Início', link: '/pt-BR/' },
          { text: 'Início Rápido', link: '/pt-BR/guide/quick-start' },
          { text: 'Conceitos', link: '/pt-BR/concepts/01-factories' },
          { text: 'Exemplos', link: '/pt-BR/examples/react' },
        ],
        sidebar: {
          '/pt-BR/guide/': [
            {
              text: 'Guia',
              items: [
                { text: 'Início Rápido', link: '/pt-BR/guide/quick-start' },
              ],
            },
          ],
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
    'es-ES': {
      label: 'Español',
      lang: 'es-ES',
      title: 'Schepta',
      description: 'Motor de renderizado agnóstico de framework para UI dirigida por servidor',
      themeConfig: {
        logo: '/guanche-gecko-head.svg',
        nav: [
          { text: 'Inicio', link: '/es-ES/' },
          { text: 'Inicio Rápido', link: '/es-ES/guide/quick-start' },
          { text: 'Conceptos', link: '/es-ES/concepts/01-factories' },
          { text: 'Ejemplos', link: '/es-ES/examples/react' },
        ],
        sidebar: {
          '/es-ES/guide/': [
            {
              text: 'Guía',
              items: [
                { text: 'Inicio Rápido', link: '/es-ES/guide/quick-start' },
              ],
            },
          ],
          '/es-ES/concepts/': [
            {
              text: 'Conceptos',
              items: [
                { text: '01. Factories', link: '/es-ES/concepts/01-factories' },
                { text: '02. Schema Language', link: '/es-ES/concepts/02-schema-language' },
                { text: '03. Provider', link: '/es-ES/concepts/03-provider' },
                { text: '04. Schema Resolution', link: '/es-ES/concepts/04-schema-resolution' },
                { text: '05. Renderer', link: '/es-ES/concepts/05-renderer' },
                { text: '06. Middleware', link: '/es-ES/concepts/06-middleware' },
                { text: '07. Debug System', link: '/es-ES/concepts/07-debug-system' },
              ],
            },
          ],
          '/es-ES/examples/': [
            {
              text: 'Ejemplos',
              items: [
                { text: 'React', link: '/es-ES/examples/react' },
                { text: 'React Material UI', link: '/es-ES/examples/material-ui' },
                { text: 'React Chakra UI', link: '/es-ES/examples/chakra-ui' },
                { text: 'Vue', link: '/es-ES/examples/vue' },
                { text: 'Vue Vuetify', link: '/es-ES/examples/vuetify' },
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
      react(),
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

