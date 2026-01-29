<template>
  <div class="home-sections">
    <div class="section-card">
      <h2>{{ concepts.title }}</h2>
      <p>{{ concepts.description }}</p>
      <ul>
        <li v-for="item in concepts.items" :key="item.title">
          <a :href="`/${locale}${item.link}`">{{ item.title }}</a> - {{ item.description }}
        </li>
      </ul>
    </div>

    <div class="section-card">
      <h2>{{ showcases.title }}</h2>
      <p>{{ showcases.description }}</p>
      <ul>
        <li v-for="item in showcases.items" :key="item.title">
          <a :href="`/${locale}${item.link}`">{{ item.title }}</a> - {{ item.description }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useData } from 'vitepress';
import { computed } from 'vue';

const { frontmatter } = useData();

const locale = computed(() => frontmatter.value.locale || 'en-US');
const concepts = computed(() => frontmatter.value.concepts || {});
const showcases = computed(() => frontmatter.value.showcases || {});
</script>

<style scoped>
.home-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin: 4rem 0;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  overflow: hidden;
}

.section-card {
  padding: 2rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  position: relative;
  z-index: 1;
}

.section-card h2 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.section-card p {
  color: var(--vp-c-text-2);
  margin-bottom: 1rem;
}

.section-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.section-card li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.section-card li:last-child {
  border-bottom: none;
}

.section-card a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  transition: color 0.2s ease;
}

.section-card a:hover {
  color: var(--vp-c-brand-2);
  text-decoration: underline;
}

@media (max-width: 768px) {
  .home-sections {
    grid-template-columns: 1fr;
  }
}
</style>
