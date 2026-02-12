<template>
  <div ref="containerRef" class="react-showcase-wrapper"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Props {
  variant?: 'basic' | 'material-ui' | 'chakra-ui';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'basic',
});

const containerRef = ref<HTMLElement | null>(null);
let root: any = null;

onMounted(async () => {
  if (containerRef.value) {
    try {
      const [{ createRoot }, { createElement }, { ReactShowcase }] = await Promise.all([
        import('react-dom/client'),
        import('react'),
        import('./ReactShowcase')
      ]);
      
      root = createRoot(containerRef.value);
      root.render(createElement(ReactShowcase, { variant: props.variant }));
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
