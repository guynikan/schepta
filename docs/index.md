---
layout: home
---

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  if (typeof window !== 'undefined') {
    // Check localStorage first
    const stored = localStorage.getItem('schepta-docs-locale');
    if (stored && (stored === 'pt-BR' || stored === 'en-US')) {
      window.location.href = `/${stored}/`;
      return;
    }
    
    // Detect from browser
    const browserLang = navigator.language || navigator.userLanguage;
    const lang = browserLang.toLowerCase();
    
    if (lang.startsWith('pt')) {
      window.location.href = '/pt-BR/';
    } else {
      window.location.href = '/en-US/';
    }
  }
});
</script>

