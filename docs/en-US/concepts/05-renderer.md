# The Rendering Engine

**System that controls how each component type is rendered** — the "bridge" between React/Vue components and presentation logic.

<img src="/images/05-renderer.svg" alt="Renderer" />

**Renderer System decides which wrapper to use for each component type:**

### What Renderers Are:

| **Renderer Type** | **Function** | **Used For** | **Example** |
| ----------------- | ---------- | -------------- | ----------- |
| **field** | Renders form fields | InputText, Select, etc. | Binds to form adapter, passes props |
| **button** | Renders buttons | SubmitButton | Button behavior |
| **container** | Renders form containers | FormGroup, Section | Organizes layout |
| **content** | Renders static content | Titles, labels | Simple display |
| **menu-item** | Renders menu items | MenuLink, MenuButton | Navigation (when MenuFactory is used) |
| **menu-container** | Renders menu containers | MenuContainer | Menu hierarchy |
| **addon** | Renders addons | Add-on UI | Supplementary content |

### How They Work:

**Component → Renderer → DOM**
```text
InputText Component → FieldRenderer → <input> + form binding + props
```

**Renderer Adds:**
- **Form adapter binding** (e.g. value, onChange from Schepta form context)
- **Context injection** (form values, external context)
- Type-specific **props transformation**

> **Result:** Components focus on UI, Renderers focus on presentation logic!


## Renderer Types

### Field Renderer - Form Fields:

| **Responsibility** | **Implementation** | **Benefit** |
| -------------------- | ----------------- | ------------- |
| **Form integration** | Form adapter (e.g. useScheptaFormAdapter in React) | Value and onChange bound to form state |
| **Props** | Receives name, component, componentProps | Consistent field rendering |
| **Custom renderers** | Override via `renderers.field` | Use with React Hook Form, Formik, etc. |

### Container Renderer - Layout and Organization:

| **Responsibility** | **Implementation** | **Benefit** |
| -------------------- | ----------------- | ------------- |
| **Child ordering** | `x-ui.order` sorting | Automatic layout |
| **Props filtering** | Remove container props | Clean props |
| **Section management** | Group related items | Visual organization |

### Content and Button Renderers:

- **content:** Static content (titles, text). Minimal processing.
- **button:** Button components (e.g. SubmitButton). Type `button` in component spec.


## How the System Works

### Resolution Pipeline:

```
Schema JSON
    ↓
Detect Type (component spec type: field, container, button, content, ...)
    ↓
Choose Renderer (Default → ScheptaProvider renderers → Factory renderers)
    ↓
Prepare Props (Merge + context)
    ↓
Apply Middleware (e.g. template expressions)
    ↓
Render (Renderer wraps component)
    ↓
Final React/Vue Element
```

### Resolution Hierarchy:

**How the system chooses which renderer to use:**

| **Priority** | **Source** | **When to Use** | **Example** |
| -------------- | --------- | --------------- | ----------- |
| **1st - Default** | Factory built-in | Default behavior | DefaultFieldRenderer for type `field` |
| **2nd - Global** | ScheptaProvider | Application default | `<ScheptaProvider renderers={{ field: AppFieldRenderer }} />` |
| **3rd - Local** | Factory props | Per-factory override | `<FormFactory renderers={{ field: CustomField }} />` |

There is no separate "registerRenderer" API; renderers come from factory defaults, then Provider `renderers`, then factory `renderers` prop.


## Why Renderers Exist

**Separation of concerns:**
- **Components** define the UI (input, button, container).
- **Renderers** wrap them with form binding, layout, or other behavior. The default field renderer uses the Schepta form adapter so fields work without a specific form library; you can replace it with a custom renderer that uses React Hook Form or Formik.


## Related Concepts

**Renderers are the "engine" that connects other concepts:**

- **[01. Factories](./01-factories.md):** Factories use renderers to process each component
- **[04. Schema Resolution](./04-schema-resolution.md):** Resolution pipeline detects which renderer to use  
- **[06. Middleware](./06-middleware.md):** Pipeline runs before/during render
- **[03. Provider](./03-provider.md):** Configures renderers globally via `renderers` prop
- **[07. Debug System](./07-debug-system.md):** Debug can show which renderer was chosen
