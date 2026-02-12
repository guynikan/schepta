<template>
  <div ref="containerRef" class="vuetify-showcase-wrapper"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, createApp } from 'vue';
import VuetifyFormPage from './vuetify/pages/VuetifyFormPage.vue';
import { vuetify } from './vuetify';

const containerRef = ref<HTMLElement | null>(null);
let app: any = null;

onMounted(() => {
  if (containerRef.value) {
    app = createApp(VuetifyFormPage);
    app.use(vuetify);
    app.mount(containerRef.value);
  }
});

onUnmounted(() => {
  if (app) {
    app.unmount();
  }
});
</script>

<style scoped>
.vuetify-showcase-wrapper {
  width: 100%;
}
</style>
