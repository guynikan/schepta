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
          { text: 'Guide', link: '/en-US/guide/quick-start' },
          { text: 'Concepts', link: '/en-US/concepts/01-factories' },
          { text: 'Showcases', link: '/en-US/showcases/react' },
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
          '/en-US/showcases/': [
            {
              text: 'Showcases',
              items: [
                {
                  text: 'React',
                  collapsed: false,
                  items: [
                    { text: 'Basic', link: '/en-US/showcases/react' },
                    { text: 'Material UI', link: '/en-US/showcases/material-ui' },
                    { text: 'Chakra UI', link: '/en-US/showcases/chakra-ui' },
                  ],
                },
                {
                  text: 'Vue',
                  collapsed: false,
                  items: [
                    { text: 'Basic', link: '/en-US/showcases/vue' },
                    { text: 'Vuetify', link: '/en-US/showcases/vuetify' },
                  ],
                },
                { text: 'Vanilla JS', link: '/en-US/showcases/vanilla' },
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
          { text: 'Guia', link: '/pt-BR/guide/quick-start' },
          { text: 'Conceitos', link: '/pt-BR/concepts/01-factories' },
          { text: 'Exemplos', link: '/pt-BR/showcases/react' },
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
          '/pt-BR/showcases/': [
            {
              text: 'Exemplos',
              items: [
                {
                  text: 'React',
                  collapsed: false,
                  items: [
                    { text: 'Básico', link: '/pt-BR/showcases/react' },
                    { text: 'Material UI', link: '/pt-BR/showcases/material-ui' },
                    { text: 'Chakra UI', link: '/pt-BR/showcases/chakra-ui' },
                  ],
                },
                {
                  text: 'Vue',
                  collapsed: false,
                  items: [
                    { text: 'Básico', link: '/pt-BR/showcases/vue' },
                    { text: 'Vuetify', link: '/pt-BR/showcases/vuetify' },
                  ],
                },
                { text: 'Vanilla JS', link: '/pt-BR/showcases/vanilla' },
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
          { text: 'Guía', link: '/es-ES/guide/quick-start' },
          { text: 'Conceptos', link: '/es-ES/concepts/01-factories' },
          { text: 'Ejemplos', link: '/es-ES/showcases/react' },
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
          '/es-ES/showcases/': [
            {
              text: 'Ejemplos',
              items: [
                {
                  text: 'React',
                  collapsed: false,
                  items: [
                    { text: 'Básico', link: '/es-ES/showcases/react' },
                    { text: 'Material UI', link: '/es-ES/showcases/material-ui' },
                    { text: 'Chakra UI', link: '/es-ES/showcases/chakra-ui' },
                  ],
                },
                {
                  text: 'Vue',
                  collapsed: false,
                  items: [
                    { text: 'Básico', link: '/es-ES/showcases/vue' },
                    { text: 'Vuetify', link: '/es-ES/showcases/vuetify' },
                  ],
                },
                { text: 'Vanilla JS', link: '/es-ES/showcases/vanilla' },
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
        '@schepta/core': resolve(__dirname, '../../packages/core/src'),
        '@schepta/factory-react': resolve(__dirname, '../../packages/factories/react/src'),
        '@schepta/factory-vue': resolve(__dirname, '../../packages/factories/vue/src'),
        '@schepta/factory-vanilla': resolve(__dirname, '../../packages/factories/vanilla/src'),
        '@schepta/adapter-react': resolve(__dirname, '../../packages/adapters/react/src'),
        '@schepta/adapter-vue': resolve(__dirname, '../../packages/adapters/vue/src'),
        '@schepta/adapter-vanilla': resolve(__dirname, '../../packages/adapters/vanilla/src'),
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'vue', 'vuetify'],
    },
    server: {
      hmr: {
        overlay: false,
      },
    },
  },
});

