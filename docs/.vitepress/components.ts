import { defineAsyncComponent, h } from 'vue';
import { createRoot } from 'react-dom/client';
import React from 'react';

// React components need to be rendered differently
const ReactWrapper = (Component: any) => {
  return defineAsyncComponent({
    loader: () => Promise.resolve(Component),
    loadingComponent: {
      setup() {
        return () => h('div', { style: { padding: '20px' } }, 'Loading...');
      },
    },
    errorComponent: {
      setup() {
        return () => h('div', { style: { padding: '20px', color: 'red' } }, 'Error loading component');
      },
    },
  });
};

export default {
  SimpleFormReact: defineAsyncComponent(() => import('../components/showcases/SimpleFormReact.vue')),
  ComplexFormReact: defineAsyncComponent(() => import('../components/showcases/ComplexFormReact.vue')),
  SimpleFormVue: defineAsyncComponent(() => import('../components/showcases/SimpleFormVue.vue')),
  ComplexFormVue: defineAsyncComponent(() => import('../components/showcases/ComplexFormVue.vue')),
  SimpleFormVuetify: defineAsyncComponent(() => import('../components/showcases/SimpleFormVuetify.vue')),
  ComplexFormVuetify: defineAsyncComponent(() => import('../components/showcases/ComplexFormVuetify.vue')),
};

