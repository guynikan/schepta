# Transformação de Props

**Sistema que intercepta e modifica props antes da renderização** — o "filtro inteligente" entre schema e component.

<ThemeImage src="/images/06-middleware.png" alt="Middleware" />

---

**Middleware Pipeline permite modificar comportamento dos componentes sem alterar o código:**

### 🔧 O Que Faz:

| **Input** | **Middleware** | **Transformation** | **Output** |
| --------- | -------------- | ------------------ | ---------- |
| Raw props do schema | `withValidation` | Adiciona rules de validação | Props com validation |
| Valores brutos | `withFormatting` | Formata CPF, phone, etc. | Valores formatados |
| Props básicos | `withConditional` | Aplica regras de visibilidade | Props condicionais |
| Component props | `withCustomLogic` | Business logic específica | Props finais |

### 📊 Pipeline Flow:

**Execução Sequencial:**
```text
Raw Props → Middleware 1 → Middleware 2 → Middleware N → Final Props → Component
```

**Exemplo Prático:**
```typescript
// Input
{ name: "cpf", value: "12345678901", required: true }

// Middleware Pipeline
→ withFormatting: formata CPF
→ withValidation: adiciona validação
→ withCustomLogic: adiciona business rules

// Output  
{ name: "cpf", value: "123.456.789-01", required: true, pattern: /\d{3}\.\d{3}\.\d{3}-\d{2}/, onValidate: validateCPF }
```

> **💡 Resultado:** Props básicos → Props enriquecidos. Funcionalidade sem código duplicado!

---

## 🚀 Tipos de Middleware

**Cada middleware tem uma responsabilidade específica:**

### 🛡️ Validation Middleware:

| **Função** | **Entrada** | **Transformação** | **Resultado** |
| ---------- | ----------- | ----------------- | ------------- |
| **Required Fields** | `required: true` | Adiciona validator | Campo obrigatório |
| **Pattern Validation** | `pattern: "email"` | Regex validation | Email válido |
| **Custom Rules** | `x-rules: { minLength: 8 }` | Business validation | Regras específicas |
| **Cross-Field** | Multiple field refs | Field dependency | Validação entre campos |

### 🎨 Formatting Middleware:

| **Função** | **Entrada** | **Transformação** | **Resultado** |
| ---------- | ----------- | ----------------- | ------------- |
| **CPF/CNPJ** | `type: "cpf"` | Mask formatting | `123.456.789-01` |
| **Phone** | `type: "phone"` | Phone formatting | `(11) 99999-9999` |
| **Currency** | `type: "currency"` | Money formatting | `R$ 1.234,56` |
| **Date** | `type: "date"` | Date formatting | `dd/mm/yyyy` |

### 🎯 Conditional Middleware:

| **Função** | **Entrada** | **Transformação** | **Resultado** |
| ---------- | ----------- | ----------------- | ------------- |
| **Visibility** | `visible: "\{\{ expression \}\}"` | Show/hide logic | Component visível/oculto |
| **Disabled State** | `disabled: "\{\{ condition \}\}"` | Enable/disable | Component habilitado/desabilitado |
| **Dynamic Props** | `props: "\{\{ context \}\}"` | Context-based props | Props dinâmicos |
| **Role-based** | `roles: ["admin"]` | Permission check | Component por permissão |

### 🔧 Custom Business Middleware:

| **Função** | **Entrada** | **Transformação** | **Resultado** |
| ---------- | ----------- | ----------------- | ------------- |
| **Audit Logging** | Any component | Add logging | Auditoria automática |
| **Analytics** | User interactions | Add tracking | Métricas de uso |
| **Caching** | Expensive operations | Add memoization | Performance melhorada |
| **Error Boundary** | Component errors | Add error handling | Resilência aumentada |

---

## ⚙️ Arquitetura do Pipeline

**Como o sistema de middleware funciona internamente:**

### 📋 Execution Flow:

| **Stage** | **Input** | **Process** | **Output** | **Error Strategy** |
| --------- | --------- | ----------- | ---------- | ------------------ |
| **1. Middleware Registration** | Middleware list | Sort by priority | Ordered pipeline | Skip invalid middleware |
| **2. Props Preparation** | Raw schema props | Normalize props | Standard props | Use defaults |
| **3. Pipeline Execution** | Props + middleware | Sequential transformation | Enhanced props | Skip failing middleware |
| **4. Props Validation** | Final props | Validate prop types | Valid props | Filter invalid props |
| **5. Component Injection** | Component + props | Props injection | Ready component | Error boundary |

### 🎯 Middleware Interface:

**Standard Middleware Signature:**
```typescript
type Middleware = (
  props: ComponentProps,
  schema: SchemaNode,
  context: RenderContext
) => ComponentProps | Promise<ComponentProps>;
```

**Middleware Registration:**
```typescript
const middleware = {
  // Built-in middleware (always executed)
  withValidation: validationMiddleware,
  withFormatting: formattingMiddleware,
  
  // Custom middleware (priority-based)
  withBusinessLogic: customBusinessMiddleware,
  withAnalytics: analyticsMiddleware
};
```

**Priority System:**
```typescript
const middlewareOrder = [
  'withFormatting',    // Priority: 1 (execute first)
  'withValidation',    // Priority: 2
  'withConditional',   // Priority: 3
  'withBusinessLogic', // Priority: 4
  'withAnalytics'      // Priority: 5 (execute last)
];
```

---

## 📊 Middleware Patterns

**Padrões comuns de implementação de middleware:**

### 🔧 Transformation Patterns:

| **Pattern** | **Purpose** | **Implementation** | **Example** |
| ----------- | ----------- | ------------------ | ----------- |
| **Enhancer** | Add functionality | `props => ({ ...props, newFeature })` | Add validation |
| **Filter** | Remove/modify props | `props => omit(props, 'sensitiveData')` | Security filtering |
| **Mapper** | Transform values | `props => ({ ...props, value: transform(props.value) })` | Format values |
| **Conditional** | Apply conditionally | `(props, schema, context) => condition ? enhance(props) : props` | Role-based features |

### 🎯 Composition Patterns:

**Higher-Order Middleware:**
```typescript
const withLogging = (middleware) => (props, schema, context) => {
  console.log('Before:', props);
  const result = middleware(props, schema, context);
  console.log('After:', result);
  return result;
};
```

**Async Middleware Chain:**
```typescript
const asyncPipeline = async (props, middleware) => {
  return middleware.reduce(async (propsPromise, middleware) => {
    const currentProps = await propsPromise;
    return middleware(currentProps, schema, context);
  }, Promise.resolve(props));
};
```

**Conditional Middleware:**
```typescript
const conditionalMiddleware = (condition, middleware) => 
  (props, schema, context) => 
    condition(props, schema, context) ? middleware(props, schema, context) : props;
```

---

## 💡 Conceitos Relacionados

**Middleware Pipeline é o "processador de props" usado por outros conceitos:**

- **[01. Factories](./01-factories.md):** Factories executam pipeline para cada component
- **[04. Schema Resolution](./04-schema-resolution.md):** Resolution aplica pipeline durante processamento  
- **[05. Renderer](./05-renderer.md):** Renderers têm pipeline específica por tipo
- **[02. Schema Language](./02-schema-language.md):** Propriedades dos schemas transformadas por middleware
- **[03. Provider](./03-provider.md):** Provider registra middleware globais
- **[07. Debug System](./07-debug-system.md):** Debug mostra middleware aplicados

