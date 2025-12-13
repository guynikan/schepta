# Visual Tools

**Integrated visual debug system for rapid development** — the "X-ray" that shows how everything works internally.

<img src="/images/07-debug-system.svg" alt="Debug System" />


**Debug System offers complete visibility into what happens during rendering:**

### 🔧 What It Shows:

| **Information** | **Where It Appears** | **When It Updates** | **Useful For** |
| -------------- | ---------------- | ------------------- | ------------- |
| **Form State** | Debug Panel | On every change | See values in real-time |
| **Schema Applied** | Schema Inspector | When schema changes | Validate structure |
| **Component Resolution** | Component Tree | On every render | Debug registry conflicts |
| **Middleware Pipeline** | Pipeline Tracer | Per execution | Performance tuning |
| **Performance Metrics** | Performance Monitor | Continuously | Optimization |

### 📊 Automatic Activation:

**Development Mode:**
```text
NODE_ENV=development → Debug Panel active automatically
```

**Manual Override:**
```text
REACT_APP_DEBUG_schepta=true → Force debug in production
```

**Runtime Toggle:**
```javascript
window.schepta_DEBUG = true; // Activate debug via console
```

> **💡 Result:** Complete system transparency. Visual debug without configuration!


## 🚀 Debug System Components

**Each tool has a specific function:**

### 📊 Debug Panel - Main Panel:

| **Section** | **Content** | **Update** | **Interaction** |
| --------- | ------------ | --------------- | ------------- |
| **Form Values** | Current field values | Real-time | Read-only view |
| **Validation State** | Errors, touched, dirty | On validation | Click to see details |
| **Schema Tree** | Schema structure | On schema change | Expandable tree |
| **Component Map** | Resolved components | On render | Click to inspect |
| **Performance** | Render timing | Continuous | Hover for details |

### 🔍 Schema Inspector - Schema Analysis:

| **Feature** | **Visualization** | **Purpose** | **Navigation** |
| ----------- | ---------------- | ------------- | ------------- |
| **Schema Tree** | Hierarchical view | See complete structure | Expand/collapse |
| **Property Details** | Key-value pairs | See properties | Click for details |
| **Validation Rules** | Rule list | See applied rules | Hover for description |
| **Component Mapping** | Schema → Component | See resolution | Click for component |

### 🎛️ Component Tree - Hierarchy Viewer:

| **Information** | **Display** | **Purpose** | **Actions** |
| --------------- | ----------- | ----------- | ----------- |
| **Component Name** | Tree node | Identify component type | Click to inspect |
| **Props** | Expandable object | See current props | Edit in devtools |
| **Registry Source** | Badge | See where component came from | Trace resolution |
| **Render Count** | Counter | Performance monitoring | Reset counter |

### ⚡ Performance Monitor - Real-Time Metrics:

| **Metric** | **Measurement** | **Threshold** | **Alert** |
| ---------- | --------------- | ------------- | --------- |
| **Render Time** | Milliseconds per render | > 16ms | Performance warning |
| **Re-render Count** | Count per interaction | > 5 | Optimization needed |
| **Schema Processing** | Time to process schema | > 50ms | Complex schema warning |
| **Memory Usage** | Component memory | > 10MB | Memory leak warning |


## ⚙️ Debug Architecture

**How the debug system works internally:**

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


## 📊 Debug Features

**Specific functionalities for each type of problem:**

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


## 💡 Related Concepts

**Debug System is "observability" for all other concepts:**

- **[01. Factories](./01-factories.md):** Debug shows how factories process schemas
- **[04. Schema Resolution](./04-schema-resolution.md):** Debug tracks resolution steps  
- **[05. Renderer](./05-renderer.md):** Debug shows which renderer was chosen
- **[06. Middleware](./06-middleware.md):** Debug displays applied middleware
- **[03. Provider](./03-provider.md):** Debug configured via Provider
- **[02. Schema Language](./02-schema-language.md):** Debug validates schema syntax
