# Herramientas Visuales

**Sistema de debug visual integrado para desarrollo rápido** — el "rayos X" que muestra cómo funciona todo internamente.

<img src="/images/07-debug-system.svg" alt="Debug System" />


**El Sistema de Debug ofrece visibilidad completa de lo que sucede durante el renderizado:**

### 🔧 Qué Muestra:

| **Información** | **Dónde Aparece** | **Cuándo Se Actualiza** | **Útil Para** |
| -------------- | ---------------- | ------------------- | ------------- |
| **Estado del Formulario** | Panel de Debug | En cada cambio | Ver valores en tiempo real |
| **Schema Aplicado** | Inspector de Schema | Cuando cambia el schema | Validar estructura |
| **Resolución de Componente** | Árbol de Componentes | En cada renderizado | Debug de conflictos de registro |
| **Pipeline de Middleware** | Tracer de Pipeline | Por ejecución | Ajuste de rendimiento |
| **Métricas de Rendimiento** | Monitor de Rendimiento | Continuamente | Optimización |

### 📊 Activación Automática:

**Modo Desarrollo:**
```text
NODE_ENV=development → Panel de Debug activo automáticamente
```

**Override Manual:**
```text
REACT_APP_DEBUG_schepta=true → Forzar debug en producción
```

**Toggle en Runtime:**
```javascript
window.schepta_DEBUG = true; // Activar debug vía consola
```

> **💡 Resultado:** Transparencia completa del sistema. ¡Debug visual sin configuración!


## 🚀 Componentes del Sistema de Debug

**Cada herramienta tiene una función específica:**

### 📊 Debug Panel - Panel Principal:

| **Sección** | **Contenido** | **Actualización** | **Interacción** |
| --------- | ------------ | --------------- | ------------- |
| **Valores del Formulario** | Valores actuales de campos | Tiempo real | Vista de solo lectura |
| **Estado de Validación** | Errores, touched, dirty | En validación | Click para ver detalles |
| **Árbol de Schema** | Estructura del schema | Al cambiar schema | Árbol expandible |
| **Mapa de Componentes** | Componentes resueltos | En renderizado | Click para inspeccionar |
| **Rendimiento** | Tiempo de renderizado | Continuamente | Hover para detalles |

### 🔍 Schema Inspector - Análisis de Schema:

| **Característica** | **Visualización** | **Propósito** | **Navegación** |
| ----------- | ---------------- | ------------- | ------------- |
| **Árbol de Schema** | Vista jerárquica | Ver estructura completa | Expandir/colapsar |
| **Detalles de Propiedad** | Pares clave-valor | Ver propiedades | Click para detalles |
| **Reglas de Validación** | Lista de reglas | Ver reglas aplicadas | Hover para descripción |
| **Mapeo de Componentes** | Schema → Componente | Ver resolución | Click para componente |

### 🎛️ Component Tree - Visor de Jerarquía:

| **Información** | **Visualización** | **Propósito** | **Acciones** |
| --------------- | ----------- | ----------- | ----------- |
| **Nombre de Componente** | Nodo del árbol | Identificar tipo de componente | Click para inspeccionar |
| **Props** | Objeto expandible | Ver props actuales | Editar en devtools |
| **Fuente de Registro** | Badge | Ver de dónde vino el componente | Trazar resolución |
| **Contador de Renderizado** | Contador | Monitoreo de rendimiento | Reiniciar contador |

### ⚡ Performance Monitor - Métricas en Tiempo Real:

| **Métrica** | **Medición** | **Umbral** | **Alerta** |
| ---------- | --------------- | ------------- | --------- |
| **Tiempo de Renderizado** | Milisegundos por renderizado | > 16ms | Advertencia de rendimiento |
| **Contador de Re-renderizado** | Contador por interacción | > 5 | Optimización necesaria |
| **Procesamiento de Schema** | Tiempo para procesar schema | > 50ms | Advertencia de schema complejo |
| **Uso de Memoria** | Memoria de componente | > 10MB | Advertencia de fuga de memoria |


