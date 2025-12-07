import DefaultTheme from 'vitepress/theme';
import './custom.css';
import { defineAsyncComponent } from 'vue';

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    // Register CodeSandbox embed components
    app.component('CodeSandboxEmbed', defineAsyncComponent(() => import('../../components/examples/CodeSandboxEmbed.vue')));
    app.component('ExampleWrapper', defineAsyncComponent(() => import('../../components/examples/ExampleWrapper.vue')));
  },
};

