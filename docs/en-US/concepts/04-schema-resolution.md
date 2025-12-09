# From JSON to Components

**System that interprets JSON schemas and transforms them into React/Vue elements** — the "translator" between backend and frontend.

![Schema Resolution](/images/04-schema-resolution.png)

---

**Schema Resolution is the process that transforms JSON configurations into functional interfaces:**

### 🔧 What It Does:

| **Input** | **Process** | **Output** | **Result** |
| --------- | ------------ | ---------- | ------------- |
| JSON Schema from backend | Resolution + Validation | React/Vue Element Tree | Rendered interface |
| Component specs | Registry lookup | Component instances | Working components |
| Props and context | Middleware pipeline | Enhanced props | Correct behavior |

### 📊 Resolution Flow:

**Automatic Steps:**
1. **Schema Parsing:** JSON → Internal structure
2. **Component Lookup:** `x-component` → React/Vue Component
3. **Props Resolution:** Schema properties → Component props  
4. **Context Injection:** Form/Menu context → Component context
5. **Middleware Application:** Props transformation pipeline
6. **Element Creation:** React.createElement() / Vue h() calls

**Visual Example:**
```json
{ "name": "email", "x-component": "InputText", "required": true }
```
↓ **Resolution Process**
```jsx
<InputText name="email" required={true} onChange={...} />
```

> **💡 Result:** Declarative schema → Imperative component.

---

## 🚀 Resolution Types

**Different schema types require different resolution strategies:**

### 📝 Form Schema Resolution:

| **Schema Property** | **Resolution Strategy** | **React/Vue Result** | **Example** |
| ------------------- | ----------------------- | ---------------- | ----------- |
| `name` | Field identification | `name` prop | `<input name="email" />` |
| `x-component` | Component registry lookup | Component type | `<InputText />` |
| `required` | Validation rule | `required` prop + validation | `required={true}` |
| `x-component-props` | Props passthrough | Direct props | `placeholder="Enter email"` |
| `x-rules` | Validation configuration | Validation props | `pattern="email"` |

### 🧭 Menu Schema Resolution:

| **Schema Property** | **Resolution Strategy** | **React/Vue Result** | **Example** |
| ------------------- | ----------------------- | ---------------- | ----------- |
| `label` | Text content | `children` prop | `<MenuItem>Dashboard</MenuItem>` |
| `url` | Navigation target | `href` or `onClick` | `<Link to="/dashboard" />` |
| `icon` | Icon component | Icon element | `<DashboardIcon />` |
| `visible` | Conditional rendering | Conditional wrapper | `{visible && <MenuItem />}` |
| `children` | Nested menu items | Recursive resolution | `<Submenu items={...} />` |

### 🎨 Component Schema Resolution:

| **Schema Property** | **Resolution Strategy** | **React/Vue Result** | **Example** |
| ------------------- | ----------------------- | ---------------- | ----------- |
| `x-component` | Component type lookup | Component class | `<Button />` |
| `x-ui` | Layout/styling props | CSS/styling props | `className="col-md-6"` |
| `x-component-props` | Component-specific props | Props object | `{ variant: "primary" }` |
| `x-reactions` | Event handlers | Event props | `onClick={handleClick}` |

---

## ⚙️ Resolution Engine

**How the system resolves schemas internally:**

### 🔄 Resolution Pipeline:

```
Raw JSON Schema
    ↓
Validate Schema (Valid JSON?)
    ↓
Resolve Component (Registry lookup)
    ↓
Map Props (Schema → Component props)
    ↓
Inject Context (Form/Menu/Global context)
    ↓
Apply Middleware (Transformations pipeline)
    ↓
Create Element (React.createElement / Vue h())
    ↓
Final React/Vue Element
```

### 🎯 Resolution Priorities:

**Component Resolution Order:**
1. **Local components** (factory props)
2. **Global components** (scheptaProvider)
3. **Registry overrides** (registerComponent calls)
4. **Default components** (built-in registry)

**Props Resolution Order:**
1. **Schema-defined props** (`x-component-props`)
2. **Derived props** (from schema structure)
3. **Context props** (form context, etc.)
4. **Default props** (component defaults)

**Middleware Resolution Order:**
1. **Built-in middleware** (validation, formatting)
2. **Global middleware** (scheptaProvider)
3. **Local middleware** (factory props)
4. **Component middleware** (component-specific)

---

## 📊 Resolution Strategies

**Different strategies for different content types:**

### 🎯 Expression Resolution:

| **Expression Type**         | **Resolution Strategy** | **Example**                         | **Result**        |
| --------------------------- | ----------------------- | ----------------------------------- | ----------------- |
| **Static Values**           | Direct assignment       | `"required": true`                  | `required={true}` |
| **Segment Expressions**     | Context substitution    | `"\{\{ $segment.tenant \}\}"`           | `"bank 1"`        |
| **Association Expressions** | Association lookup      | `"\{\{ $target.title \}\}"`             | `"Portal Title"`  |
| **JEXL Expressions**        | Expression evaluation   | `"\{\{ $segment.role === 'admin' \}\}"` | `true`            |

### 🔧 Conditional Resolution:

**Visibility Resolution:**
```typescript
const visible = evaluateExpression(schema.visible, context);
if (!visible) return null; // Component doesn't render
```

**Dynamic Props Resolution:**
```typescript
const dynamicProps = schema['x-component-props'];
const resolvedProps = resolveDynamicValues(dynamicProps, context);
```

**Validation Resolution:**
- **Rules → Props:** `x-rules` transformed into validation properties
- **Context Injection:** Form context automatically injected for validation
- **Error Handling:** Fallbacks for invalid or malformed rules

---

## 💡 Related Concepts

**Schema Resolution is the "processor" that connects schemas with React/Vue:**

- **[01. Factories](./01-factories.md):** Factories use resolution to process schemas
- **[02. Schema Language](./02-schema-language.md):** Syntax interpreted by resolution  
- **[05. Renderer](./05-renderer.md):** Renderers chosen by resolution
- **[06. Middleware](./06-middleware.md):** Pipeline executed during resolution
- **[03. Provider](./03-provider.md):** Context and configuration used in resolution
- **[07. Debug System](./07-debug-system.md):** Debug shows resolution steps
