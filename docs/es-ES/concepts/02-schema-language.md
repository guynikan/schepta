# Schema Language

**Sintaxis y propiedades que schepta entiende** — el "vocabulario" para definir interfaces dinámicas.

<img src="/images/02-schema-language.svg" alt="Schema Language" />

**Schema Language define cómo escribir JSON que schepta puede interpretar:**

### Propiedades Esenciales:

| **Propiedad** | **Función** | **Valor** | **Resultado** |
| ------------ | ---------- | --------- | ------------- |
| `x-component` | Define qué componente usar | `"InputText"` | Componente React/Vue específico |
| `x-component-props` | Props del componente | `{ placeholder: "Email" }` | Props pasadas directamente |
| `x-ui` | Layout y visual | `{ order: 1 }` | Orden y posicionamiento |
| `x-rules` | Validación y reglas | `{ required: true }` | Validación automática |
| `name` | Identificador único | `"email"` | Campo identificado |

### Sintaxis Básica:

**Campo de formulario:**
```json
{
  "name": "email",
  "x-component": "InputText",
  "x-component-props": {
    "placeholder": "Introduce tu email"
  },
  "x-rules": {
    "required": true,
    "pattern": "email"
  }
}
```

**Ítem de menú:**
```json
{
  "type": "object",
  "x-component": "MenuLink",
  "x-component-props": {
    "label": "Dashboard",
    "href": "/dashboard",
    "icon": "dashboard"
  }
}
```

> **Resultado:** JSON estructurado → Componente React/Vue funcionando. ¡Sintaxis simple y potente!


## Propiedades Principales

**Propiedades fundamentales que todo schema debe conocer:**

### Definición de Componente:

| **Propiedad** | **Requerido** | **Tipo** | **Descripción** | **Ejemplo** |
| ------------ | ------------ | -------- | --------------- | ----------- |
| `x-component` | Sí | string | Nombre del componente | `"InputText"`, `"MenuLink"` |
| `x-component-props` | No | object | Props del componente | `{ variant: "outlined" }` |
| `type` | Contexto | string | Tipo del schema | `"string"`, `"object"` |
| `name` | No (formularios) | string | Identificador del campo | `"email"`, `"password"` |

### Visual y Layout:

| **Propiedad** | **Requerido** | **Tipo** | **Descripción** | **Ejemplo** |
| ------------ | ------------ | -------- | --------------- | ----------- |
| `x-ui` | No | object | Configuración de UI | `{ order: 1, grid: { xs: 12 } }` |
| `title` | No | string | Etiqueta de visualización | `"Email"` |
| `description` | No | string | Texto de ayuda | `"Introduce tu email"` |
| `placeholder` | No | string | Placeholder del input | `"user@company.com"` |

### Comportamiento y Lógica:

| **Propiedad** | **Requerido** | **Tipo** | **Descripción** | **Ejemplo** |
| ------------ | ------------ | -------- | --------------- | ----------- |
| `x-content` | No | string | Contenido estático (ej. etiqueta de botón) | `"Enviar Formulario"` |

**Valores dinámicos:** Usa expresiones de template en `x-component-props` (u otras props) con `{{ $formValues.fieldName }}` y `{{ $externalContext.property }}`. El middleware de template los reemplaza en tiempo de ejecución. Ver Expression Language abajo.


## Tipos de Schema

**Diferentes tipos de schema para diferentes casos de uso:**

### Schemas de Formulario:

**Estructura del schema de campo:**
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

**Schema del contenedor del formulario:**
```json
{
  "type": "object",
  "x-component": "FormContainer",
  "properties": {
    "fieldKey1": { /* field schema */ },
    "fieldKey2": { /* field schema */ }
  }
}
```


## Responsivo y Layout

| **Propiedad** | **Configuración** | **Propósito** | **Ejemplo** |
| ------------ | ----------------- | ----------- | ----------- |
| `x-ui.grid` | Sistema de grid | Layout responsivo | `{ xs: 12, md: 6, lg: 4 }` |
| `x-ui.order` | number | Orden de visualización | `1`, `2`, `3` |
| `x-ui.span` | number | Columnas que ocupa | `2` (ocupa 2 columnas) |
| `x-ui.offset` | number | Offset de columna | `1` (desplaza 1 columna) |


## Expression Language

**Sintaxis para expresiones dinámicas en los schemas. Las expresiones son procesadas por el middleware de template y soportan `$formValues` y `$externalContext`.**

### Tipos de Expresión:

| **Tipo de Expresión** | **Sintaxis** | **Contexto** | **Ejemplo** |
| ------------------- | ---------- | ----------- | ----------- |
| **Valores del formulario** | `{{ $formValues.fieldName }}` | Estado actual del formulario | `"{{ $formValues.email }}"` |
| **Contexto externo** | `{{ $externalContext.property }}` | `externalContext` del Provider | `"{{ $externalContext.user.name }}"` |

### Operadores Disponibles:

| **Operador** | **Uso** | **Ejemplo** | **Resultado** |
| ------------ | --------- | ----------- | ---------- |
| `===`, `!==` | Igualdad | `"{{ $externalContext.role === 'admin' }}"` | boolean |
| `&&`, `\|\|` | Lógico | `"{{ $formValues.type === 'user' && $externalContext.plan === 'premium' }}"` | boolean |
| `>`, `<`, `>=`, `<=` | Comparación | `"{{ $formValues.age >= 18 }}"` | boolean |

Las expresiones pueden usarse dentro de strings en props (ej. en `x-component-props`) y se evalúan con los valores actuales del formulario y del contexto externo.


## Conceptos Relacionados

**Schema Language es la "sintaxis" que conecta todos los conceptos:**

- **[01. Factories](./01-factories.md):** Las factories interpretan Schema Language
- **[04. Schema Resolution](./04-schema-resolution.md):** Pipeline que procesa la sintaxis  
- **[05. Renderer](./05-renderer.md):** Los renderers ejecutan propiedades del schema
- **[06. Middleware](./06-middleware.md):** Pipeline transforma propiedades del schema (incluyendo expresiones de template)
- **[03. Provider](./03-provider.md):** Configura componentes y contextos usados en los schemas
- **[07. Debug System](./07-debug-system.md):** Debug muestra cómo se interpretan los schemas
