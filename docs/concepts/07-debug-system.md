# Ferramentas Visuais

**Sistema integrado de debug visual para desenvolvimento rápido** — o "raio-X" que mostra como tudo funciona internamente.

![Debug System](/images/07-debug-system.png)

---

**Debug System oferece visibilidade completa do que acontece durante a renderização:**

### 🔧 O Que Mostra:

| **Informação** | **Onde Aparece** | **Quando Atualiza** | **Útil Para** |
| -------------- | ---------------- | ------------------- | ------------- |
| **Form State** | Debug Panel | A cada mudança | Ver valores em tempo real |
| **Schema Applied** | Schema Inspector | Quando schema muda | Validar estrutura |
| **Component Resolution** | Component Tree | A cada render | Debug registry conflicts |
| **Middleware Pipeline** | Pipeline Tracer | Por execução | Performance tuning |
| **Performance Metrics** | Performance Monitor | Continuously | Otimização |

### 📊 Ativação Automática:

**Development Mode:**
```text
NODE_ENV=development → Debug Panel ativo automaticamente
```

**Manual Override:**
```text
REACT_APP_DEBUG_SPECTRA=true → Force debug em production
```

**Runtime Toggle:**
```javascript
window.SPECTRA_DEBUG = true; // Ativa debug via console
```

> **💡 Resultado:** Transparência total do sistema. Debug visual sem configuração!

---

## 🚀 Componentes do Debug System

**Cada ferramenta tem uma função específica:**

### 📊 Debug Panel - Painel Principal:

| **Seção** | **Conteúdo** | **Atualização** | **Interação** |
| --------- | ------------ | --------------- | ------------- |
| **Form Values** | Valores atuais dos campos | Real-time | Read-only view |
| **Validation State** | Errors, touched, dirty | On validation | Click to see details |
| **Schema Tree** | Estrutura do schema | On schema change | Expandable tree |
| **Component Map** | Components resolvidos | On render | Click to inspect |
| **Performance** | Render timing | Continuous | Hover for details |

### 🔍 Schema Inspector - Análise de Schema:

| **Feature** | **Visualização** | **Propósito** | **Navegação** |
| ----------- | ---------------- | ------------- | ------------- |
| **Schema Tree** | Hierarchical view | Ver estrutura completa | Expandir/colapsar |
| **Property Details** | Key-value pairs | Ver propriedades | Click para detalhes |
| **Validation Rules** | Rule list | Ver regras aplicadas | Hover para descrição |
| **Component Mapping** | Schema → Component | Ver resolução | Click para component |

### 🎛️ Component Tree - Hierarchy Viewer:

| **Information** | **Display** | **Purpose** | **Actions** |
| --------------- | ----------- | ----------- | ----------- |
| **Component Name** | Tree node | Identify component type | Click to inspect |
| **Props** | Expandable object | See current props | Edit in devtools |
| **Registry Source** | Badge | See where component came from | Trace resolution |
| **Render Count** | Counter | Performance monitoring | Reset counter |

### ⚡ Performance Monitor - Métricas em Tempo Real:

| **Metric** | **Measurement** | **Threshold** | **Alert** |
| ---------- | --------------- | ------------- | --------- |
| **Render Time** | Milliseconds per render | > 16ms | Performance warning |
| **Re-render Count** | Count per interaction | > 5 | Optimization needed |
| **Schema Processing** | Time to process schema | > 50ms | Complex schema warning |
| **Memory Usage** | Component memory | > 10MB | Memory leak warning |

---

## ⚙️ Debug Architecture

**Como o sistema de debug funciona internamente:**

### 📋 Debug Pipeline:

| **Stage** | **Process** | **Data Collected** | **Storage** |
| --------- | ----------- | ------------------ | ----------- |
| **1. Hook Installation** | Install debug hooks | Component lifecycle | Debug context |
| **2. Data Collection** | Collect render data | Props, state, timing | Circular buffer |
| **3. Processing** | Process collected data | Metrics, relationships | Computed state |
| **4. Visualization** | Update debug UI | Current snapshot | React/Vue state |
| **5. Interaction** | Handle user interaction | User selections | Local state |

### 🎯 Data Collection Strategy:

**Render Tracking:**
```typescript
const debugData = {
  timestamp: Date.now(),
  component: componentName,
  props: cloneDeep(props),
  schema: cloneDeep(schema),
  renderTime: performance.now() - startTime,
  memoryUsage: getMemoryUsage()
};
```

**Pipeline Tracking:**
```typescript
const pipelineTrace = {
  middlewareName: middleware.name,
  inputProps: cloneDeep(inputProps),
  outputProps: cloneDeep(outputProps),
  executionTime: executionEnd - executionStart,
  errors: capturedErrors
};
```

**Performance Tracking:**
```typescript
const performanceMetrics = {
  renderCount: renderCount,
  totalRenderTime: totalTime,
  averageRenderTime: totalTime / renderCount,
  memoryDelta: currentMemory - previousMemory
};
```

---

## 📊 Debug Features

**Funcionalidades específicas para cada tipo de problema:**

### 🔧 Form Debug Features:

| **Feature** | **Purpose** | **Data Shown** | **Actions Available** |
| ----------- | ----------- | --------------- | -------------------- |
| **Value Inspector** | See current values | Real-time form state | Copy values |
| **Validation Tracer** | Debug validation | Rules + results | Test validation |
| **Field Mapper** | Schema to component | Field mapping | Inspect component |
| **Submit Tracer** | Debug form submission | Submit data flow | Simulate submit |

### 🧭 Menu Debug Features:

| **Feature** | **Purpose** | **Data Shown** | **Actions Available** |
| ----------- | ----------- | --------------- | -------------------- |
| **Navigation Tree** | Menu structure | Hierarchical menu | Expand/collapse |
| **Visibility Logic** | Debug show/hide | Visibility expressions | Test conditions |
| **Route Mapping** | Menu to routes | URL mappings | Navigate directly |
| **Permission Check** | Debug permissions | Permission logic | Test with roles |

### 🎨 Component Debug Features:

| **Feature** | **Purpose** | **Data Shown** | **Actions Available** |
| ----------- | ----------- | --------------- | -------------------- |
| **Registry Inspector** | Debug component resolution | Resolution chain | Override components |
| **Props Tracer** | Debug props flow | Middleware pipeline | Test transformations |
| **Context Viewer** | Debug context | Context values | Modify context |
| **Render Profiler** | Debug performance | Render metrics | Profile renders |

---

## 💡 Conceitos Relacionados

**Debug System é "observabilidade" para todos os outros conceitos:**

- **[01. Factories](./01-factories.md):** Debug mostra como factories processam schemas
- **[04. Schema Resolution](./04-schema-resolution.md):** Debug rastreia etapas da resolution  
- **[05. Renderer](./05-renderer.md):** Debug mostra qual renderer foi escolhido
- **[06. Middleware](./06-middleware.md):** Debug exibe middleware aplicados
- **[03. Provider](./03-provider.md):** Debug configurado via Provider
- **[02. Schema Language](./02-schema-language.md):** Debug valida syntax dos schemas

