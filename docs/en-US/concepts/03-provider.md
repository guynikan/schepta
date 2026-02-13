# Global Context

**System that manages shared configuration and state** — the "command center" that coordinates all of schepta.

<img src="/images/03-provider.svg" alt="Provider" />

**Provider Pattern centralizes configurations that all components need to share:**

### What It Does:

| **Configuration** | **Scope** | **Benefit** | **Example** |
| ---------------- | ---------- | ------------- | ----------- |
| **Component registry** | Global | Standardized components | Override factory built-in defaults |
| **Middleware stack** | Global | Consistent behavior | Template expressions, validation |
| **External context** | Global | Shared state | User, API, locale |

### Configuration Hierarchy:

**Provider Hierarchy:**
```text
ScheptaProvider (App Level)
    ├── components, customComponents, renderers
    ├── middlewares (array)
    ├── externalContext
    └── debug
        └── FormFactory / MenuFactory (Local)
            ├── Local component overrides (components prop)
            └── Local middleware overrides (middlewares prop)
```

**Quick Example:**
```jsx
<ScheptaProvider
  components={{ InputText: MUITextField, Button: MUIButton }}
  middlewares={[withValidation, withAnalytics]}
  externalContext={{ user: currentUser, api: apiUrl }}
  debug={{ enabled: true }}
>
  <App />
</ScheptaProvider>
```

> **Result:** Configure once → Available throughout the application.


## ScheptaProvider Props

| **Prop** | **Type** | **Description** |
| -------- | -------- | ---------------- |
| `components` | `Record<string, ComponentSpec>` | Global component registry (optional). Merged with factory defaults; local factory props override. |
| `customComponents` | `Record<string, ComponentSpec>` | Custom components keyed by schema key, used when schema node has `x-custom: true` (optional). |
| `renderers` | `Partial<Record<ComponentType, RendererSpec>>` | Custom renderers per component type (optional). |
| `middlewares` | `MiddlewareFn[]` | Array of middleware functions. Executed in order; template expression middleware runs first when using FormFactory. |
| `externalContext` | `object` | Shared context (user, API, etc.). Available in expressions as `$externalContext`. |
| `debug` | `DebugConfig` | Debug configuration (e.g. `{ enabled: true }`). |

**Resolution order:** Factory defaults → Provider config → Local factory props (local wins).


## Provider Architecture

**How the provider system works:**

### Context Propagation:

**React:** A single context exposes all provider configuration. Use `useSchepta()` (throws if no provider) or `useScheptaContext()` (returns null if no provider).

```typescript
import { useSchepta, useScheptaContext } from '@schepta/adapter-react';

// Required usage (throws when no provider)
const config = useSchepta();
// config.components, config.customComponents, config.renderers,
// config.middlewares, config.externalContext, config.debug

// Optional usage (null when no provider)
const config = useScheptaContext();
```

**Configuration merge:** Factories merge Provider config with their own defaults and local props. Component resolution order: default (factory) → Provider `components` → local `components`. Same idea for renderers and middlewares.


## Configuration Patterns

### Component Library Integration:

**Material-UI Integration:**
```typescript
<ScheptaProvider
  components={{
    InputText: MuiTextField,
    Button: MuiButton,
    Select: MuiSelect,
    Checkbox: MuiCheckbox
  }}
>
  <App />
</ScheptaProvider>
```

**Ant Design Integration:**
```typescript
<ScheptaProvider
  components={{
    InputText: AntInput,
    Button: AntButton,
    Select: AntSelect,
    Checkbox: AntCheckbox
  }}
>
  <App />
</ScheptaProvider>
```

### Multi-Tenant Configuration:

**Tenant-Specific Providers:**
```typescript
const TenantProvider = ({ tenant, children }) => {
  const tenantConfig = getTenantConfig(tenant);

  return (
    <ScheptaProvider
      components={tenantConfig.components}
      middlewares={tenantConfig.middlewares}
      externalContext={tenantConfig.externalContext}
    >
      {children}
    </ScheptaProvider>
  );
};
```


## Related Concepts

**Provider Pattern manages configuration for all other concepts:**

- **[01. Factories](./01-factories.md):** Factories use Provider configuration
- **[04. Schema Resolution](./04-schema-resolution.md):** Resolution uses Provider context  
- **[05. Renderer](./05-renderer.md):** Renderers resolved via Provider
- **[06. Middleware](./06-middleware.md):** Middleware registered in Provider (`middlewares` array)
- **[07. Debug System](./07-debug-system.md):** Debug configured via Provider