## ⚙️ Arquitectura de Debug

**Cómo funciona el sistema de debug internamente:**

### 📋 Pipeline de Debug:

| **Etapa** | **Proceso** | **Datos Colectados** | **Almacenamiento** |
| --------- | ----------- | ------------------ | ----------- |
| **1. Instalación de Hooks** | Instalar hooks de debug | Ciclo de vida del componente | Contexto de debug |
| **2. Recolección de Datos** | Recolectar datos de renderizado | Props, estado, tiempo | Buffer circular |
| **3. Procesamiento** | Procesar datos recolectados | Métricas, relaciones | Estado computado |
| **4. Visualización** | Actualizar UI de debug | Snapshot actual | Estado React/Vue |
| **5. Interacción** | Manejar interacción del usuario | Selecciones del usuario | Estado local |

### 🎯 Estrategia de Recolección de Datos:

**Seguimiento de Renderizado:**
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

**Seguimiento de Pipeline:**
```typescript
const pipelineTrace = {
  middlewareName: middleware.name,
  inputProps: cloneDeep(inputProps),
  outputProps: cloneDeep(outputProps),
  executionTime: executionEnd - executionStart,
  errors: capturedErrors
};
```

**Seguimiento de Rendimiento:**
```typescript
const performanceMetrics = {
  renderCount: renderCount,
  totalRenderTime: totalTime,
  averageRenderTime: totalTime / renderCount,
  memoryDelta: currentMemory - previousMemory
};
```


## 📊 Características de Debug

**Funcionalidades específicas para cada tipo de problema:**

### 🔧 Características de Debug de Formulario:

| **Característica** | **Propósito** | **Datos Mostrados** | **Acciones Disponibles** |
| ----------- | ----------- | --------------- | -------------------- |
| **Value Inspector** | Ver valores actuales | Estado del formulario en tiempo real | Copiar valores |
| **Validation Tracer** | Debug de validación | Reglas + resultados | Probar validación |
| **Field Mapper** | Schema a componente | Mapeo de campos | Inspeccionar componente |
| **Submit Tracer** | Debug de envío de formulario | Flujo de datos de envío | Simular envío |

### 🧭 Características de Debug de Menú:

| **Característica** | **Propósito** | **Datos Mostrados** | **Acciones Disponibles** |
| ----------- | ----------- | --------------- | -------------------- |
| **Navigation Tree** | Estructura de menú | Menú jerárquico | Expandir/colapsar |
| **Visibility Logic** | Debug mostrar/ocultar | Expresiones de visibilidad | Probar condiciones |
| **Route Mapping** | Menú a rutas | Mapeos de URL | Navegar directamente |
| **Permission Check** | Debug de permisos | Lógica de permisos | Probar con roles |

### 🎨 Características de Debug de Componente:

| **Característica** | **Propósito** | **Datos Mostrados** | **Acciones Disponibles** |
| ----------- | ----------- | --------------- | -------------------- |
| **Registry Inspector** | Debug de resolución de componentes | Cadena de resolución | Override de componentes |
| **Props Tracer** | Debug de flujo de props | Pipeline de middleware | Probar transformaciones |
| **Context Viewer** | Debug de contexto | Valores de contexto | Modificar contexto |
| **Render Profiler** | Debug de rendimiento | Métricas de renderizado | Perfilar renderizados |


## 💡 Conceptos Relacionados

**El Sistema de Debug es "observabilidad" para todos los demás conceptos:**

- **[01. Factories](./01-factories.md):** Debug muestra cómo las factories procesan schemas
- **[04. Schema Resolution](./04-schema-resolution.md):** Debug rastrea pasos de resolución  
- **[05. Renderer](./05-renderer.md):** Debug muestra qué renderer fue elegido
- **[06. Middleware](./06-middleware.md):** Debug muestra middleware aplicado
- **[03. Provider](./03-provider.md):** Debug configurado vía Provider
- **[02. Schema Language](./02-schema-language.md):** Debug valida sintaxis de schema

