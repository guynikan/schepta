import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import SimpleForm from './pages/SimpleForm.vue';
import ComplexForm from './pages/ComplexForm.vue';

const routes = [
  { path: '/', component: SimpleForm },
  { path: '/complex', component: ComplexForm },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
app.use(router);
app.mount('#root');

