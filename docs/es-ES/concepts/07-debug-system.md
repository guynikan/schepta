# Sistema de Debug

**Soporte configurable de debug para desarrollo** — logging y buffer para rastrear resolución y middleware.

<img src="/images/07-debug-system.svg" alt="Debug System" />

**El debug se activa vía configuración y proporciona una función de log y un buffer opcional usados durante el render:**

### Qué Proporciona:

| **Recurso** | **Propósito** |
| ----------- | ----------- |
| **DebugConfig** | Habilitar debug y flags opcionales para log de resolución de componentes, middleware y reacciones |
| **Contexto de debug** | Función `log(category, message, data?)` y un `buffer` (add, clear, getAll) pasados por middleware y resolución |
| **Activación** | Establecer `debug={{ enabled: true }}` en ScheptaProvider o FormFactory |

**Activación:**
```tsx
<ScheptaProvider debug={{ enabled: true }}>
  <App />
</ScheptaProvider>

// O por factory
<FormFactory schema={schema} debug={true} />
```

> **Resultado:** Cuando está habilitado, el sistema puede registrar resolución de componentes, ejecución de middleware y reacciones. Middleware y orquestador reciben un contexto de debug y pueden registrar o bufferizar entradas.


## Configuración de Debug

**DebugConfig** (de `@schepta/core`):

| **Propiedad** | **Tipo** | **Descripción** |
| ------------ | -------- | --------------- |
| `enabled` | boolean | Interruptor general del debug |
| `logComponentResolution` | boolean (opcional) | Registrar cuando se resuelven componentes |
| `logMiddlewareExecution` | boolean (opcional) | Registrar cuando corre el middleware |
| `logReactions` | boolean (opcional) | Registrar ejecución de reacciones |

**DebugContextValue** (pasado cuando el debug está habilitado):

- `isEnabled` — true cuando el debug está activo
- `log(category, message, data?)` — registrar un mensaje (ej. en consola)
- `buffer` — `{ add(entry), clear(), getAll() }` para almacenar entradas de debug (ej. para inspección posterior)

Las factories crean un contexto de debug cuando `debug.enabled` es true y lo pasan al contexto de middleware y a la resolución. El middleware puede usar `context.debug?.log()` para enviar información cuando el debug está habilitado.


## Cómo Funciona

1. **Provider o FormFactory** recibe `debug` (ej. `{ enabled: true }`).
2. **Config mezclada** incluye debug; cuando está habilitado, se crea un contexto de debug (ej. con `log` escribiendo en consola y un buffer).
3. **Contexto de middleware** incluye `debug`. El middleware puede llamar a `context.debug?.log('middleware', 'message', data)`.
4. **Resolución** puede usar el debug para advertir cuando no se encuentra un componente o cuando `x-custom` está definido pero no hay componente custom registrado.

Esto da visibilidad sobre resolución y middleware sin requerir una UI separada; puedes extender el buffer o la salida de log según necesites en tu aplicación.


## Conceptos Relacionados

**El debug se configura y usa en todos los conceptos:**

- **[01. Factories](./01-factories.md):** Las factories pasan el debug al pipeline
- **[04. Schema Resolution](./04-schema-resolution.md):** La resolución puede registrar los pasos cuando el debug está habilitado  
- **[05. Renderer](./05-renderer.md):** Los renderers reciben las props tras el middleware (el debug puede haberse usado ahí)
- **[06. Middleware](./06-middleware.md):** El middleware recibe `context.debug` y puede registrar o bufferizar
- **[03. Provider](./03-provider.md):** Debug configurado vía prop `debug` del Provider
- **[02. Schema Language](./02-schema-language.md):** El schema es lo que la resolución y el middleware procesan; el debug ayuda a rastrear cómo se interpreta
