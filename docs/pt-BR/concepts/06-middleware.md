# Transformação de Props

**Sistema que intercepta e modifica props antes da renderização** — o "filtro inteligente" entre schema e componente.

<img src="/images/06-middleware.svg" alt="Middleware" />

**O Pipeline de Middleware permite modificar o comportamento dos componentes sem alterar código:**

### O Que Faz:

| **Entrada** | **Middleware** | **Transformação** | **Saída** |
| --------- | -------------- | ------------------ | ---------- |
| Props brutas do schema | Middleware de expressões de template | Substitui `{{ $formValues.x }}`, `{{ $externalContext.x }}` | Props resolvidas |
| Props + schema + contexto | Middleware customizado | Validação, formatação, lógica | Props finais |
| Props do componente | Seu middleware | Qualquer transformação | Props enriquecidas |

### Fluxo do Pipeline:

**Execução sequencial (ordem do array):**
```text
Props Brutas → Middleware 1 → Middleware 2 → ... → Props Finais → Componente
```

**Built-in:** O middleware de expressões de template roda primeiro (ao usar FormFactory), então os valores do formulário e o contexto externo ficam disponíveis para substituição. Em seguida quaisquer middlewares que você passar (`middlewares` do Provider e `middlewares` da factory) rodam em ordem.

> **Resultado:** Props básicas → Props enriquecidas. Funcionalidade sem código duplicado!


## Interface do Middleware

**Assinatura (de `@schepta/core`):**

```typescript
import type { MiddlewareFn, MiddlewareContext } from '@schepta/core';

const myMiddleware: MiddlewareFn = (props, schema, context) => {
  // props: objeto de props atual
  // schema: o nó do schema para este componente
  // context: MiddlewareContext
  return { ...props, /* suas alterações */ };
};
```

**MiddlewareContext** fornece:
- `formValues` — valores atuais do formulário (para middleware que usa formulário)
- `externalContext` — `externalContext` do Provider (usuário, API, etc.)
- `debug` — utilitários de debug quando debug está habilitado
- `formAdapter` — adapter de formulário quando disponível (ex.: no FormFactory)

**Registro:** Middlewares são passados como **array**, não como objeto. A ordem de execução é a ordem no array.

```typescript
<ScheptaProvider middlewares={[templateMiddleware, withValidation, withAnalytics]}>
  ...
</ScheptaProvider>

// Ou por factory
<FormFactory schema={schema} middlewares={[customMiddleware]} />
```

O pipeline aplica os middlewares em sequência; cada um recebe o resultado do anterior. Use `applyMiddlewares` do core se precisar rodar o mesmo pipeline em outro lugar.


## Padrões de Middleware

**Padrões de transformação:**

| **Padrão** | **Propósito** | **Implementação** |
| ----------- | ----------- | ------------------ |
| **Enhancer** | Adicionar funcionalidade | `(props, schema, context) => ({ ...props, newFeature })` |
| **Filter** | Remover/modificar props | `(props) => omit(props, 'sensitiveData')` |
| **Mapper** | Transformar valores | `(props) => ({ ...props, value: transform(props.value) })` |
| **Conditional** | Aplicar condicionalmente | `(props, schema, context) => condition ? enhance(props) : props` |

**Exemplo – wrapper de logging:**
```typescript
const withLogging = (next: MiddlewareFn): MiddlewareFn => (props, schema, context) => {
  if (context.debug?.isEnabled) {
    context.debug.log('middleware', 'Before', props);
  }
  const result = next(props, schema, context);
  if (context.debug?.isEnabled) {
    context.debug.log('middleware', 'After', result);
  }
  return result;
};
```


## Conceitos Relacionados

**O Pipeline de Middleware é o "processador de props" usado por outros conceitos:**

- **[01. Factories](./01-factories.md):** Factories executam o pipeline de middleware para cada componente
- **[04. Schema Resolution](./04-schema-resolution.md):** A resolução aplica o middleware durante o processamento  
- **[05. Renderer](./05-renderer.md):** Renderers recebem as props após o middleware
- **[02. Schema Language](./02-schema-language.md):** Propriedades do schema (ex.: `x-component-props`) são transformadas pelo middleware
- **[03. Provider](./03-provider.md):** O Provider registra o array global `middlewares`
- **[07. Debug System](./07-debug-system.md):** O debug pode registrar a execução do middleware quando habilitado
