# Contexto Global

**Sistema que gerencia configuração e estado compartilhados** — o "centro de comando" que coordena todo o schepta.

<img src="/images/03-provider.svg" alt="Provider" />

**O Provider Pattern centraliza as configurações que todos os componentes precisam compartilhar:**

### O Que Faz:

| **Configuração** | **Escopo** | **Benefício** | **Exemplo** |
| ---------------- | ---------- | ------------- | ----------- |
| **Registro de componentes** | Global | Componentes padronizados | Sobrescrever os defaults built-in da factory |
| **Stack de middleware** | Global | Comportamento consistente | Expressões de template, validação |
| **Contexto externo** | Global | Estado compartilhado | Usuário, API, locale |

### Hierarquia de Configuração:

**Hierarquia do Provider:**
```text
ScheptaProvider (Nível da App)
    ├── components, customComponents, renderers
    ├── middlewares (array)
    ├── externalContext
    └── debug
        └── FormFactory / MenuFactory (Local)
            ├── Overrides locais de componentes (prop components)
            └── Overrides locais de middleware (prop middlewares)
```

**Exemplo Rápido:**
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

> **Resultado:** Configure uma vez → Disponível em toda a aplicação.


## Props do ScheptaProvider

| **Prop** | **Tipo** | **Descrição** |
| -------- | -------- | ---------------- |
| `components` | `Record<string, ComponentSpec>` | Registro global de componentes (opcional). Mesclado com os defaults da factory; props locais da factory sobrescrevem. |
| `customComponents` | `Record<string, ComponentSpec>` | Componentes customizados por chave do schema, usados quando o nó tem `x-custom: true` (opcional). |
| `renderers` | `Partial<Record<ComponentType, RendererSpec>>` | Renderers customizados por tipo de componente (opcional). |
| `middlewares` | `MiddlewareFn[]` | Array de funções de middleware. Executadas em ordem; o middleware de expressões de template roda primeiro ao usar FormFactory. |
| `externalContext` | `object` | Contexto compartilhado (usuário, API, etc.). Disponível nas expressões como `$externalContext`. |
| `debug` | `DebugConfig` | Configuração de debug (ex.: `{ enabled: true }`). |

**Ordem de resolução:** Defaults da factory → Config do Provider → Props locais da factory (local vence).


## Arquitetura do Provider

**Como o sistema de provider funciona:**

### Propagação de Contexto:

**React:** Um único contexto expõe toda a configuração do provider. Use `useSchepta()` (lança erro se não houver provider) ou `useScheptaContext()` (retorna null se não houver provider).

```typescript
import { useSchepta, useScheptaContext } from '@schepta/adapter-react';

// Uso obrigatório (lança quando não há provider)
const config = useSchepta();
// config.components, config.customComponents, config.renderers,
// config.middlewares, config.externalContext, config.debug

// Uso opcional (null quando não há provider)
const config = useScheptaContext();
```

**Merge de configuração:** As factories mesclam a config do Provider com seus próprios defaults e props locais. Ordem de resolução de componentes: default (factory) → `components` do Provider → `components` local. Mesma ideia para renderers e middlewares.


## Padrões de Configuração

### Integração com Biblioteca de Componentes:

**Integração Material-UI:**
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

**Integração Ant Design:**
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

### Configuração Multi-tenant:

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


## Conceitos Relacionados

**O Provider Pattern gerencia a configuração de todos os outros conceitos:**

- **[01. Factories](./01-factories.md):** Factories usam a configuração do Provider
- **[04. Schema Resolution](./04-schema-resolution.md):** A resolução usa o contexto do Provider  
- **[05. Renderer](./05-renderer.md):** Renderers resolvidos via Provider
- **[06. Middleware](./06-middleware.md):** Middleware registrado no Provider (array `middlewares`)
- **[07. Debug System](./07-debug-system.md):** Debug configurado via Provider
