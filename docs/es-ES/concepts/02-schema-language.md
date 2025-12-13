# Schema Language

**Sintaxis y propiedades que schepta entiende** — el "vocabulario" para definir interfaces dinámicas.

<img src="/images/02-schema-language.svg" alt="Schema Language" />


**Schema Language define cómo escribir JSON que schepta puede interpretar:**

### 🔧 Propiedades Esenciales:

| **Propiedad** | **Función** | **Valor** | **Resultado** |
| ------------ | ---------- | --------- | ------------- |
| `x-component` | Define qué componente usar | `"InputText"` | Componente React/Vue específico |
| `x-component-props` | Props para el componente | `{ placeholder: "Email" }` | Props pasadas directamente |
| `x-ui` | Layout y visual | `{ order: 1 }` | Ordenamiento y posicionamiento |
| `x-rules` | Validación y reglas | `{ required: true }` | Validación automática |
| `name` | Identificador único | `"email"` | Campo identificado |

### 📊 Sintaxis Básica:

**Campo de Formulario:**
```json
{
  "name": "email",
  "x-component": "InputText",
  "x-component-props": {
    "placeholder": "Ingresa tu email"
  },
  "x-rules": {
    "required": true,
    "pattern": "email"
  }
}
```

**Elemento de Menú:**
```json
{
  "type": "object",
  "x-component": "MenuLink",
  "x-component-props": {
    "label": "Dashboard",
    "href": "/dashboard",
    "icon": "dashboard"
  },
  "active": "\{\{ $segment.role === 'admin' \}\}"
}
```

> **💡 Resultado:** JSON estructurado → Componente React/Vue funcional. ¡Sintaxis simple y poderosa!


## 🚀 Propiedades Principales

**Propiedades fundamentales que todo schema debe conocer:**

### 🎯 Definición de Componente:

| **Propiedad** | **Requerida** | **Tipo** | **Descripción** | **Ejemplo** |
| ------------ | ------------ | -------- | --------------- | ----------- |
| `x-component` | ✅ Sí | string | Nombre del componente | `"InputText"`, `"MenuLink"` |
| `x-component-props` | ❌ No | object | Props del componente | `{ variant: "outlined" }` |
| `type` | ❌ Contexto | string | Tipo de schema | `"string"`, `"object"` |
| `name` | ❌ Formularios | string | Identificador de campo | `"email"`, `"password"` |

### 🎨 Visual y Layout:

| **Propiedad** | **Requerida** | **Tipo** | **Descripción** | **Ejemplo** |
| ------------ | ------------ | -------- | --------------- | ----------- |
| `x-ui` | ❌ No | object | Configuración de UI | `{ order: 1, grid: { xs: 12 } }` |
| `title` | ❌ No | string | Etiqueta de visualización | `"Dirección de Email"` |
| `description` | ❌ No | string | Texto de ayuda | `"Ingresa tu email de trabajo"` |
| `placeholder` | ❌ No | string | Placeholder de entrada | `"usuario@empresa.com"` |

### ⚡ Comportamiento y Lógica:

| **Propiedad** | **Requerida** | **Tipo** | **Descripción** | **Ejemplo** |
| ------------ | ------------ | -------- | --------------- | ----------- |
| `x-rules` | ❌ No | object | Reglas de validación | `{ required: true, minLength: 8 }` |
| `x-reactions` | ❌ No | object | Comportamiento dinámico | `{ visible: "\{\{ $form.type === 'admin' \}\}" }` |
| `active` | ❌ Menús | boolean/string | Estado activo | `true` o `"\{\{ $segment.role === 'admin' \}\}"` |
| `visible` | ❌ No | boolean/string | Control de visibilidad | `"\{\{ $form.plan !== 'basic' \}\}"` |


## 📊 Tipos de Schema

**Diferentes tipos de schema para diferentes casos de uso:**

### 📝 Schemas de Formulario:

**Estructura de Schema de Campo:**
```json
{
  "name": "fieldName",
  "x-component": "ComponentName",
  "x-component-props": {
    "prop1": "value1",
    "prop2": "value2"
  },
  "x-rules": {
    "required": true,
    "pattern": "regex",
    "minLength": 5
  },
  "x-ui": {
    "order": 1,
    "grid": { "xs": 12, "md": 6 }
  }
}
```

