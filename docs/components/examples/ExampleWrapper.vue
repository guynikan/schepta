<template>
  <div class="example-wrapper">
    <CodeSandboxEmbed
      :sandbox-id="sandboxId"
      :title="title"
      :height="height"
      :view="view"
    />
    <div v-if="showResultsPanel" class="results-panel">
      <h3 class="results-title">Valores Submetidos</h3>
      <div v-if="submittedValues" class="results-content">
        <pre>{{ JSON.stringify(submittedValues, null, 2) }}</pre>
        <p class="results-note">
          💡 Os valores também estão disponíveis no console do navegador (F12)
        </p>
      </div>
      <div v-else class="results-empty">
        <p>Nenhum valor submetido ainda. Preencha e submeta o formulário acima.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import CodeSandboxEmbed from './CodeSandboxEmbed.vue';

interface Props {
  sandboxId: string;
  title?: string;
  height?: string;
  view?: 'editor' | 'preview' | 'split';
  showResultsPanel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Example',
  height: '600px',
  view: 'preview',
  showResultsPanel: true,
});

const submittedValues = ref<any>(null);

const handleMessage = (event: MessageEvent) => {
  // Listen for messages from CodeSandbox iframe
  if (event.data && event.data.type === 'FORM_SUBMITTED') {
    submittedValues.value = event.data.values;
  }
};

onMounted(() => {
  window.addEventListener('message', handleMessage);
});

onUnmounted(() => {
  window.removeEventListener('message', handleMessage);
});
</script>

<style scoped>
.example-wrapper {
  width: 100%;
}

.results-panel {
  margin-top: 24px;
  padding: 20px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.results-title {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.results-content {
  background: white;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.results-content pre {
  margin: 0;
  padding: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #1f2937;
  overflow-x: auto;
}

.results-note {
  margin: 12px 0 0 0;
  padding: 8px 12px;
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
  border-radius: 4px;
  font-size: 13px;
  color: #1e40af;
}

.results-empty {
  padding: 16px;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
}
</style>

