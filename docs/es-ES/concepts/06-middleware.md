# Transformación de Props

**Sistema que intercepta y modifica props antes del render** — el "filtro inteligente" entre schema y componente.

<img src="/images/06-middleware.svg" alt="Middleware" />

**El Pipeline de Middleware permite modificar el comportamiento de los componentes sin cambiar código:**

### Qué Hace:

| **Entrada** | **Middleware** | **Transformación** | **Salida** |
| --------- | -------------- | ------------------ | ---------- |
| Props brutas del schema | Middleware de expresiones de template | Reemplaza `{{ $formValues.x }}`, `{{ $externalContext.x }}` | Props resueltas |
| Props + schema + contexto | Middleware custom | Validación, formateo, lógica | Props finales |
| Props del componente | Tu middleware | Cualquier transformación | Props enriquecidas |

### Flujo del Pipeline:

**Ejecución secuencial (orden del array):**
```text
Props Brutas → Middleware 1 → Middleware 2 → ... → Props Finales → Componente
```

**Built-in:** El middleware de expresiones de template corre primero (al usar FormFactory), así los valores del formulario y el contexto externo están disponibles para sustitución. Luego los middlewares que pases (`middlewares` del Provider y `middlewares` de la factory) corren en orden.

> **Resultado:** Props básicas → Props enriquecidas. ¡Funcionalidad sin código duplicado!


## Interfaz del Middleware

**Firma (de `@schepta/core`):**

```typescript
import type { MiddlewareFn, MiddlewareContext } from '@schepta/core';

const myMiddleware: MiddlewareFn = (props, schema, context) => {
  // props: objeto de props actual
  // schema: el nodo del schema para este componente
  // context: MiddlewareContext
  return { ...props, /* tus cambios */ };
};
```

**MiddlewareContext** proporciona:
- `formValues` — valores actuales del formulario (para middleware que usa formulario)
- `externalContext` — `externalContext` del Provider (usuario, API, etc.)
- `debug` — utilidades de debug cuando debug está habilitado
- `formAdapter` — adapter de formulario cuando está disponible (ej. en FormFactory)

**Registro:** Los middlewares se pasan como **array**, no como objeto. El orden de ejecución es el orden en el array.

```typescript
<ScheptaProvider middlewares={[templateMiddleware, withValidation, withAnalytics]}>
  ...
</ScheptaProvider>

// O por factory
<FormFactory schema={schema} middlewares={[customMiddleware]} />
```

El pipeline aplica los middlewares en secuencia; cada uno recibe el resultado del anterior. Usa `applyMiddlewares` del core si necesitas ejecutar el mismo pipeline en otro lugar.


## Patrones de Middleware

**Patrones de transformación:**

| **Patrón** | **Propósito** | **Implementación** |
| ----------- | ----------- | ------------------ |
| **Enhancer** | Añadir funcionalidad | `(props, schema, context) => ({ ...props, newFeature })` |
| **Filter** | Quitar/modificar props | `(props) => omit(props, 'sensitiveData')` |
| **Mapper** | Transformar valores | `(props) => ({ ...props, value: transform(props.value) })` |
| **Conditional** | Aplicar condicionalmente | `(props, schema, context) => condition ? enhance(props) : props` |

**Ejemplo – wrapper de logging:**
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


## Conceptos Relacionados

**El Pipeline de Middleware es el "procesador de props" usado por otros conceptos:**

- **[01. Factories](./01-factories.md):** Las factories ejecutan el pipeline de middleware para cada componente
- **[04. Schema Resolution](./04-schema-resolution.md):** La resolución aplica el middleware durante el procesamiento  
- **[05. Renderer](./05-renderer.md):** Los renderers reciben las props tras el middleware
- **[02. Schema Language](./02-schema-language.md):** Las propiedades del schema (ej. `x-component-props`) son transformadas por el middleware
- **[03. Provider](./03-provider.md):** El Provider registra el array global `middlewares`
- **[07. Debug System](./07-debug-system.md):** El debug puede registrar la ejecución del middleware cuando está habilitado
