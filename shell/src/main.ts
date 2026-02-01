import { registerApplication, start } from 'single-spa';
import ReactDOM from "react-dom/client";
import * as reactApp from './react';
import * as vueApp from './vue';
import * as vanillaApp from './vanilla';
import { HomePage } from './react/pages/HomePage';
import React from 'react';
import { Header } from './react/components/Header';


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
  app: () => Promise.resolve({
    bootstrap: () => Promise.resolve(),
    mount: () => {
      if (window.location.pathname === '/') {
        const root = ReactDOM.createRoot(
          document.getElementById("root")!,
        );
        root.render(React.createElement(HomePage));
      }
      return Promise.resolve();
    },
    unmount: () => {
      const container = document.getElementById('root');
      if (container) container.innerHTML = '';
      return Promise.resolve();
    }
  }),
  activeWhen: '/'
});

registerApplication({
  name: 'react',
  app: () => Promise.resolve(reactApp),
  activeWhen: '/react'
});

registerApplication({
  name: 'vue',
  app: () => Promise.resolve(vueApp),
  activeWhen: '/vue'
});

registerApplication({
  name: 'vanilla',
  app: () => Promise.resolve(vanillaApp),
  activeWhen: '/vanilla'
});

start();