**Schema de Contenedor de Formulario:**
```json
{
  "type": "object",
  "x-component": "form-container",
  "properties": {
    "fieldKey1": { /* field schema */ },
    "fieldKey2": { /* field schema */ }
  }
}
```


## ⚙️ Propiedades Avanzadas

**Propiedades avanzadas para casos específicos:**

### 🔧 Extensiones de Componente:

| **Propiedad** | **Propósito** | **Uso** | **Ejemplo** |
| ------------ | ----------- | --------- | ----------- |
| `x-decorator` | Componente wrapper | Decoración de campo | `"FormItem"` |
| `x-decorator-props` | Props del decorador | Configuración del decorador | `{ label: "Etiqueta del Campo" }` |
| `x-content` | Contenido estático | Contenido de texto/HTML | `"Enviar Formulario"` |
| `x-data` | Datos estáticos | Datos prellenados | `{ options: ["A", "B"] }` |

### 🎯 Lógica Condicional:

| **Propiedad** | **Tipo** | **Propósito** | **Ejemplo** |
| ------------ | -------- | ----------- | ----------- |
| `x-visible` | boolean/string | Mostrar/ocultar componente | `"\{\{ $form.type === 'premium' \}\}"` |
| `x-disabled` | boolean/string | Habilitar/deshabilitar | `"\{\{ $form.readonly \}\}"` |
| `x-pattern` | object | Patrones de visualización | `{ loading: "\{\{ $form.isLoading \}\}" }` |
| `x-validator` | string/function | Validación personalizada | `"validateCPF"` |

### 📱 Responsive y Layout:

| **Propiedad** | **Configuración** | **Propósito** | **Ejemplo** |
| ------------ | ----------------- | ----------- | ----------- |
| `x-ui.grid` | Sistema de grid | Layout responsivo | `{ xs: 12, md: 6, lg: 4 }` |
| `x-ui.order` | number | Orden de visualización | `1`, `2`, `3` |
| `x-ui.span` | number | Span de columna | `2` (abarca 2 columnas) |
| `x-ui.offset` | number | Offset de columna | `1` (offset de 1 columna) |


## 🔍 Expression Language

**Sintaxis para expresiones dinámicas dentro de schemas:**

### 📊 Tipos de Expresión:

| **Tipo de Expresión** | **Sintaxis** | **Contexto** | **Ejemplo** |
| ------------------- | ---------- | ----------- | ----------- |
| **Estado del Formulario** | `\{\{ $form.fieldName \}\}` | Valores del formulario | `"\{\{ $form.email \}\}"` |
| **Contexto de Segmento** | `\{\{ $segment.property \}\}` | Contexto de usuario | `"\{\{ $segment.role \}\}"` |
| **Objetivo de Asociación** | `\{\{ $target.property \}\}` | Configuraciones vinculadas | `"\{\{ $target.locale.title \}\}"` |
| **Contexto Externo** | `\{\{ $context.property \}\}` | Datos externos | `"\{\{ $context.user.name \}\}"` |

### ⚡ Operadores Disponibles:

| **Operador** | **Uso** | **Ejemplo** | **Resultado** |
| ------------ | --------- | ----------- | ---------- |
| `===`, `!==` | Igualdad | `"\{\{ $segment.role === 'admin' \}\}"` | boolean |
| `&&`, `\|\|` | Lógico | `"\{\{ $form.type === 'user' && $segment.plan === 'premium' \}\}"` | boolean |
| `>`, `<`, `>=`, `<=` | Comparación | `"\{\{ $form.age >= 18 \}\}"` | boolean |
| `contains()` | Contiene array/string | `"\{\{ contains($segment.roles, 'admin') \}\}"` | boolean |
| `startsWith()` | String comienza con | `"\{\{ startsWith($form.email, 'admin') \}\}"` | boolean |


## 💡 Conceptos Relacionados

**Schema Language es la "sintaxis" que conecta todos los conceptos:**

- **[01. Factories](./01-factories.md):** Las factories interpretan Schema Language
- **[04. Schema Resolution](./04-schema-resolution.md):** Pipeline que procesa la sintaxis  
- **[05. Renderer](./05-renderer.md):** Los renderers ejecutan propiedades del schema
- **[06. Middleware](./06-middleware.md):** Pipeline transforma propiedades del schema
- **[03. Provider](./03-provider.md):** Configura componentes y contextos usados en schemas
- **[07. Debug System](./07-debug-system.md):** Debug muestra cómo se interpretan los schemas

