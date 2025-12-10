# Contexto Global

**Sistema que gerencia configurações e estado compartilhado** — o "centro de comando" que coordena todo o schepta.

<ThemeImage src="/images/03-provider.png" alt="Provider" />

---

**Provider Pattern centraliza configurações que todos os componentes precisam compartilhar:**

### 🔧 O Que Faz:

| **Configuração** | **Escopo** | **Benefício** | **Exemplo** |
| ---------------- | ---------- | ------------- | ----------- |
| **Component Registry** | Global | Componentes padronizados | MUI como padrão |
| **Middleware Stack** | Global | Comportamento consistente | Validação uniforme |
| **Theme Configuration** | Global | Visual identity | Cores e fontes |
| **Context Providers** | Global | Estado compartilhado | User, permissions, locale |

### 📊 Hierarquia de Configuração:

**Provider Hierarchy:**
```text
scheptaProvider (App Level)
    ├── Component Registry Global
    ├── Middleware Global  
    ├── Theme Provider
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
  theme={{ primary: '#007ACC' }}
>
  <App />
</scheptaProvider>
```

> **💡 Resultado:** Configuração uma vez → Disponível em toda aplicação. 

---

## 🚀 Tipos de Provider

**Cada provider gerencia um aspecto específico do sistema:**

### 🎨 scheptaProvider - Master Provider:

| **Configuration** | **Purpose** | **Default** | **Override Level** |
| ----------------- | ----------- | ----------- | ------------------ |
| `components` | Global component registry | Built-in components | Local factory props |
| `middleware` | Global middleware stack | Basic middleware | Local factory props |
| `theme` | Visual theme configuration | Default theme | CSS/styled-components |
| `debug` | Debug panel configuration | Auto (dev mode) | Environment variables |
| `cache` | Caching strategy | React Query defaults | Provider props |

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

### 🎨 Theme Provider:

| **Theme Aspect** | **Configuration** | **Inheritance** | **Override** |
| ---------------- | ----------------- | --------------- | ------------ |
| **Colors** | Primary, secondary, etc. | CSS variables | Component props |
| **Typography** | Fonts, sizes, weights | CSS cascade | Inline styles |
| **Spacing** | Margins, padding, grid | CSS classes | Component styles |
| **Components** | Default component styles | Theme object | Component overrides |

---

## ⚙️ Provider Architecture

**Como o sistema de providers funciona:**

### 📋 Provider Initialization:

| **Phase** | **Process** | **Result** | **Dependencies** |
| --------- | ----------- | ---------- | ---------------- |
| **1. Provider Setup** | Initialize provider context | Context available | None |
| **2. Registry Registration** | Register global components | Global registry populated | Component definitions |
| **3. Middleware Registration** | Register global middleware | Middleware stack ready | Middleware functions |
| **4. Theme Initialization** | Setup theme context | Theme available | Theme configuration |
| **5. Context Propagation** | Propagate to child components | Providers active | React/Vue context |

### 🎯 Context Propagation:

**React Context Usage:**
```typescript
// Provider contexts
const scheptaContext = createContext<scheptaConfig>();
const ComponentRegistryContext = createContext<ComponentRegistry>();
const MiddlewareContext = createContext<MiddlewareStack>();
const ThemeContext = createContext<ThemeConfig>();

// Hook access
const useschepta = () => useContext(scheptaContext);
const useComponentRegistry = () => useContext(ComponentRegistryContext);
const useMiddleware = () => useContext(MiddlewareContext);
const usescheptaTheme = () => useContext(ThemeContext);
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

---

## 📊 Configuration Patterns

**Padrões comuns de configuração do provider:**

### 🎯 Application-Level Patterns:

| **Pattern** | **Use Case** | **Configuration** | **Benefits** |
| ----------- | ------------ | ----------------- | ----------- |
| **Single Theme** | Consistent app | One theme config | Visual consistency |
| **Multi-Theme** | White-label app | Theme per tenant | Brand flexibility |
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
  theme={{
    palette: {
      primary: { main: '#1976d2' },
      secondary: { main: '#dc004e' }
    }
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
  theme={{
    token: {
      colorPrimary: '#1890ff',
      colorSuccess: '#52c41a'
    }
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
      theme={tenantConfig.theme}
      middleware={tenantConfig.middleware}
    >
      {children}
    </scheptaProvider>
  );
};
```

---

## 💡 Conceitos Relacionados

**Provider Pattern gerencia configuração de todos os outros conceitos:**

- **[01. Factories](./01-factories.md):** Factories usam configuração do Provider
- **[04. Schema Resolution](./04-schema-resolution.md):** Resolution usa context do Provider  
- **[05. Renderer](./05-renderer.md):** Renderers resolvidos via Provider registry
- **[06. Middleware](./06-middleware.md):** Middleware registrados no Provider
- **[07. Debug System](./07-debug-system.md):** Debug configurado via Provider

