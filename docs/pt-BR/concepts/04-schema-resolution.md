# De JSON para Componentes

**Sistema que interpreta schemas JSON e os transforma em elementos React/Vue** — o "tradutor" entre backend e frontend.

<ThemeImage src="/images/04-schema-resolution.png" alt="Schema Resolution" />

---

**Schema Resolution é o processo que transforma configurações JSON em interfaces funcionais:**

### 🔧 O Que Faz:

| **Input** | **Processo** | **Output** | **Resultado** |
| --------- | ------------ | ---------- | ------------- |
| Schema JSON do backend | Resolution + Validation | React/Vue Element Tree | Interface renderizada |
| Component specs | Registry lookup | Component instances | Componentes funcionando |
| Props e context | Middleware pipeline | Enhanced props | Comportamento correto |

### 📊 Fluxo de Resolução:

**Etapas Automáticas:**
1. **Schema Parsing:** JSON → Estrutura interna
2. **Component Lookup:** `x-component` → React/Vue Component
3. **Props Resolution:** Schema properties → Component props  
4. **Context Injection:** Form/Menu context → Component context
5. **Middleware Application:** Props transformation pipeline
6. **Element Creation:** React.createElement() / Vue h() calls

**Exemplo Visual:**
```json
{ "name": "email", "x-component": "InputText", "required": true }
```
↓ **Resolution Process**
```jsx
<InputText name="email" required={true} onChange={...} />
```

> **💡 Resultado:** Schema declarativo → Componente imperativo.

---

## 🚀 Tipos de Resolução

**Diferentes tipos de schema requerem diferentes estratégias de resolução:**

### 📝 Form Schema Resolution:

| **Schema Property** | **Resolution Strategy** | **React/Vue Result** | **Exemplo** |
| ------------------- | ----------------------- | ---------------- | ----------- |
| `name` | Field identification | `name` prop | `<input name="email" />` |
| `x-component` | Component registry lookup | Component type | `<InputText />` |
| `required` | Validation rule | `required` prop + validation | `required={true}` |
| `x-component-props` | Props passthrough | Direct props | `placeholder="Digite email"` |
| `x-rules` | Validation configuration | Validation props | `pattern="email"` |

### 🧭 Menu Schema Resolution:

| **Schema Property** | **Resolution Strategy** | **React/Vue Result** | **Exemplo** |
| ------------------- | ----------------------- | ---------------- | ----------- |
| `label` | Text content | `children` prop | `<MenuItem>Dashboard</MenuItem>` |
| `url` | Navigation target | `href` or `onClick` | `<Link to="/dashboard" />` |
| `icon` | Icon component | Icon element | `<DashboardIcon />` |
| `visible` | Conditional rendering | Conditional wrapper | `{visible && <MenuItem />}` |
| `children` | Nested menu items | Recursive resolution | `<Submenu items={...} />` |

### 🎨 Component Schema Resolution:

| **Schema Property** | **Resolution Strategy** | **React/Vue Result** | **Exemplo** |
| ------------------- | ----------------------- | ---------------- | ----------- |
| `x-component` | Component type lookup | Component class | `<Button />` |
| `x-ui` | Layout/styling props | CSS/styling props | `className="col-md-6"` |
| `x-component-props` | Component-specific props | Props object | `{ variant: "primary" }` |
| `x-reactions` | Event handlers | Event props | `onClick={handleClick}` |

---

## ⚙️ Resolution Engine

**Como o sistema resolve schemas internamente:**

### 🔄 Resolution Pipeline:

```
Raw JSON Schema
    ↓
Validar Schema (JSON válido?)
    ↓
Resolver Component (Registry lookup)
    ↓
Mapear Props (Schema → Component props)
    ↓
Injetar Context (Form/Menu/Global context)
    ↓
Aplicar Middleware (Transformations pipeline)
    ↓
Criar Element (React.createElement / Vue h())
    ↓
React/Vue Element Final
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

**Diferentes estratégias para diferentes tipos de conteúdo:**

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
if (!visible) return null; // Component não renderiza
```

**Dynamic Props Resolution:**
```typescript
const dynamicProps = schema['x-component-props'];
const resolvedProps = resolveDynamicValues(dynamicProps, context);
```

**Validation Resolution:**
- **Rules → Props:** `x-rules` transformadas em propriedades de validação
- **Context Injection:** Form context injetado automaticamente para validação
- **Error Handling:** Fallbacks para rules inválidas ou malformadas

---

## 💡 Conceitos Relacionados

**Schema Resolution é o "processador" que conecta schemas com React/Vue:**

- **[01. Factories](./01-factories.md):** Factories usam resolution para processar schemas
- **[02. Schema Language](./02-schema-language.md):** Sintaxe interpretada pela resolution  
- **[05. Renderer](./05-renderer.md):** Renderers escolhidos pela resolution
- **[06. Middleware](./06-middleware.md):** Pipeline executada durante resolution
- **[03. Provider](./03-provider.md):** Context e configuração usados na resolution
- **[07. Debug System](./07-debug-system.md):** Debug mostra etapas da resolution

