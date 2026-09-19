# Criando uma Factory

**O Schepta expõe uma primitiva genérica de factory** para você entregar suas próprias factories built-in (`FormFactory`, `MenuFactory` e o que mais inventar) em cima do mesmo motor.

A primitiva cuida das partes chatas — validação de schema, merge de configuração, setup do orchestrator, refs imperativos, estado reativo — e deixa você focar na lógica de domínio da sua factory.

## Quando Criar uma Factory Customizada

Crie uma factory quando precisar de:

- Um **formato de schema dedicado** (forms, menus, steppers, dashboards, canvases…) com seu próprio JSON Schema.
- Um **conjunto de componentes default** para os quais o schema resolverá.
- Um **ciclo de vida de domínio** (estado, eventos, API imperativa) envolvendo a árvore renderizada.

Se você só precisa de um visual diferente, não precisa de uma nova factory — basta registrar componentes via `ScheptaProvider` ou passar pela prop `components` de uma factory existente.

## A Primitiva

Cada runtime exporta uma primitiva de factory:

| Runtime   | Import                                                            | Retorna                                  |
| --------- | ----------------------------------------------------------------- | ---------------------------------------- |
| React     | `import { createReactFactory } from '@schepta/factory-react'`     | Componente `forwardRef`                  |
| Vue       | `import { createVueFactory } from '@schepta/factory-vue'`         | Resultado de `defineComponent`           |
| Vanilla JS| `import { createVanillaFactory } from '@schepta/factory-vanilla'` | Função factory retornando uma API        |

Todas compartilham o mesmo modelo mental:

1. Declare um `schemaDefinition` (JSON Schema) para validar.
2. Declare um `rootComponentKey` (o `x-component` do nó raiz).
3. Forneça `defaultComponents` e, opcionalmente, `defaultRenderers`.
4. Implemente um callback `useSetup` (ou `setup`) que retorne estado, `refApi` opcional, middlewares extras e um `wrap` opcional para decorar a árvore renderizada.

## Exemplo React — `MenuFactory` Mínima

```tsx
import { createReactFactory } from '@schepta/factory-react';
import { useState, useCallback } from 'react';
import menuSchemaDefinition from '@schepta/factories/schemas/menu-schema.json';
import { defaultMenuComponents } from './menu-defaults';

export interface MenuFactoryRef {
  getActiveItem: () => string | null;
  setActiveItem: (key: string | null) => void;
}

export const MenuFactory = createReactFactory<
  { schema: any; initialActiveItem?: string | null; onSelect?: (p: any) => void },
  MenuFactoryRef
>({
  displayName: 'MenuFactory',
  schemaDefinition: menuSchemaDefinition,
  rootComponentKey: 'MenuContainer',
  defaultComponents: defaultMenuComponents,
  useSetup: ({ props }) => {
    const [activeItem, setActiveItem] = useState(props.initialActiveItem ?? null);

    const onSelect = useCallback(
      (payload: { href?: string; label: string }, key: string) => {
        setActiveItem(key);
        props.onSelect?.({ key, ...payload });
      },
      [props.onSelect]
    );

    return {
      state: { activeItem },
      externalContext: { menu: { activeItem, onSelect } },
      refApi: {
        getActiveItem: () => activeItem,
        setActiveItem,
      },
    };
  },
});
```

Uso:

```tsx
<MenuFactory
  schema={menuSchema}
  onSelect={(payload) => console.log('selected', payload)}
/>
```

## O Que `useSetup` Pode Retornar

`useSetup` recebe `{ props, mergedConfig }` e pode retornar qualquer subconjunto de:

| Campo              | Propósito                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| `state`            | Estado no qual o orchestrator irá reagir (combine com `subscribe`/`getSnapshot`).               |
| `subscribe`        | (React) função `subscribe` de `useSyncExternalStore` — use com stores externos (form adapter). |
| `getSnapshot`      | (React) função snapshot correspondente. O retorno é usado como `state`.                         |
| `middlewares`      | Middlewares extras adicionados ao pipeline.                                                     |
| `externalContext`  | Entradas extras mescladas no external context do renderer.                                      |
| `formAdapter`      | Form adapter opcional para factories que precisam de semântica de formulário.                   |
| `onSubmit`         | Handler de submit opcional encaminhado pelo orchestrator.                                       |
| `refApi`           | Objeto exposto via `useImperativeHandle` / ref API.                                             |
| `wrap`             | `(tree) => ReactNode` — envolve a árvore do orchestrator (ex.: `<ScheptaFormProvider>`).        |

Retorne apenas o que precisar — tudo é opcional, só retorne um objeto.

## Hooks de Baixo Nível (React)

`createReactFactory` é uma composição fina de três hooks reutilizáveis que você pode chamar diretamente quando quiser controle total:

- `useScheptaSchemaValidation(instance, { schemaDefinition })` — roda a validação AJV e retorna `{ valid, errors, formattedErrors }`.
- `useMergedScheptaConfig({ defaultComponents, defaultRenderers, components, ... })` — mescla defaults da factory, config do provider e props locais.
- `useScheptaOrchestrator({ components, renderers, rootComponentKey, ... })` — monta o renderer do orchestrator do Schepta.

Todos são exportados por `@schepta/factory-react` para casos avançados/experimentais. Para 95% das factories, `createReactFactory` é a abstração certa.

## Vue & Vanilla

As primitivas Vue e Vanilla seguem o mesmo contrato:

- `createVueFactory` retorna um `defineComponent` que pode ser usado onde quer que se use um componente Vue. O `setup` recebe props e merged config e retorna o mesmo formato descrito acima (sem os hooks específicos do React).
- `createVanillaFactory` retorna uma função `(mountNode, options) => api`. A factory cuida do loop de mount/rerender, preservação de foco e UI de erros de validação. Os hooks `onBeforeRerender` / `onAfterRerender` permitem preservar estado do DOM entre rerenderizações.

## Coexistência

Múltiplas factories podem coexistir sob o mesmo `ScheptaProvider`. Cada factory mantém seu próprio `defaultComponents` e `rootComponentKey`, então não há conflito de registro global — `FormFactory` e uma `MenuFactory` customizada podem renderizar lado a lado sem configuração extra.

```tsx
<ScheptaProvider>
  <MenuFactory schema={menuSchema} />
  <FormFactory schema={formSchema} onSubmit={save} />
</ScheptaProvider>
```

## Checklist

- [ ] Um JSON Schema validado pelo AJV (publicado ou embarcado na factory).
- [ ] Um `rootComponentKey` correspondente ao `x-component` raiz desse schema.
- [ ] Um mapa `defaultComponents` (e `defaultRenderers` opcionais).
- [ ] Um `useSetup` / `setup` com o estado específico do domínio e a ref API.
- [ ] Testes cobrindo falha de validação, render bem-sucedido e a ref API pública.
