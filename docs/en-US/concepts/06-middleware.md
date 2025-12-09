# Props Transformation

**System that intercepts and modifies props before rendering** — the "intelligent filter" between schema and component.

![Middleware](/images/06-middleware.png)

---

**Middleware Pipeline allows modifying component behavior without changing code:**

### 🔧 What It Does:

| **Input** | **Middleware** | **Transformation** | **Output** |
| --------- | -------------- | ------------------ | ---------- |
| Raw props from schema | `withValidation` | Adds validation rules | Props with validation |
| Raw values | `withFormatting` | Formats CPF, phone, etc. | Formatted values |
| Basic props | `withConditional` | Applies visibility rules | Conditional props |
| Component props | `withCustomLogic` | Specific business logic | Final props |

### 📊 Pipeline Flow:

**Sequential Execution:**
```text
Raw Props → Middleware 1 → Middleware 2 → Middleware N → Final Props → Component
```

**Practical Example:**
```typescript
// Input
{ name: "cpf", value: "12345678901", required: true }

// Middleware Pipeline
→ withFormatting: formats CPF
→ withValidation: adds validation
→ withCustomLogic: adds business rules

// Output  
{ name: "cpf", value: "123.456.789-01", required: true, pattern: /\d{3}\.\d{3}\.\d{3}-\d{2}/, onValidate: validateCPF }
```

> **💡 Result:** Basic props → Enriched props. Functionality without duplicated code!

---

## 🚀 Middleware Types

**Each middleware has a specific responsibility:**

### 🛡️ Validation Middleware:

| **Function** | **Input** | **Transformation** | **Result** |
| ---------- | ----------- | ----------------- | ------------- |
| **Required Fields** | `required: true` | Adds validator | Required field |
| **Pattern Validation** | `pattern: "email"` | Regex validation | Valid email |
| **Custom Rules** | `x-rules: { minLength: 8 }` | Business validation | Specific rules |
| **Cross-Field** | Multiple field refs | Field dependency | Validation between fields |

### 🎨 Formatting Middleware:

| **Function** | **Input** | **Transformation** | **Result** |
| ---------- | ----------- | ----------------- | ------------- |
| **CPF/CNPJ** | `type: "cpf"` | Mask formatting | `123.456.789-01` |
| **Phone** | `type: "phone"` | Phone formatting | `(11) 99999-9999` |
| **Currency** | `type: "currency"` | Money formatting | `$1,234.56` |
| **Date** | `type: "date"` | Date formatting | `mm/dd/yyyy` |

### 🎯 Conditional Middleware:

| **Function** | **Input** | **Transformation** | **Result** |
| ---------- | ----------- | ----------------- | ------------- |
| **Visibility** | `visible: "\{\{ expression \}\}"` | Show/hide logic | Component visible/hidden |
| **Disabled State** | `disabled: "\{\{ condition \}\}"` | Enable/disable | Component enabled/disabled |
| **Dynamic Props** | `props: "\{\{ context \}\}"` | Context-based props | Dynamic props |
| **Role-based** | `roles: ["admin"]` | Permission check | Component by permission |

### 🔧 Custom Business Middleware:

| **Function** | **Input** | **Transformation** | **Result** |
| ---------- | ----------- | ----------------- | ------------- |
| **Audit Logging** | Any component | Add logging | Automatic auditing |
| **Analytics** | User interactions | Add tracking | Usage metrics |
| **Caching** | Expensive operations | Add memoization | Improved performance |
| **Error Boundary** | Component errors | Add error handling | Increased resilience |

---

## ⚙️ Pipeline Architecture

**How the middleware system works internally:**

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

**Common middleware implementation patterns:**

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

## 💡 Related Concepts

**Middleware Pipeline is the "props processor" used by other concepts:**

- **[01. Factories](./01-factories.md):** Factories execute pipeline for each component
- **[04. Schema Resolution](./04-schema-resolution.md):** Resolution applies pipeline during processing  
- **[05. Renderer](./05-renderer.md):** Renderers have type-specific pipeline
- **[02. Schema Language](./02-schema-language.md):** Schema properties transformed by middleware
- **[03. Provider](./03-provider.md):** Provider registers global middleware
- **[07. Debug System](./07-debug-system.md):** Debug shows applied middleware
