import { createApp, h } from 'vue';
import VueFormPage from './components/VueFormPage.vue';
import singleSpaVue from 'single-spa-vue';

const lifecycles = singleSpaVue({
  createApp,
  appOptions: {
    render: () => h(VueFormPage),
  },
});

export const { bootstrap, mount, unmount } = lifecycles;