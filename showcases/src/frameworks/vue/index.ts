import { createApp, h } from 'vue';
import VueFormPage from './components/VueFormPage.vue';
import singleSpaVue from 'single-spa-vue';
import { vuetify } from './plugins/vuetify';

const lifecycles = singleSpaVue({
  createApp,
  appOptions: {
    render: () => h(VueFormPage),
  },
  handleInstance: (app) => {
    app.use(vuetify);
  },
});

export const { bootstrap, mount, unmount } = lifecycles;