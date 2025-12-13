# How Schemas Become Components

**System that transforms JSON into functional components** — schema in, interface out.

<img src="/images/01-factories.svg" alt="Factories" />

**Factory Pattern is the heart of schepta:**

### 🔧 What It Is:

| **Input**      | **Factory**        | **Output**       | **Result**          |
| -------------- | ------------------ | ---------------- | ---------------------- |
| Form JSON      | `FormFactory`      | React/Vue Form   | Working interface  |
| Menu JSON      | `MenuFactory`      | React/Vue Navigation | Complete navigation     |
| Component JSON | `ComponentFactory` | React/Vue Component  | Rendered component |

### 📊 How It Works:

**Automatic Process:**
1. **JSON Schema** defines structure and behavior
2. **Factory** interprets schema and resolves components
3. **Component Registry** provides React/Vue components to be rendered
4. **Middleware Pipeline** transforms props
5. **React/Vue Component** renders final interface

**Quick Example:**
```json
{ "fields": [{ "name": "email", "x-component": "InputEmail" }] }
```
↓ **FormFactory processes**
```jsx
<input type="email" name="email" />
```

> **💡 Result:** Structured JSON → Functional React/Vue interface. Zero manual configuration!

## 🚀 Factory Types

**Each Factory is specialized in a type of interface:**

### 📝 FormFactory - Dynamic Forms:

| **Schema Property** | **Function** | **Example** | **Result** |
| ------------------- | ---------- | ----------- | ------------- |
| `fields[]` | Defines form fields | `[{ name: "email" }]` | Email field |
| `x-component` | Input type | `"InputText"` | Text input |
| `required` | Required validation | `true` | Required field |
| `x-rules` | Custom validations | `{ minLength: 8 }` | Length validation |

### 🧭 MenuFactory - Dynamic Navigation:

| **Schema Property** | **Function** | **Example** | **Result** |
| ------------------- | ---------- | ----------- | ------------- |
| `properties{}` | Defines menu items | `{ "home": {...} }` | Navigation item |
| `x-component-props.href` | Navigation link | `"/dashboard"` | Working link |
| `active` | Visibility control | `"\{\{ $segment.role === 'admin' \}\}"` | Permission-based menu |
| `properties.submenu` | Hierarchical submenu | Nested properties | Dropdown menu |

### 🎛️ ComponentFactory - Generic Components:

| **Schema Property** | **Function** | **Example** | **Result** |
| ------------------- | ---------- | ----------- | ------------- |
| `x-component` | Component type | `"Button"` | React/Vue button |
| `x-component-props` | Specific props | `{ variant: "primary" }` | Styled button |
| `x-ui` | Layout and positioning | `{ grid: { xs: 12 } }` | Responsive grid |

## ⚙️ Factory Architecture

**How the Factory Pattern works internally:**

### 🔄 Processing Pipeline:

```
JSON Schema
    ↓
Validate Schema (Correct structure?)
    ↓
Resolve Components (x-component → React/Vue component)
    ↓
Transform Props (Middleware + context)
    ↓
Orchestrate Render (Final component tree)
    ↓
React/Vue Elements
```

### 🎯 How Factories Specialize:

**Each Factory has specific logic for its domain:**
- **FormFactory:** Injects FormContext, applies validations, manages state
- **MenuFactory:** Manages navigation, active states, menu hierarchy
- **ComponentFactory:** Generic rendering, simple props, no specific context

**Extension points:** Component Registry (global/local), Middleware Pipeline (custom transformations), Context Providers (domain-specific state).

## 📊 Practical Use Cases

**Factory Pattern solves real development problems:**

### 🎯 Solved Scenarios:

| **Situation** | **Traditional Problem** | **With Factory Pattern** | **Benefit** |
| ------------ | ----------------------- | ----------------------- | ------------- |
| **Repetitive Forms** | Copy-paste JSX | Reusable schema | DRY principle |
| **Complex Validations** | Duplicated code | Rules in schema | Centralization |
| **Dynamic Menus** | Hardcoded conditionals | `visible` expressions | Flexibility |
| **Multi-tenant UI** | Branches per client | Schema per tenant | Scalability |
| **A/B Testing** | Complex feature flags | Different schemas | Agility |

## 🔗 Essential Links

| **To Understand** | **Read** | **Relation to Factories** |
| ----------------- | -------- | ------------------------- |
| **How to write schemas** | [02. Schema Language](./02-schema-language.md) | Syntax that factories interpret |
| **Internal pipeline** | [04. Schema Resolution](./04-schema-resolution.md) | How factories process schemas |
| **Rendering engine** | [05. Renderer](./05-renderer.md) | System used by factories |
| **Props transformations** | [06. Middleware](./06-middleware.md) | Pipeline applied by factories |
| **Global configuration** | [03. Provider](./03-provider.md) | How to configure factories |

