# From JSON to Components

**System that interprets JSON schemas and transforms them into React/Vue elements** — the "translator" between backend and frontend.

<img src="/images/04-schema-resolution.svg" alt="Schema Resolution" />

**Schema Resolution is the process that transforms JSON configurations into functional interfaces:**

### What It Does:

| **Input** | **Process** | **Output** | **Result** |
| --------- | ------------ | ---------- | ------------- |
| JSON Schema | Resolution + Validation | React/Vue Element Tree | Rendered interface |
| Component specs | Lookup (defaults + Provider + local) | Component instances | Working components |
| Props and context | Middleware pipeline | Enhanced props | Correct behavior |

### Resolution Flow:

**Automatic Steps:**
1. **Schema Parsing:** JSON → Internal structure
2. **Component Lookup:** `x-component` (and optional `x-custom`) → Component from merged registry
3. **Props Resolution:** Schema properties → Component props
4. **Context Injection:** Form adapter, external context → available to components
5. **Middleware Application:** Props transformation (e.g. template expressions)
6. **Element Creation:** React.createElement() / Vue h() calls

**Visual Example:**
```json
{ "name": "email", "x-component": "InputText", "required": true }
```
↓ **Resolution Process**
```jsx
<InputText name="email" required={true} onChange={...} />
```

> **Result:** Declarative schema → Imperative component.


## Resolution Types

### Form Schema Resolution:

| **Schema Property** | **Resolution Strategy** | **React/Vue Result** | **Example** |
| ------------------- | ----------------------- | ---------------- | ----------- |
| `name` | Field identification | `name` prop | `<input name="email" />` |
| `x-component` | Component lookup from merged registry | Component type | `<InputText />` |
| `required` | Validation rule | `required` prop + validation | `required={true}` |
| `x-component-props` | Props passthrough (after template processing) | Direct props | `placeholder="Enter email"` |
| `x-rules` | Validation configuration | Validation props | `pattern="email"` |

### Component Schema Resolution:

| **Schema Property** | **Resolution Strategy** | **React/Vue Result** | **Example** |
| ------------------- | ----------------------- | ---------------- | ----------- |
| `x-component` | Component type lookup | Component class | `<Button />` |
| `x-ui` | Layout/styling props | Passed to component | Layout props |
| `x-component-props` | Component-specific props (template expressions resolved) | Props object | `{ variant: "primary" }` |


## Resolution Engine

**How the system resolves schemas internally:**

### Resolution Pipeline:

```
Raw JSON Schema
    ↓
Validate Schema (Valid structure?)
    ↓
Resolve Component (Lookup: customComponents for x-custom, else merged components)
    ↓
Map Props (Schema → Component props)
    ↓
Inject Context (formValues, externalContext)
    ↓
Apply Middleware (e.g. template expressions)
    ↓
Create Element (React.createElement / Vue h())
    ↓
Final React/Vue Element
```

### Resolution Priorities:

**Component Resolution:**
- When a schema node has `x-custom: true`, the resolver looks up the node key in **customComponents** (Provider / factory).
- Otherwise, the component name (`x-component` or node key) is looked up in the **merged components** registry. Merge order: **Default (factory) → Global (ScheptaProvider) → Local (factory props)**. Later overrides earlier.

**Props Resolution Order:**
1. **Schema-defined props** (`x-component-props`, etc.), with template expressions resolved
2. **Derived props** (from schema structure, e.g. field name)
3. **Context** (form adapter, externalContext) available to components
4. **Default props** (component defaults)

**Middleware Resolution Order:**
- Template expression middleware runs first (so `{{ $formValues.x }}` and `{{ $externalContext.x }}` are resolved).
- Then **Provider `middlewares`** and **factory `middlewares`** run in array order.


## Expression Resolution

**Template expressions in props are resolved using form values and external context:**

| **Expression Type**   | **Resolution** | **Example** | **Result** |
| --------------------- | --------------- | ----------- | ---------- |
| **Static values**     | Direct          | `"required": true` | `required={true}` |
| **Form values**       | `$formValues`   | `"{{ $formValues.email }}"` | Current form field value |
| **External context**  | `$externalContext` | `"{{ $externalContext.user.name }}"` | Value from Provider externalContext |
| **JEXL expressions**  | Evaluated       | `"{{ $formValues.age >= 18 }}"` | boolean |


## Related Concepts

**Schema Resolution is the "processor" that connects schemas with React/Vue:**

- **[01. Factories](./01-factories.md):** Factories use resolution to process schemas
- **[02. Schema Language](./02-schema-language.md):** Syntax interpreted by resolution  
- **[05. Renderer](./05-renderer.md):** Renderers chosen by resolution
- **[06. Middleware](./06-middleware.md):** Pipeline executed during resolution
- **[03. Provider](./03-provider.md):** Context and configuration used in resolution
- **[07. Debug System](./07-debug-system.md):** Debug shows resolution steps
