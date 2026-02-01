<template>
  <div style="padding: 2rem; background: #f0f8ff; border-radius: 8px; margin: 1rem 0;">
    <div style="color: #4fc08d; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#4fc08d">
        <path d="M12,2.2467A10.00042,10.00042,0,0,0,8.83752,21.73419c.5.08752.6875-.21247.6875-.475,0-.23749-.01251-1.025-.01251-1.86249C7,19.85919,6.35,18.78423,6.15,18.22173A3.636,3.636,0,0,0,5.125,16.8092c-.35-.1875-.85-.65-.01251-.66248A2.00117,2.00117,0,0,1,6.65,17.17169a2.13742,2.13742,0,0,0,2.91248.825A2.10376,2.10376,0,0,1,10.2,16.65923c-2.225-.25-4.55-1.11254-4.55-4.9375a3.89187,3.89187,0,0,1,1.025-2.6875,3.59373,3.59373,0,0,1,.1-2.65s.83747-.26251,2.75,1.025a9.42747,9.42747,0,0,1,5,0c1.91248-1.3,2.75-1.025,2.75-1.025a3.59323,3.59323,0,0,1,.1,2.65,3.869,3.869,0,0,1,1.025,2.6875c0,3.83747-2.33752,4.6875-4.5625,4.9375a2.36814,2.36814,0,0,1,.675,1.85c0,1.33752-.01251,2.41248-.01251,2.75,0,.26251.1875.575.6875.475A10.0057,10.0057,0,0,0,12,2.2467Z"/>
      </svg>
      <h2>Vue Microfrontend - Schepta Forms</h2>
    </div>

    <div style="background: white; padding: 1.5rem; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div class="tabs">
        <button
          v-for="(tab, index) in tabs"
          :key="tab.id"
          :class="['tab', { active: activeTab === index }]"
          @click="activeTab = index"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="tab-content">
        <div v-if="activeTab === 0" style="padding: 1rem 0;">
          <h3>Simple Vue Form</h3>
          <p>Esta é uma demonstração básica do Schepta no Vue (monorepo unificado)</p>
          <div style="padding: 1rem; background: #e8f5e8; border-radius: 4px; margin-top: 1rem;">
            <p><strong>✅ Funcionando!</strong> Este microfrontend Vue está rodando dentro do shell principal.</p>
          </div>
        </div>

        <div v-if="activeTab === 1" style="padding: 1rem 0;">
          <h3>Complex Vue Form</h3>
          <p>Aqui seria um formulário mais complexo com Schepta</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const activeTab = ref(0);

const tabs = [
  { id: 'simple', label: 'Simple Form' },
  { id: 'complex', label: 'Complex Form' }
];
</script>

<style scoped>
.tabs {
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 1rem;
}

.tab {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.tab.active {
  border-bottom-color: #4fc08d;
  color: #4fc08d;
}

.tab-content {
  padding: 1rem 0;
}

h3 {
  margin-bottom: 0.5rem;
  color: #333;
}
</style>