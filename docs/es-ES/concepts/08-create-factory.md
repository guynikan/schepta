# Creando una Factory

**Schepta expone una primitiva genérica de factory** para que puedas entregar tus propias factories integradas (`FormFactory`, `MenuFactory` y cualquier otra que inventes) sobre el mismo motor.

La primitiva se encarga de las partes tediosas — validación de schema, merge de configuración, setup del orchestrator, refs imperativos, estado reactivo — y te deja enfocarte en la lógica de dominio de tu factory.

## Cuándo Crear una Factory Personalizada

Crea una factory cuando necesites:

- Una **forma de schema dedicada** (formularios, menús, steppers, dashboards, canvases…) con su propio JSON Schema.
- Un **conjunto de componentes por defecto** a los que resolverá el schema.
- Un **ciclo de vida de dominio** (estado, eventos, API imperativa) alrededor del árbol renderizado.

Si solo necesitas un look distinto, no necesitas una nueva factory — registra componentes vía `ScheptaProvider` o pásalos como prop `components` a una factory existente.

## La Primitiva

Cada runtime exporta una primitiva de factory:

| Runtime   | Import                                                            | Devuelve                                |
| --------- | ----------------------------------------------------------------- | --------------------------------------- |
| React     | `import { createReactFactory } from '@schepta/factory-react'`     | Componente `forwardRef`                 |
| Vue       | `import { createVueFactory } from '@schepta/factory-vue'`         | Resultado de `defineComponent`          |
| Vanilla JS| `import { createVanillaFactory } from '@schepta/factory-vanilla'` | Función factory que retorna una API     |

Todas comparten el mismo modelo mental:

1. Declara un `schemaDefinition` (JSON Schema) para validar.
2. Declara un `rootComponentKey` (el `x-component` del nodo raíz).
3. Proporciona `defaultComponents` y, opcionalmente, `defaultRenderers`.
4. Implementa un callback `useSetup` (o `setup`) que retorne estado, `refApi` opcional, middlewares extras y un `wrap` opcional para decorar el árbol renderizado.

## Ejemplo React — `MenuFactory` Mínima

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

## Lo Que `useSetup` Puede Retornar

`useSetup` recibe `{ props, mergedConfig }` y puede retornar cualquier subconjunto de:

| Campo              | Propósito                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| `state`            | Estado sobre el que el orchestrator reaccionará (combina con `subscribe`/`getSnapshot`).        |
| `subscribe`        | (React) función `subscribe` de `useSyncExternalStore` — úsala con stores externos.              |
| `getSnapshot`      | (React) función snapshot correspondiente. El retorno se usa como `state`.                       |
| `middlewares`      | Middlewares extras agregados al pipeline.                                                       |
| `externalContext`  | Entradas extras fusionadas en el external context del renderer.                                 |
| `formAdapter`      | Form adapter opcional para factories con semántica de formulario.                               |
| `onSubmit`         | Handler de submit opcional canalizado por el orchestrator.                                      |
| `refApi`           | Objeto expuesto vía `useImperativeHandle` / ref API.                                            |
| `wrap`             | `(tree) => ReactNode` — envuelve el árbol del orchestrator (ej.: `<ScheptaFormProvider>`).      |

Retorna solo lo que necesites — todo es opcional, solo devuelve un objeto.

## Hooks de Bajo Nivel (React)

`createReactFactory` es una composición fina de tres hooks reutilizables que puedes invocar directamente cuando quieras control total:

- `useScheptaSchemaValidation(instance, { schemaDefinition })` — ejecuta validación AJV y retorna `{ valid, errors, formattedErrors }`.
- `useMergedScheptaConfig({ defaultComponents, defaultRenderers, components, ... })` — mezcla defaults de la factory, config del provider y props locales.
- `useScheptaOrchestrator({ components, renderers, rootComponentKey, ... })` — construye el renderer del orchestrator de Schepta.

Todos se exportan desde `@schepta/factory-react` para casos avanzados/experimentales. Para el 95% de las factories, `createReactFactory` es la abstracción correcta.

## Vue y Vanilla

Las primitivas Vue y Vanilla siguen el mismo contrato:

- `createVueFactory` devuelve un `defineComponent` que puedes usar donde se use un componente Vue. `setup` recibe props y merged config y retorna la misma forma descrita arriba (sin los hooks específicos de React).
- `createVanillaFactory` devuelve una función `(mountNode, options) => api`. La factory se encarga del loop de mount/rerender, preservación de foco y UI de errores de validación. Los hooks `onBeforeRerender` / `onAfterRerender` permiten preservar estado del DOM entre rerenderizados.

## Coexistencia

Múltiples factories pueden coexistir bajo el mismo `ScheptaProvider`. Cada factory mantiene sus propios `defaultComponents` y `rootComponentKey`, así que no hay choques de registro global — `FormFactory` y una `MenuFactory` personalizada pueden renderizarse lado a lado sin configuración extra.

```tsx
<ScheptaProvider>
  <MenuFactory schema={menuSchema} />
  <FormFactory schema={formSchema} onSubmit={save} />
</ScheptaProvider>
```

## Checklist

- [ ] Un JSON Schema validado por AJV (publicado o empaquetado con la factory).
- [ ] Un `rootComponentKey` que corresponda al `x-component` raíz de ese schema.
- [ ] Un mapa `defaultComponents` (y `defaultRenderers` opcionales).
- [ ] Un `useSetup` / `setup` con el estado específico del dominio y la ref API.
- [ ] Tests cubriendo falla de validación, render exitoso y la ref API pública.
