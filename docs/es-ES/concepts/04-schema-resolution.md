# De JSON a Componentes

**Sistema que interpreta schemas JSON y los transforma en elementos React/Vue** — el "traductor" entre backend y frontend.

<img src="/images/04-schema-resolution.svg" alt="Schema Resolution" />


**Schema Resolution es el proceso que transforma configuraciones JSON en interfaces funcionales:**

### 🔧 Qué Hace:

| **Entrada** | **Proceso** | **Salida** | **Resultado** |
| --------- | ------------ | ---------- | ------------- |
| JSON Schema del backend | Resolución + Validación | Árbol de Elementos React/Vue | Interfaz renderizada |
| Especificaciones de componente | Búsqueda en registro | Instancias de componentes | Componentes funcionales |
| Props y contexto | Pipeline de middleware | Props mejoradas | Comportamiento correcto |

### 📊 Flujo de Resolución:

**Pasos Automáticos:**
1. **Schema Parsing:** JSON → Estructura interna
2. **Component Lookup:** `x-component` → Componente React/Vue
3. **Props Resolution:** Propiedades del schema → Props del componente  
4. **Context Injection:** Contexto Form/Menu → Contexto del componente
5. **Middleware Application:** Pipeline de transformación de props
6. **Element Creation:** Llamadas React.createElement() / Vue h()

**Ejemplo Visual:**
```json
{ "name": "email", "x-component": "InputText", "required": true }
```
↓ **Proceso de Resolución**
```jsx
<InputText name="email" required={true} onChange={...} />
```

> **💡 Resultado:** Schema declarativo → Componente imperativo.


## 🚀 Tipos de Resolución

**Diferentes tipos de schema requieren diferentes estrategias de resolución:**

### 📝 Resolución de Schema de Formulario:

| **Propiedad del Schema** | **Estrategia de Resolución** | **Resultado React/Vue** | **Ejemplo** |
| ------------------- | ----------------------- | ---------------- | ----------- |
| `name` | Identificación de campo | Prop `name` | `<input name="email" />` |
| `x-component` | Búsqueda en registro de componentes | Tipo de componente | `<InputText />` |
| `required` | Regla de validación | Prop `required` + validación | `required={true}` |
| `x-component-props` | Passthrough de props | Props directas | `placeholder="Ingresa email"` |
| `x-rules` | Configuración de validación | Props de validación | `pattern="email"` |

### 🧭 Resolución de Schema de Menú:

| **Propiedad del Schema** | **Estrategia de Resolución** | **Resultado React/Vue** | **Ejemplo** |
| ------------------- | ----------------------- | ---------------- | ----------- |
| `label` | Contenido de texto | Prop `children` | `<MenuItem>Dashboard</MenuItem>` |
| `url` | Objetivo de navegación | `href` o `onClick` | `<Link to="/dashboard" />` |
| `icon` | Componente de icono | Elemento de icono | `<DashboardIcon />` |
| `visible` | Renderizado condicional | Wrapper condicional | `{visible && <MenuItem />}` |
| `children` | Elementos de menú anidados | Resolución recursiva | `<Submenu items={...} />` |

### 🎨 Resolución de Schema de Componente:

| **Propiedad del Schema** | **Estrategia de Resolución** | **Resultado React/Vue** | **Ejemplo** |
| ------------------- | ----------------------- | ---------------- | ----------- |
| `x-component` | Búsqueda de tipo de componente | Clase de componente | `<Button />` |
| `x-ui` | Props de layout/estilo | Props CSS/estilo | `className="col-md-6"` |
| `x-component-props` | Props específicas del componente | Objeto de props | `{ variant: "primary" }` |
| `x-reactions` | Manejadores de eventos | Props de eventos | `onClick={handleClick}` |


## ⚙️ Motor de Resolución

**Cómo el sistema resuelve schemas internamente:**

### 🔄 Pipeline de Resolución:

```
Raw JSON Schema
    ↓
Validar Schema (¿JSON válido?)
    ↓
Resolver Componente (Búsqueda en registro)
    ↓
Mapear Props (Schema → Props del componente)
    ↓
Inyectar Contexto (Contexto Form/Menu/Global)
    ↓
Aplicar Middleware (Pipeline de transformaciones)
    ↓
Crear Elemento (React.createElement / Vue h())
    ↓
Elemento React/Vue Final
```

### 🎯 Prioridades de Resolución:

**Orden de Resolución de Componentes:**
1. **Componentes locales** (props de factory)
2. **Componentes globales** (scheptaProvider)
3. **Overrides de registro** (llamadas registerComponent)
4. **Componentes predeterminados** (registro integrado)

**Orden de Resolución de Props:**
1. **Props definidas en schema** (`x-component-props`)
2. **Props derivadas** (de estructura del schema)
3. **Props de contexto** (contexto de formulario, etc.)
4. **Props predeterminadas** (predeterminados del componente)

**Orden de Resolución de Middleware:**
1. **Middleware integrado** (validación, formateo)
2. **Middleware global** (scheptaProvider)
3. **Middleware local** (props de factory)
4. **Middleware de componente** (específico del componente)


## 📊 Estrategias de Resolución

**Diferentes estrategias para diferentes tipos de contenido:**

### 🎯 Resolución de Expresiones:

| **Tipo de Expresión**         | **Estrategia de Resolución** | **Ejemplo**                         | **Resultado**        |
| --------------------------- | ----------------------- | ----------------------------------- | ----------------- |
| **Valores Estáticos**           | Asignación directa       | `"required": true`                  | `required={true}` |
| **Expresiones de Segmento**     | Sustitución de contexto    | `"\{\{ $segment.tenant \}\}"`           | `"banco 1"`        |
| **Expresiones de Asociación** | Búsqueda de asociación      | `"\{\{ $target.title \}\}"`             | `"Título del Portal"`  |
| **Expresiones JEXL**        | Evaluación de expresión   | `"\{\{ $segment.role === 'admin' \}\}"` | `true`            |

### 🔧 Resolución Condicional:

**Resolución de Visibilidad:**
```typescript
const visible = evaluateExpression(schema.visible, context);
if (!visible) return null; // El componente no se renderiza
```

**Resolución de Props Dinámicas:**
```typescript
const dynamicProps = schema['x-component-props'];
const resolvedProps = resolveDynamicValues(dynamicProps, context);
```

**Resolución de Validación:**
- **Reglas → Props:** `x-rules` transformado en propiedades de validación
- **Inyección de Contexto:** Contexto de formulario inyectado automáticamente para validación
- **Manejo de Errores:** Fallbacks para reglas inválidas o mal formadas


## 💡 Conceptos Relacionados

**Schema Resolution es el "procesador" que conecta schemas con React/Vue:**

- **[01. Factories](./01-factories.md):** Las factories usan resolución para procesar schemas
- **[02. Schema Language](./02-schema-language.md):** Sintaxis interpretada por resolución  
- **[05. Renderer](./05-renderer.md):** Renderers elegidos por resolución
- **[06. Middleware](./06-middleware.md):** Pipeline ejecutado durante resolución
- **[03. Provider](./03-provider.md):** Contexto y configuración usados en resolución
- **[07. Debug System](./07-debug-system.md):** Debug muestra pasos de resolución

