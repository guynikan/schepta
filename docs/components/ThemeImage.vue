<template>
  <img :src="imageSrc" :alt="alt" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '' }
});

const imageSrc = ref(props.src);
let observer = null;

function updateTheme() {
  if (typeof document !== 'undefined') {
    const isDark = document.documentElement.classList.contains('dark');
    const baseSrc = props.src.replace(/-dark\.(png|jpg|jpeg|svg|webp)$/i, '.$1');
    const extensionMatch = baseSrc.match(/\.(png|jpg|jpeg|svg|webp)$/i);
    const extension = extensionMatch ? extensionMatch[0] : '.png';
    const srcWithoutExt = baseSrc.replace(extension, '');
    imageSrc.value = isDark 
      ? `${srcWithoutExt}-dark${extension}`
      : baseSrc;
  }
}

onMounted(() => {
  updateTheme();
  if (typeof document !== 'undefined') {
    observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  }
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style scoped>
img {
  transition: opacity 0.2s ease-in-out;
}
</style>
