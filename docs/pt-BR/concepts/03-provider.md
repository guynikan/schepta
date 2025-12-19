# Contexto Global

**Sistema que gerencia configurações e estado compartilhado** — o "centro de comando" que coordena todo o schepta.

<img src="/images/03-provider.svg" alt="Provider" />


**Provider Pattern centraliza configurações que todos os componentes precisam compartilhar:**

### 🔧 O Que Faz:

| **Configuração** | **Escopo** | **Benefício** | **Exemplo** |
| ---------------- | ---------- | ------------- | ----------- |
| **Component Registry** | Global | Componentes padronizados | MUI como padrão |
| **Middleware Stack** | Global | Comportamento consistente | Validação uniforme |
| **Context Providers** | Global | Estado compartilhado | User, permissions, locale |

### 📊 Hierarquia de Configuração:

**Provider Hierarchy:**
```text
scheptaProvider (App Level)
    ├── Component Registry Global
    ├── Middleware Global  
    └── Context Providers
        └── FormFactory/MenuFactory (Local)
            ├── Local Component Overrides
            └── Local Middleware Overrides
```

**Exemplo Rápido:**
```jsx
<scheptaProvider
  components={{ InputText: MUITextField, Button: MUIButton }}
  middleware={{ withValidation, withAnalytics }}
>
  <App />
</scheptaProvider>
```

> **💡 Resultado:** Configuração uma vez → Disponível em toda aplicação. 


## 🚀 Tipos de Provider

**Cada provider gerencia um aspecto específico do sistema:**

### 🎨 scheptaProvider - Master Provider:

| **Configuration** | **Purpose** | **Default** | **Override Level** |
| ----------------- | ----------- | ----------- | ------------------ |
| `components` | Global component registry | Built-in components | Local factory props |
| `middleware` | Global middleware stack | Basic middleware | Local factory props |
| `debug` | Debug panel configuration | Auto (dev mode) | Environment variables |

### 🎛️ Component Registry Provider:

| **Registration Type** | **Scope** | **Priority** | **Use Case** |
| --------------------- | --------- | ------------ | ------------ |
| **Default Registry** | System-wide | Lowest | Built-in components |
| **Global Registry** | Application-wide | Medium | Consistent UI library |
| **Local Registry** | Factory-specific | Highest | Component overrides |
| **Dynamic Registry** | Runtime | Variable | A/B testing, themes |

### 🔧 Middleware Provider:

| **Middleware Type** | **Scope** | **Execution** | **Purpose** |
| ------------------- | --------- | ------------- | ----------- |
| **Core Middleware** | System | Always executed | Essential functionality |
| **Global Middleware** | Application | Configurable | Consistent behavior |
| **Local Middleware** | Factory | Override/extend | Specific functionality |
| **Conditional Middleware** | Context-based | Conditional | Role/tenant specific |


## ⚙️ Provider Architecture

**Como o sistema de providers funciona:**

### 📋 Provider Initialization:

| **Phase** | **Process** | **Result** | **Dependencies** |
| --------- | ----------- | ---------- | ---------------- |
| **1. Provider Setup** | Initialize provider context | Context available | None |
| **2. Registry Registration** | Register global components | Global registry populated | Component definitions |
| **3. Middleware Registration** | Register global middleware | Middleware stack ready | Middleware functions |
| **4. Context Propagation** | Propagate to child components | Providers active | React/Vue context |

### 🎯 Context Propagation:

**React Context Usage:**
```typescript
// Provider contexts
const scheptaContext = createContext<scheptaConfig>();
const ComponentRegistryContext = createContext<ComponentRegistry>();
const MiddlewareContext = createContext<MiddlewareStack>();

// Hook access
const useschepta = () => useContext(scheptaContext);
const useComponentRegistry = () => useContext(ComponentRegistryContext);
const useMiddleware = () => useContext(MiddlewareContext);
```

**Configuration Inheritance:**
```typescript
const mergedConfig = {
  // Default configuration
  ...defaultscheptaConfig,
  
  // Provider configuration  
  ...providerConfig,
  
  // Runtime overrides
  ...runtimeConfig
};
```


## 📊 Configuration Patterns

**Padrões comuns de configuração do provider:**

### 🎯 Application-Level Patterns:

| **Pattern** | **Use Case** | **Configuration** | **Benefits** |
| ----------- | ------------ | ----------------- | ----------- |
| **Component Library** | Design system | Consistent components | Development speed |
| **Micro-frontends** | Distributed app | Scoped configurations | Team independence |

### 🔧 Component Library Integration:

**Material-UI Integration:**
```typescript
<scheptaProvider
  components={{
    InputText: MuiTextField,
    Button: MuiButton,
    Select: MuiSelect,
    Checkbox: MuiCheckbox
  }}
>
  <App />
</scheptaProvider>
```

**Ant Design Integration:**
```typescript
<scheptaProvider
  components={{
    InputText: AntInput,
    Button: AntButton,
    Select: AntSelect,
    Checkbox: AntCheckbox
  }}
>
  <App />
</scheptaProvider>
```

### 🎨 Multi-Tenant Configuration:

**Tenant-Specific Providers:**
```typescript
const TenantProvider = ({ tenant, children }) => {
  const tenantConfig = getTenantConfig(tenant);
  
  return (
    <scheptaProvider
      components={tenantConfig.components}
      middleware={tenantConfig.middleware}
    >
      {children}
    </scheptaProvider>
  );
};
```


## 💡 Conceitos Relacionados

**Provider Pattern gerencia configuração de todos os outros conceitos:**

- **[01. Factories](./01-factories.md):** Factories usam configuração do Provider
- **[04. Schema Resolution](./04-schema-resolution.md):** Resolution usa context do Provider  
- **[05. Renderer](./05-renderer.md):** Renderers resolvidos via Provider registry
- **[06. Middleware](./06-middleware.md):** Middleware registrados no Provider
- **[07. Debug System](./07-debug-system.md):** Debug configurado via Provider

