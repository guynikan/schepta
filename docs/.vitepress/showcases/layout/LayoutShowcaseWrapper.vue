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
let _LayoutShowcase: any;

function renderReact() {
  if (!root || !_createElement || !_LayoutShowcase) return;
  root.render(_createElement(_LayoutShowcase, { isDark: isDark.value }));
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
  if (!containerRef.value) return;
  try {
    const [{ createRoot }, react, showcase] = await Promise.all([
      import('react-dom/client'),
      import('react'),
      import('./LayoutShowcase'),
    ]);
    _createElement = react.createElement;
    _LayoutShowcase = showcase.LayoutShowcase;
    root = createRoot(containerRef.value);
    renderReact();
    watch(isDark, renderReact);
  } catch (error) {
    console.error('Failed to load Layout showcase:', error);
    renderError('Error loading Layout showcase');
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
