# How Schemas Become Components

**System that transforms JSON into functional components** — schema in, interface out.

<img src="/images/01-factories.svg" alt="Factories" />

**Factory Pattern is the heart of schepta:**

### What It Is:

| **Input**      | **Factory**        | **Output**       | **Result**          | **Status** |
| -------------- | ------------------ | ---------------- | ---------------------- | ------------ |
| Form JSON      | `FormFactory`      | React/Vue Form   | Working interface  | Ready
| Menu JSON      | `MenuFactory`      | React/Vue Navigation | Complete navigation     | In development

### How It Works:

**Automatic Process:**
1. **JSON Schema** defines structure and behavior (using `properties` and `x-component` per node)
2. **Factory** interprets schema and resolves components from the registry (defaults + Provider + local props)
3. **Middleware Pipeline** transforms props (e.g. template expressions)
4. **React/Vue Component** renders final interface

**Quick Example:**
```json
{
  "type": "object",
  "x-component": "FormContainer",
  "properties": {
    "email": {
      "type": "string",
      "x-component": "InputText",
      "x-component-props": { "placeholder": "Email" }
    }
  }
}
```
↓ **FormFactory processes**
```jsx
<form>
  <input name="email" placeholder="Email" />
</form>
```

> **Result:** Structured JSON → Functional React/Vue interface. Zero manual configuration!

## Factory Types

**Each Factory is specialized in a type of interface:**

### FormFactory - Dynamic Forms:

| **Schema Property** | **Function** | **Example** | **Result** |
| ------------------- | ---------- | ----------- | ------------- |
| `properties` | Defines form structure (JSON Schema) | `{ "email": { ... } }` | Nested nodes with components |
| `x-component` | Component to render | `"InputText"` | Text input |
| `x-component-props` | Props for the component | `{ "placeholder": "Email" }` | Passed to component |

### MenuFactory - Dynamic Navigation:

| **Schema Property** | **Function** | **Example** | **Result** |
| ------------------- | ---------- | ----------- | ------------- |
| `properties` | Defines menu items | `{ "home": {...} }` | Navigation item |
| `x-component-props.href` | Navigation link | `"/dashboard"` | Working link |
| `properties.submenu` | Hierarchical submenu | Nested properties | Dropdown menu |

## Factory Architecture

**How the Factory Pattern works internally:**

### Processing Pipeline:

```
JSON Schema
    ↓
Validate Schema (Correct structure?)
    ↓
Resolve Components (x-component → component from defaults / Provider / local)
    ↓
Transform Props (Middleware + context)
    ↓
Orchestrate Render (Final component tree)
    ↓
React/Vue Elements
```

### How Factories Specialize:

**Each Factory has specific logic for its domain:**
- **FormFactory:** Injects form adapter context, applies validations, manages state
- **MenuFactory:** Manages navigation, active states, menu hierarchy

**Extension points:** Provider `components` and `customComponents`, Factory props for local overrides, Middleware Pipeline (e.g. `middlewares` array), `externalContext` for shared state.

## Practical Use Cases

**Factory Pattern solves real development problems:**

### Solved Scenarios:

| **Situation** | **Traditional Problem** | **With Factory Pattern** | **Benefit** |
| ------------ | ----------------------- | ----------------------- | ------------- |
| **Repetitive Forms** | Copy-paste JSX | Reusable schema | DRY principle |
| **Complex Validations** | Duplicated code | Rules in schema | Centralization |
| **Dynamic Menus** | Hardcoded conditionals | Expressions in props | Flexibility |
| **Multi-tenant UI** | Branches per client | Schema per tenant | Scalability |
| **A/B Testing** | Complex feature flags | Different schemas | Agility |

## Essential Links

| **To Understand** | **Read** | **Relation to Factories** |
| ----------------- | -------- | ------------------------- |
| **How to write schemas** | [02. Schema Language](./02-schema-language.md) | Syntax that factories interpret |
| **Internal pipeline** | [04. Schema Resolution](./04-schema-resolution.md) | How factories process schemas |
| **Rendering engine** | [05. Renderer](./05-renderer.md) | System used by factories |
| **Props transformations** | [06. Middleware](./06-middleware.md) | Pipeline applied by factories |
| **Global configuration** | [03. Provider](./03-provider.md) | How to configure factories |
