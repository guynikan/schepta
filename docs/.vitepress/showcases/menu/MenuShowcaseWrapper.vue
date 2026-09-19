<template>
  <div ref="containerRef"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useData } from 'vitepress';

const { isDark } = useData();
const containerRef = ref<HTMLElement | null>(null);
let root: any = null;
let _createElement: typeof import('react').createElement;
let _MenuShowcase: any;

function renderReact() {
  if (!root || !_createElement || !_MenuShowcase) return;
  root.render(_createElement(_MenuShowcase, { isDark: isDark.value }));
}

function renderError(message: string) {
  if (!containerRef.value) return;
  const div = document.createElement('div');
  div.style.padding = '20px';
  div.style.color = 'red';
  div.textContent = message;
  containerRef.value.replaceChildren(div);
}

onMounted(async () => {
  if (containerRef.value) {
    try {
      const [{ createRoot }, react, showcase] = await Promise.all([
        import('react-dom/client'),
        import('react'),
        import('./MenuShowcase'),
      ]);
      _createElement = react.createElement;
      _MenuShowcase = showcase.MenuShowcase;

      root = createRoot(containerRef.value);
      renderReact();

      watch(isDark, renderReact);
    } catch (error) {
      console.error('Failed to load Menu showcase:', error);
      renderError('Error loading Menu showcase');
    }
  }
});

onUnmounted(() => {
  if (root) {
    try {
      root.unmount();
    } catch (error) {
      console.error('Failed to unmount React:', error);
    }
    root = null;
  }
});
</script>
