import { registerApplication, start } from 'single-spa';
import ReactDOM from "react-dom/client";
import { lifecycles as reactApp, homeLifecycles } from './frameworks/react';
import * as vueApp from './frameworks/vue';
import * as vanillaApp from './vanilla';
import React from 'react';
import { Header } from './frameworks/react/components/Header';


registerApplication({
  name: 'header',
  app: () => Promise.resolve({
    bootstrap: () => Promise.resolve(),
    mount: () => {
      const root = ReactDOM.createRoot(
        document.getElementById("header")!,
      );
      root.render(React.createElement(Header));
      return Promise.resolve();
    },
    unmount: () => {
      const container = document.getElementById('header');
      if (container) container.innerHTML = '';
      return Promise.resolve();
    }
  }),
  activeWhen: '/'
});

registerApplication({
  name: 'home',
  app: () => Promise.resolve(homeLifecycles),
  activeWhen: (location) => location.pathname === '/'
});

registerApplication({
  name: 'react',
  app: () => Promise.resolve(reactApp),
  activeWhen: (location) => location.pathname.startsWith('/react')
});

registerApplication({
  name: 'vue',
  app: () => Promise.resolve(vueApp),
  activeWhen: (location) => location.pathname === '/vue'
});

registerApplication({
  name: 'vanilla',
  app: () => Promise.resolve(vanillaApp),
  activeWhen: (location) => location.pathname === '/vanilla'
});

start();