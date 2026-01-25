<template>
  <div class="home-example">
    <h2>{{ example.title }}</h2>
    <p>{{ example.description }}</p>
    <div class="code-example">
      <div class="vp-code-group">
        <div class="vp-code">
          <pre><code class="language-json">{{ codeExample }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useData } from 'vitepress';
import { computed } from 'vue';

const { frontmatter } = useData();

const example = computed(() => frontmatter.value.example || {});

const codeExample = `{
  "type": "object",
  "x-component": "FormContainer",
  "properties": {
    "email": {
      "type": "string",
      "x-component": "InputText",
      "x-ui": {
        "label": "Email",
        "placeholder": "Enter your email"
      }
    }
  }
}`
</script>

<style scoped>
.home-example {
  margin: 4rem 0;
  padding: 2rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  overflow: hidden;
}

.home-example h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
}

.home-example p {
  color: var(--vp-c-text-2);
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
}

.code-example {
  background: var(--vp-c-bg);
  border-radius: 8px;
  padding: 1.5rem;
  overflow-x: auto;
  position: relative;
  z-index: 1;
}

.code-example pre {
  margin: 0;
}

.code-example code {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
}
</style>
