# Debug System

**Configurable debug support for development** — logging and buffer for tracing resolution and middleware.

<img src="/images/07-debug-system.svg" alt="Debug System" />

**Debug is enabled via configuration and provides a log function and an optional buffer used during rendering:**

### What It Provides:

| **Feature** | **Purpose** |
| ----------- | ----------- |
| **DebugConfig** | Enable debug and optional flags for component resolution, middleware, and reactions logging |
| **Debug context** | A `log(category, message, data?)` function and a `buffer` (add, clear, getAll) passed through middleware and resolution |
| **Activation** | Set `debug={{ enabled: true }}` on ScheptaProvider or FormFactory |

**Activation:**
```tsx
<ScheptaProvider debug={{ enabled: true }}>
  <App />
</ScheptaProvider>

// Or per factory
<FormFactory schema={schema} debug={true} />
```

> **Result:** When enabled, the system can log component resolution, middleware execution, and reactions. Middleware and orchestrator receive a debug context and can log or buffer entries.


## Debug Configuration

**DebugConfig** (from `@schepta/core`):

| **Property** | **Type** | **Description** |
| ------------ | -------- | --------------- |
| `enabled` | boolean | Master switch for debug |
| `logComponentResolution` | boolean (optional) | Log when components are resolved |
| `logMiddlewareExecution` | boolean (optional) | Log when middleware runs |
| `logReactions` | boolean (optional) | Log reaction execution |

**DebugContextValue** (passed when debug is enabled):

- `isEnabled` — true when debug is on
- `log(category, message, data?)` — log a message (e.g. to console)
- `buffer` — `{ add(entry), clear(), getAll() }` for storing debug entries (e.g. for later inspection)

Factories create a debug context when `debug.enabled` is true and pass it into the middleware context and resolution. Middleware can use `context.debug?.log()` to output information when debug is enabled.


## How It Works

1. **Provider or FormFactory** receives `debug` (e.g. `{ enabled: true }`).
2. **Merged config** includes debug; when enabled, a debug context is created (e.g. with `log` writing to console and a buffer).
3. **Middleware context** includes `debug`. Middleware can call `context.debug?.log('middleware', 'message', data)`.
4. **Resolution** can use debug to warn when a component is not found or when `x-custom` is set but no custom component is registered.

This gives you visibility into resolution and middleware without requiring a separate UI; you can extend the buffer or log output as needed in your app.


## Related Concepts

**Debug is configured and used across concepts:**

- **[01. Factories](./01-factories.md):** Factories pass debug into the pipeline
- **[04. Schema Resolution](./04-schema-resolution.md):** Resolution can log resolution steps when debug is enabled  
- **[05. Renderer](./05-renderer.md):** Renderers receive props after middleware (debug may have been used there)
- **[06. Middleware](./06-middleware.md):** Middleware receives `context.debug` and can log or buffer
- **[03. Provider](./03-provider.md):** Debug configured via Provider `debug` prop
- **[02. Schema Language](./02-schema-language.md):** Schema is what resolution and middleware process; debug helps trace how it is interpreted
