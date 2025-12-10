# Como Schemas Viram Componentes

**Sistema que transforma JSON em componentes funcionais** — schema entra, interface sai.

<ThemeImage src="/images/01-factories.png" alt="Factories" />

---

**Factory Pattern é o coração do schepta:**

### 🔧 O Que É:

| **Input**      | **Factory**        | **Output**       | **Resultado**          |
| -------------- | ------------------ | ---------------- | ---------------------- |
| Form JSON      | `FormFactory`      | React/Vue Form   | Interface funcionando  |
| Menu JSON      | `MenuFactory`      | React/Vue Navigation | Navegação completa     |
| Component JSON | `ComponentFactory` | React/Vue Component  | Componente renderizado |

### 📊 Como Funciona:

**Processo Automático:**
1. **Schema JSON** define estrutura e comportamento
2. **Factory** interpreta schema e resolve componentes
3. **Component Registry** fornece componentes React/Vue a serem renderizados
4. **Middleware Pipeline** transforma props
5. **React/Vue Component** renderiza interface final

**Exemplo Rápido:**
```json
{ "fields": [{ "name": "email", "x-component": "InputEmail" }] }
```
↓ **FormFactory processa**
```jsx
<input type="email" name="email" />
```

> **💡 Resultado:** JSON estruturado → Interface React/Vue funcional. Zero configuração manual!

---

## 🚀 Tipos de Factory

**Cada Factory é especializado em um tipo de interface:**

### 📝 FormFactory - Formulários Dinâmicos:

| **Schema Property** | **Função** | **Exemplo** | **Resultado** |
| ------------------- | ---------- | ----------- | ------------- |
| `fields[]` | Define campos do form | `[{ name: "email" }]` | Campo de email |
| `x-component` | Tipo de input | `"InputText"` | Text input |
| `required` | Validação obrigatória | `true` | Campo required |
| `x-rules` | Validações customizadas | `{ minLength: 8 }` | Validação de tamanho |

### 🧭 MenuFactory - Navegação Dinâmica:

| **Schema Property** | **Função** | **Exemplo** | **Resultado** |
| ------------------- | ---------- | ----------- | ------------- |
| `properties{}` | Define itens do menu | `{ "home": {...} }` | Item de navegação |
| `x-component-props.href` | Link de navegação | `"/dashboard"` | Link funcionando |
| `active` | Controle de visibilidade | `"\{\{ $segment.role === 'admin' \}\}"` | Menu por permissão |
| `properties.submenu` | Submenu hierárquico | Nested properties | Dropdown menu |

### 🎛️ ComponentFactory - Componentes Genéricos:

| **Schema Property** | **Função** | **Exemplo** | **Resultado** |
| ------------------- | ---------- | ----------- | ------------- |
| `x-component` | Tipo do component | `"Button"` | Botão React/Vue |
| `x-component-props` | Props específicas | `{ variant: "primary" }` | Botão estilizado |
| `x-ui` | Layout e positioning | `{ grid: { xs: 12 } }` | Grid responsivo |

---

## ⚙️ Arquitetura do Factory

**Como o Factory Pattern funciona internamente:**

### 🔄 Pipeline de Processamento:

```
Schema JSON
    ↓
Validar Schema (Estrutura correta?)
    ↓
Resolver Components (x-component → React/Vue component)
    ↓
Transformar Props (Middleware + context)
    ↓
Orquestrar Render (Component tree final)
    ↓
React/Vue Elements
```

### 🎯 Como Factories Se Especializam:

**Cada Factory tem lógica específica para seu domínio:**
- **FormFactory:** Injeta FormContext, aplica validações, gerencia state
- **MenuFactory:** Gerencia navegação, active states, hierarquia de menus
- **ComponentFactory:** Renderização genérica, props simples, sem context específico

**Pontos de extensibilidade:** Component Registry (global/local), Middleware Pipeline (custom transformations), Context Providers (domain-specific state).

---

## 📊 Casos de Uso Práticos

**Factory Pattern resolve problemas reais de desenvolvimento:**

### 🎯 Cenários Resolvidos:

| **Situação** | **Problema Tradicional** | **Com Factory Pattern** | **Benefício** |
| ------------ | ----------------------- | ----------------------- | ------------- |
| **Forms Repetitivos** | Copy-paste de JSX | Schema reutilizável | DRY principle |
| **Validações Complexas** | Código duplicado | Rules no schema | Centralização |
| **Menus Dinâmicos** | Condicionais hardcoded | `visible` expressions | Flexibilidade |
| **Multi-tenant UI** | Branches por cliente | Schema por tenant | Escalabilidade |
| **A/B Testing** | Feature flags complexos | Schemas diferentes | Agilidade |

---

## 🔗 Links Essenciais

| **Para Entender** | **Leia** | **Relação com Factories** |
| ----------------- | -------- | ------------------------- |
| **Como escrever schemas** | [02. Schema Language](./02-schema-language.md) | Sintaxe que factories interpretam |
| **Pipeline interno** | [04. Schema Resolution](./04-schema-resolution.md) | Como factories processam schemas |
| **Motor de renderização** | [05. Renderer](./05-renderer.md) | Sistema usado pelos factories |
| **Transformações de props** | [06. Middleware](./06-middleware.md) | Pipeline aplicada pelos factories |
| **Configuração global** | [03. Provider](./03-provider.md) | Como configurar factories |

