<template>
  <div ref="containerRef" class="vuetify-showcase-wrapper"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, createApp } from 'vue';
import { useData } from 'vitepress';
import VuetifyFormPage from './vuetify/pages/VuetifyFormPage.vue';
import { vuetify } from './vuetify';
import { getToken } from '../../utils/getToken';

const { isDark } = useData();
const containerRef = ref<HTMLElement | null>(null);
let app: any = null;


function syncVuetifyTheme() {
  const themeName = isDark.value ? 'dark' : 'light';
  vuetify.theme.global.name.value = themeName;

  const theme = vuetify.theme.themes.value[themeName];
  theme.colors.background = getToken('--schepta-bg', '#ffffff');
  theme.colors.surface = getToken('--schepta-bg', '#ffffff');
}

onMounted(() => {
  if (containerRef.value) {
    syncVuetifyTheme();
    app = createApp(VuetifyFormPage);
    app.use(vuetify);
    app.mount(containerRef.value);

    watch(isDark, syncVuetifyTheme);
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
