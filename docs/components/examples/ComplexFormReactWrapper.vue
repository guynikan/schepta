<template>
  <div ref="container" class="react-wrapper"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { createRoot, Root } from 'react-dom/client';
import React from 'react';
import ComplexFormReactApp from './ComplexFormReactApp';

const container = ref<HTMLElement | null>(null);
let root: Root | null = null;

onMounted(() => {
  if (container.value) {
    root = createRoot(container.value);
    root.render(React.createElement(ComplexFormReactApp));
  }
});

onUnmounted(() => {
  if (root) {
    root.unmount();
    root = null;
  }
});
</script>

<style scoped>
.react-wrapper {
  width: 100%;
}
</style>

