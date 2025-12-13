# The Rendering Engine

**System that controls how each component type is rendered** — the "bridge" between React/Vue components and presentation logic.

<img src="/images/05-renderer.svg" alt="Renderer" />


**Renderer System decides which wrapper to use for each component type:**

### 🔧 What Renderers Are:

| **Renderer Type** | **Function** | **Used For** | **Example** |
| ----------------- | ---------- | -------------- | ----------- |
| **field** | Renders form fields | InputText, Select, etc. | Adds automatic validation |
| **container** | Renders form containers | FormGroup, Section | Organizes layout |
| **menu-item** | Renders menu items | MenuLink, MenuButton | Adds navigation |
| **menu-container** | Renders menu containers | MenuContainer | Organizes hierarchy |
| **content** | Renders static content | Text, Image | Simple display |

### 📊 How They Work:

**Component → Renderer → DOM**
```text
InputText Component → FieldRenderer → <input> + validation + props
```

**Renderer Adds:**
- Automatic **middleware pipeline**  
- **Context injection** (form, menu)
- Type-specific **props transformation**
- Integrated **error boundaries**

> **💡 Result:** Components focus on UI, Renderers focus on presentation logic!


## 🚀 Renderer Types

**Each renderer type has specific responsibilities:**

### 📝 Field Renderer - Form Fields:

| **Responsibility** | **Implementation** | **Benefit** |
| -------------------- | ----------------- | ------------- |
| **Form Integration** | Automatic useFormContext() | Form props injected |
| **Validation Pipeline** | withCpfValidation, withRules | Automatic validation |
| **Dynamic Props** | useReactions() | Props change based on state |
| **Debug Integration** | useDebug() | Automatic visual debug |

### 🏗️ Container Renderer - Layout and Organization:

| **Responsibility** | **Implementation** | **Benefit** |
| -------------------- | ----------------- | ------------- |
| **Child Ordering** | `x-ui.order` sorting | Automatic layout |
| **Props Filtering** | Remove container props | Clean props |
| **Layout Logic** | Responsive layout | Adaptive UI |
| **Section Management** | Group related items | Visual organization |

### 🧭 Menu Renderers - Navigation:

| **Renderer** | **Function** | **Features** |
| ------------ | ---------- | ------------ |
| **menu-item** | Individual menu items | Link handling, active states |
| **menu-container** | Menu organization | Hierarchy, ordering, responsive |

### 📄 Content Renderer - Display:

| **Function** | **Usage** | **Characteristics** |
| ---------- | ------- | ------------------- |
| **Static Content** | Text, images, etc. | No form integration |
| **Minimal Processing** | Direct rendering | Optimized performance |


## ⚙️ How the System Works

**Conceptual flow of how renderers process components:**

### 🔄 Resolution Pipeline:

```
Schema JSON
    ↓
Detect Type (Which renderer to use?)
    ↓
Fetch Renderer (In priority hierarchy)
    ↓
Prepare Props (Merge + context)
    ↓
Apply Middleware (Transform + validate)
    ↓
Render (Component + wrapper)
    ↓
Final React/Vue Element
```

### 🎯 Resolution Hierarchy:

**How the system chooses which renderer to use:**

| **Priority** | **Source** | **When to Use** | **Example** |
| -------------- | --------- | --------------- | ----------- |
| **1st - Local** | Factory props | Specific customization | `<FormFactory renderers=\{\{field: CustomField\}\} />` |
| **2nd - Global** | scheptaProvider | Application default | `<scheptaProvider renderers=\{\{field: AppField\}\} />` |
| **3rd - Registry** | registerRenderer() | Global extensions | `registerRenderer('field', LibField)` |
| **4th - Default** | Built-in system | Default behavior | Internal FieldRenderer |

### ⚡ Central Orchestrator:

**The "maestro" that coordinates the entire process:**

**Responsibilities:**
- **Detects** which component type to render
- **Chooses** the appropriate renderer from the hierarchy  
- **Prepares** props by merging contexts
- **Applies** type-specific middleware pipeline
- **Renders** the final component with its wrapper


## 🤝 Why Renderers Exist

**The problems that the renderer system solves:**

### 🎯 Separation of Concerns:

**Without renderers**, each component needs to:
- Mix UI logic with business logic
- Manually and inconsistently manage context  
- Implement type-specific validation in each field
- Transform props in an ad-hoc and non-standardized way

**With renderers**, components become:
- **Cleaner:** exclusive focus on visual presentation
- **More consistent:** automatic and standardized context injection
- **More reusable:** validation and logic encapsulated in the renderer
- **More predictable:** props transformation follows established patterns

### 🔄 System Flexibility:

**The same component can have different behaviors:**
- **Form Field:** FieldRenderer adds validation + form integration
- **Read-only Display:** ContentRenderer maintains simple display, without form logic  
- **Menu Item:** ItemRenderer adds navigation + active state
- **Custom App:** CustomRenderer implements application-specific behavior

**This enables:** multi-tenant apps, A/B testing, integration with different UI libraries, and custom extensions without modifying base components.


## 💡 Related Concepts

**Renderers are the "engine" that connects other concepts:**

- **[01. Factories](./01-factories.md):** Factories use renderers to process each component
- **[04. Schema Resolution](./04-schema-resolution.md):** Resolution pipeline detects which renderer to use  
- **[06. Middleware](./06-middleware.md):** Each renderer has a specific pipeline
- **[03. Provider](./03-provider.md):** Configures renderers globally
- **[07. Debug System](./07-debug-system.md):** Debug tools show which renderer was chosen
