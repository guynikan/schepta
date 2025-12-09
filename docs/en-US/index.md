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

- **[01. Factories](/en-US/concepts/01-factories)** - How schemas become components
- **[02. Schema Language](/en-US/concepts/02-schema-language)** - The syntax for defining UI
- **[03. Provider](/en-US/concepts/03-provider)** - Global configuration and context
- **[04. Schema Resolution](/en-US/concepts/04-schema-resolution)** - From JSON to React/Vue
- **[05. Renderer](/en-US/concepts/05-renderer)** - The rendering engine
- **[06. Middleware](/en-US/concepts/06-middleware)** - Transforming props and behavior
- **[07. Debug System](/en-US/concepts/07-debug-system)** - Development tools

### Examples

See schepta in action with interactive examples:

- **[React Examples](/en-US/examples/react)** - React with react-hook-form
- **[React Material UI Examples](/en-US/examples/material-ui)** - React with Material UI
- **[React Chakra UI Examples](/en-US/examples/chakra-ui)** - React with Chakra UI
- **[Vue Examples](/en-US/examples/vue)** - Vue with custom form adapter
- **[Vue Vuetify Examples](/en-US/examples/vuetify)** - Vue with Vuetify Material Design

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

