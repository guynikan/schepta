<template>
  <div ref="containerRef" id="vanilla-showcase-root" class="vanilla-showcase-wrapper"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { mountVanillaShowcase, unmountVanillaShowcase } from './VanillaShowcase';

const containerRef = ref<HTMLElement | null>(null);

onMounted(() => {
  if (containerRef.value) {
    mountVanillaShowcase('vanilla-showcase-root');
  }
});

onUnmounted(() => {
  unmountVanillaShowcase('vanilla-showcase-root');
});
</script>

<style scoped>
.vanilla-showcase-wrapper {
  width: 100%;
  min-height: 400px;
}
</style>
