# Contexto Global

**Sistema que gestiona la configuración y el estado compartidos** — el "centro de mando" que coordina todo schepta.

<img src="/images/03-provider.svg" alt="Provider" />

**El Provider Pattern centraliza las configuraciones que todos los componentes necesitan compartir:**

### Qué Hace:

| **Configuración** | **Alcance** | **Beneficio** | **Ejemplo** |
| ---------------- | ---------- | ------------- | ----------- |
| **Registro de componentes** | Global | Componentes estandarizados | Sobrescribir los defaults built-in de la factory |
| **Pila de middleware** | Global | Comportamiento consistente | Expresiones de template, validación |
| **Contexto externo** | Global | Estado compartido | Usuario, API, locale |

### Jerarquía de Configuración:

**Jerarquía del Provider:**
```text
ScheptaProvider (Nivel de la App)
    ├── components, customComponents, renderers
    ├── middlewares (array)
    ├── externalContext
    └── debug
        └── FormFactory / MenuFactory (Local)
            ├── Overrides locales de componentes (prop components)
            └── Overrides locales de middleware (prop middlewares)
```

**Ejemplo Rápido:**
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

> **Resultado:** Configura una vez → Disponible en toda la aplicación.


## Props de ScheptaProvider

| **Prop** | **Tipo** | **Descripción** |
| -------- | -------- | ---------------- |
| `components` | `Record<string, ComponentSpec>` | Registro global de componentes (opcional). Se mezcla con los defaults de la factory; las props locales de la factory sobrescriben. |
| `customComponents` | `Record<string, ComponentSpec>` | Componentes customizados por clave del schema, usados cuando el nodo tiene `x-custom: true` (opcional). |
| `renderers` | `Partial<Record<ComponentType, RendererSpec>>` | Renderers customizados por tipo de componente (opcional). |
| `middlewares` | `MiddlewareFn[]` | Array de funciones de middleware. Se ejecutan en orden; el middleware de expresiones de template corre primero al usar FormFactory. |
| `externalContext` | `object` | Contexto compartido (usuario, API, etc.). Disponible en expresiones como `$externalContext`. |
| `debug` | `DebugConfig` | Configuración de debug (ej. `{ enabled: true }`). |

**Orden de resolución:** Defaults de la factory → Config del Provider → Props locales de la factory (local gana).


## Arquitectura del Provider

**Cómo funciona el sistema de provider:**

### Propagación de Contexto:

**React:** Un único contexto expone toda la configuración del provider. Usa `useSchepta()` (lanza si no hay provider) o `useScheptaContext()` (devuelve null si no hay provider).

```typescript
import { useSchepta, useScheptaContext } from '@schepta/adapter-react';

// Uso obligatorio (lanza cuando no hay provider)
const config = useSchepta();
// config.components, config.customComponents, config.renderers,
// config.middlewares, config.externalContext, config.debug

// Uso opcional (null cuando no hay provider)
const config = useScheptaContext();
```

**Merge de configuración:** Las factories mezclan la config del Provider con sus propios defaults y props locales. Orden de resolución de componentes: default (factory) → `components` del Provider → `components` local. Misma idea para renderers y middlewares.


## Patrones de Configuración

### Integración con Biblioteca de Componentes:

**Integración Material-UI:**
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

**Integración Ant Design:**
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

### Configuración Multi-tenant:

**Providers por tenant:**
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


## Conceptos Relacionados

**El Provider Pattern gestiona la configuración de todos los demás conceptos:**

- **[01. Factories](./01-factories.md):** Las factories usan la configuración del Provider
- **[04. Schema Resolution](./04-schema-resolution.md):** La resolución usa el contexto del Provider  
- **[05. Renderer](./05-renderer.md):** Renderers resueltos vía Provider
- **[06. Middleware](./06-middleware.md):** Middleware registrado en el Provider (array `middlewares`)
- **[07. Debug System](./07-debug-system.md):** Debug configurado vía Provider
