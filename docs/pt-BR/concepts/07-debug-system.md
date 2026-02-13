# Sistema de Debug

**Suporte configurável de debug para desenvolvimento** — logging e buffer para rastrear resolução e middleware.

<img src="/images/07-debug-system.svg" alt="Debug System" />

**O debug é ativado via configuração e fornece uma função de log e um buffer opcional usados durante a renderização:**

### O Que Fornece:

| **Recurso** | **Propósito** |
| ----------- | ----------- |
| **DebugConfig** | Habilitar debug e flags opcionais para log de resolução de componentes, middleware e reações |
| **Contexto de debug** | Função `log(category, message, data?)` e um `buffer` (add, clear, getAll) passados pelo middleware e resolução |
| **Ativação** | Definir `debug={{ enabled: true }}` no ScheptaProvider ou FormFactory |

**Ativação:**
```tsx
<ScheptaProvider debug={{ enabled: true }}>
  <App />
</ScheptaProvider>

// Ou por factory
<FormFactory schema={schema} debug={true} />
```

> **Resultado:** Quando habilitado, o sistema pode registrar resolução de componentes, execução de middleware e reações. Middleware e orquestrador recebem um contexto de debug e podem registrar ou bufferizar entradas.


## Configuração de Debug

**DebugConfig** (de `@schepta/core`):

| **Propriedade** | **Tipo** | **Descrição** |
| ------------ | -------- | --------------- |
| `enabled` | boolean | Interruptor geral do debug |
| `logComponentResolution` | boolean (opcional) | Registrar quando componentes são resolvidos |
| `logMiddlewareExecution` | boolean (opcional) | Registrar quando o middleware roda |
| `logReactions` | boolean (opcional) | Registrar execução de reações |

**DebugContextValue** (passado quando o debug está habilitado):

- `isEnabled` — true quando o debug está ligado
- `log(category, message, data?)` — registrar uma mensagem (ex.: no console)
- `buffer` — `{ add(entry), clear(), getAll() }` para armazenar entradas de debug (ex.: para inspeção posterior)

As factories criam um contexto de debug quando `debug.enabled` é true e o passam para o contexto de middleware e para a resolução. O middleware pode usar `context.debug?.log()` para enviar informações quando o debug está habilitado.


## Como Funciona

1. **Provider ou FormFactory** recebe `debug` (ex.: `{ enabled: true }`).
2. **Config mesclada** inclui debug; quando habilitado, um contexto de debug é criado (ex.: com `log` escrevendo no console e um buffer).
3. **Contexto de middleware** inclui `debug`. O middleware pode chamar `context.debug?.log('middleware', 'message', data)`.
4. **Resolução** pode usar o debug para avisar quando um componente não é encontrado ou quando `x-custom` está definido mas nenhum componente customizado está registrado.

Isso dá visibilidade sobre resolução e middleware sem exigir uma UI separada; você pode estender o buffer ou a saída de log conforme necessário na sua aplicação.


## Conceitos Relacionados

**O debug é configurado e usado em todos os conceitos:**

- **[01. Factories](./01-factories.md):** Factories passam o debug para o pipeline
- **[04. Schema Resolution](./04-schema-resolution.md):** A resolução pode registrar os passos quando o debug está habilitado  
- **[05. Renderer](./05-renderer.md):** Renderers recebem as props após o middleware (o debug pode ter sido usado lá)
- **[06. Middleware](./06-middleware.md):** O middleware recebe `context.debug` e pode registrar ou bufferizar
- **[03. Provider](./03-provider.md):** Debug configurado via prop `debug` do Provider
- **[02. Schema Language](./02-schema-language.md):** O schema é o que a resolução e o middleware processam; o debug ajuda a rastrear como é interpretado
