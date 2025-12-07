# schepta

**Framework-agnostic rendering engine for server-driven UI**

schepta is a powerful, framework-agnostic rendering engine that transforms JSON schemas into fully functional UI components. It works seamlessly with React, Vue, and vanilla JavaScript, providing a unified approach to server-driven UI.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm --filter docs dev
```

## 📚 Documentation

### Core Concepts

Learn the fundamental concepts that power schepta:

- **[01. Factories](./concepts/01-factories.md)** - How schemas become components
- **[02. Schema Language](./concepts/02-schema-language.md)** - The syntax for defining UI
- **[03. Provider](./concepts/03-provider.md)** - Global configuration and context
- **[04. Schema Resolution](./concepts/04-schema-resolution.md)** - From JSON to React/Vue
- **[05. Renderer](./concepts/05-renderer.md)** - The rendering engine
- **[06. Middleware](./concepts/06-middleware.md)** - Transforming props and behavior
- **[07. Debug System](./concepts/07-debug-system.md)** - Development tools

### Examples

See schepta in action with interactive examples:

- **[React Examples](./examples/react.md)** - React with react-hook-form
- **[React Material UI Examples](./examples/material-ui.md)** - React with Material UI
- **[React Chakra UI Examples](./examples/chakra-ui.md)** - React with Chakra UI
- **[Vue Examples](./examples/vue.md)** - Vue with custom form adapter
- **[Vue Vuetify Examples](./examples/vuetify.md)** - Vue with Vuetify Material Design

## 🎯 Key Features

- **Framework Agnostic**: Works with React, Vue, and vanilla JavaScript
- **Schema-Driven**: Define UI using JSON schemas
- **Type-Safe**: Full TypeScript support
- **Extensible**: Custom components, renderers, and middleware
- **Developer Experience**: Built-in debug tools and validation

## 💡 Example

```json
{
  "type": "object",
  "x-component": "form-container",
  "properties": {
    "email": {
      "type": "string",
      "x-component": "InputText",
      "x-ui": {
        "label": "Email",
        "placeholder": "Enter your email"
      }
    }
  }
}
```

This simple schema becomes a fully functional form with validation, state management, and submission handling.

## 🔗 Resources

- [GitHub Repository](https://github.com/guynikan/schepta)

