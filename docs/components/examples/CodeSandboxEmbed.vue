<template>
  <div class="codesandbox-embed-wrapper">
    <div v-if="loading" class="loading-state">
      <p>Carregando exemplo...</p>
    </div>
    <iframe
      :src="embedUrl"
      :title="title"
      class="codesandbox-iframe"
      :style="{ height: height }"
      allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
      sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
      @load="loading = false"
    ></iframe>
    <div v-if="sandboxId" class="codesandbox-actions">
      <a
        :href="`https://codesandbox.io/s/${sandboxId}`"
        target="_blank"
        rel="noopener noreferrer"
        class="edit-link"
      >
        ✏️ Editar no CodeSandbox
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  sandboxId: string;
  title?: string;
  height?: string;
  view?: 'editor' | 'preview' | 'split';
  hideNavigation?: boolean;
  theme?: 'light' | 'dark';
}

const props = withDefaults(defineProps<Props>(), {
  title: 'CodeSandbox Example',
  height: '600px',
  view: 'preview',
  hideNavigation: true,
  theme: 'light',
});

const loading = ref(true);

const embedUrl = computed(() => {
  const params = new URLSearchParams({
    fontsize: '14',
    hidenavigation: props.hideNavigation ? '1' : '0',
    theme: props.theme,
    view: props.view,
    module: '/src/App',
  });

  return `https://codesandbox.io/embed/${props.sandboxId}?${params.toString()}`;
});
</script>

<style scoped>
.codesandbox-embed-wrapper {
  width: 100%;
  margin: 24px 0;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.loading-state {
  padding: 40px;
  text-align: center;
  color: #6b7280;
}

.codesandbox-iframe {
  width: 100%;
  border: 0;
  display: block;
  min-height: 400px;
}

.codesandbox-actions {
  padding: 12px 16px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  text-align: right;
}

.edit-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}

.edit-link:hover {
  color: #2563eb;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .codesandbox-iframe {
    min-height: 500px;
  }
}
</style>

