<template>
  <div ref="containerRef"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useData } from 'vitepress';

interface Props {
  variant?: 'basic' | 'material-ui' | 'chakra-ui';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'basic',
});

const { isDark } = useData();
const containerRef = ref<HTMLElement | null>(null);
let root: any = null;
let _createElement: typeof import('react').createElement;
let _ReactShowcase: any;

function renderReact() {
  if (!root || !_createElement || !_ReactShowcase) return;
  root.render(_createElement(_ReactShowcase, { variant: props.variant, isDark: isDark.value }));
}

onMounted(async () => {
  if (containerRef.value) {
    try {
      const [{ createRoot }, react, showcase] = await Promise.all([
        import('react-dom/client'),
        import('react'),
        import('./ReactShowcase')
      ]);
      _createElement = react.createElement;
      _ReactShowcase = showcase.ReactShowcase;

      root = createRoot(containerRef.value);
      renderReact();

      watch(isDark, renderReact);
    } catch (error) {
      console.error('Failed to load React showcase:', error);
      if (containerRef.value) {
        containerRef.value.innerHTML = '<div style="padding: 20px; color: red;">Error loading React showcase</div>';
      }
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

<style scoped>
.react-showcase-wrapper {
  width: 100%;
}
</style>
