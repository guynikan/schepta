import { createApp, h } from 'vue';
import VueFormPage from './components/VueFormPage.vue';

let vueApp: any = null;

export function bootstrap() {
  console.log('Vue app bootstrapping');
  return Promise.resolve();
}

export function mount(props: any) {
  console.log('Vue app mounting', props);
  return new Promise<void>((resolve) => {
    const container = document.createElement('div');

    vueApp = createApp({
      render() {
        return h(VueFormPage);
      },
    });

    vueApp.provide('appContext', {
      user: { id: 2, name: 'Vue User' },
      api: 'https://api.example.com',
    });

    if (props.domElement) {
      props.domElement.appendChild(container);
    } else {
      document.getElementById('root')?.appendChild(container);
    }

    vueApp.mount(container);
    resolve();
  });
}

export function unmount() {
  console.log('Vue app unmounting');
  return new Promise<void>((resolve) => {
    if (vueApp) {
      vueApp.unmount();
      vueApp = null;
    }
    resolve();
  });
}