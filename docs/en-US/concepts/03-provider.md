# Global Context

**System that manages shared configuration and state** — the "command center" that coordinates all of schepta.

<img src="/images/03-provider.svg" alt="Provider" />


**Provider Pattern centralizes configurations that all components need to share:**

### 🔧 What It Does:

| **Configuration** | **Scope** | **Benefit** | **Example** |
| ---------------- | ---------- | ------------- | ----------- |
| **Component Registry** | Global | Standardized components | MUI as default |
| **Middleware Stack** | Global | Consistent behavior | Uniform validation |
| **Context Providers** | Global | Shared state | User, permissions, locale |

### 📊 Configuration Hierarchy:

**Provider Hierarchy:**
```text
scheptaProvider (App Level)
    ├── Global Component Registry
    ├── Global Middleware  
    └── Context Providers
        └── FormFactory/MenuFactory (Local)
            ├── Local Component Overrides
            └── Local Middleware Overrides
```

**Quick Example:**
```jsx
<scheptaProvider
  components={{ InputText: MUITextField, Button: MUIButton }}
  middleware={{ withValidation, withAnalytics }}
>
  <App />
</scheptaProvider>
```

> **💡 Result:** Configure once → Available throughout the application. 


## 🚀 Provider Types

**Each provider manages a specific aspect of the system:**

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

**How the provider system works:**

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

**Common provider configuration patterns:**

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


## 💡 Related Concepts

**Provider Pattern manages configuration for all other concepts:**

- **[01. Factories](./01-factories.md):** Factories use Provider configuration
- **[04. Schema Resolution](./04-schema-resolution.md):** Resolution uses Provider context  
- **[05. Renderer](./05-renderer.md):** Renderers resolved via Provider registry
- **[06. Middleware](./06-middleware.md):** Middleware registered in Provider
- **[07. Debug System](./07-debug-system.md):** Debug configured via Provider

