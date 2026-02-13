# Schema Language

**Syntax and properties that schepta understands** — the "vocabulary" for defining dynamic interfaces.

<img src="/images/02-schema-language.svg" alt="Schema Language" />

**Schema Language defines how to write JSON that schepta can interpret:**

### Essential Properties:

| **Property** | **Function** | **Value** | **Result** |
| ------------ | ---------- | --------- | ------------- |
| `x-component` | Defines which component to use | `"InputText"` | Specific React/Vue component |
| `x-component-props` | Props for the component | `{ placeholder: "Email" }` | Props passed directly |
| `x-ui` | Layout and visual | `{ order: 1 }` | Ordering and positioning |
| `x-rules` | Validation and rules | `{ required: true }` | Automatic validation |
| `name` | Unique identifier | `"email"` | Identified field |

### Basic Syntax:

**Form Field:**
```json
{
  "name": "email",
  "x-component": "InputText",
  "x-component-props": {
    "placeholder": "Enter your email"
  },
  "x-rules": {
    "required": true,
    "pattern": "email"
  }
}
```

**Menu Item:**
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

> **Result:** Structured JSON → Working React/Vue component. Simple and powerful syntax!


## Core Properties

**Fundamental properties that every schema should know:**

### Component Definition:

| **Property** | **Required** | **Type** | **Description** | **Example** |
| ------------ | ------------ | -------- | --------------- | ----------- |
| `x-component` | Yes | string | Component name | `"InputText"`, `"MenuLink"` |
| `x-component-props` | No | object | Component props | `{ variant: "outlined" }` |
| `type` | Context | string | Schema type | `"string"`, `"object"` |
| `name` | No (forms) | string | Field identifier | `"email"`, `"password"` |

### Visual & Layout:

| **Property** | **Required** | **Type** | **Description** | **Example** |
| ------------ | ------------ | -------- | --------------- | ----------- |
| `x-ui` | No | object | UI configuration | `{ order: 1, grid: { xs: 12 } }` |
| `title` | No | string | Display label | `"Email Address"` |
| `description` | No | string | Help text | `"Enter your work email"` |
| `placeholder` | No | string | Input placeholder | `"user@company.com"` |

### Behavior & Logic:

| **Property** | **Required** | **Type** | **Description** | **Example** |
| ------------ | ------------ | -------- | --------------- | ----------- |
| `x-content` | No | string | Static content (e.g. button label) | `"Submit Form"` |

**Dynamic values:** Use template expressions in `x-component-props` (or other props) with `{{ $formValues.fieldName }}` and `{{ $externalContext.property }}`. The template middleware replaces these at runtime. See Expression Language below.


## Schema Types

**Different schema types for different use cases:**

### Form Schemas:

**Field Schema Structure:**
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

**Form Container Schema:**
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


## Responsive & Layout

| **Property** | **Configuration** | **Purpose** | **Example** |
| ------------ | ----------------- | ----------- | ----------- |
| `x-ui.grid` | Grid system | Responsive layout | `{ xs: 12, md: 6, lg: 4 }` |
| `x-ui.order` | number | Display order | `1`, `2`, `3` |
| `x-ui.span` | number | Column span | `2` (spans 2 columns) |
| `x-ui.offset` | number | Column offset | `1` (offset by 1 column) |


## Expression Language

**Syntax for dynamic expressions within schemas. Expressions are processed by the template middleware and support `$formValues` and `$externalContext`.**

### Expression Types:

| **Expression Type** | **Syntax** | **Context** | **Example** |
| ------------------- | ---------- | ----------- | ----------- |
| **Form values** | `{{ $formValues.fieldName }}` | Current form state | `"{{ $formValues.email }}"` |
| **External context** | `{{ $externalContext.property }}` | Provider `externalContext` | `"{{ $externalContext.user.name }}"` |

### Operators Available:

| **Operator** | **Usage** | **Example** | **Result** |
| ------------ | --------- | ----------- | ---------- |
| `===`, `!==` | Equality | `"{{ $externalContext.role === 'admin' }}"` | boolean |
| `&&`, `\|\|` | Logical | `"{{ $formValues.type === 'user' && $externalContext.plan === 'premium' }}"` | boolean |
| `>`, `<`, `>=`, `<=` | Comparison | `"{{ $formValues.age >= 18 }}"` | boolean |

Expressions can be used inside strings in props (e.g. in `x-component-props`) and are evaluated with the current form values and external context.


## Related Concepts

**Schema Language is the "syntax" that connects all concepts:**

- **[01. Factories](./01-factories.md):** Factories interpret Schema Language
- **[04. Schema Resolution](./04-schema-resolution.md):** Pipeline that processes the syntax  
- **[05. Renderer](./05-renderer.md):** Renderers execute schema properties
- **[06. Middleware](./06-middleware.md):** Pipeline transforms schema properties (including template expressions)
- **[03. Provider](./03-provider.md):** Configures components and contexts used in schemas
- **[07. Debug System](./07-debug-system.md):** Debug shows how schemas are interpreted
