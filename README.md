# Schepta

**Framework-agnostic rendering engine for server-driven UI**

Build dynamic forms and UIs from JSON schemas with full support for React, Vue, and Vanilla JavaScript. Schepta provides a powerful, type-safe foundation for creating flexible, schema-driven applications.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![License: SNCL](https://img.shields.io/badge/License-Non--Commercial-orange.svg)](./LICENSE)
[![Tests](https://img.shields.io/badge/tests-26%20passing-brightgreen)](./tests)

## ✨ Features

- 🎨 **Framework Agnostic Core**: Single source of truth that works across React, Vue, and Vanilla JS
- 📝 **Schema-Driven Forms**: Define complex forms using JSON schemas with validation
- 🔌 **Pluggable Integrations**: Built-in support for react-hook-form, Formik, and native form management
- 🎯 **Dynamic Component Registry**: Register and resolve components at runtime
- 🔄 **Middleware System**: Transform schemas and add business logic with composable middlewares
- 🧩 **Custom Components**: Easily integrate your own components with full framework support
- ⚡ **Reactive System**: Handle both declarative and imperative state management
- 🎭 **Conditional Logic**: Show/hide fields based on form values using template expressions
- 🛡️ **Type Safe**: Full TypeScript support with strict type checking
- 🧪 **Well Tested**: Comprehensive E2E test suite with Playwright

## 🏗️ Architecture

Schepta follows a three-layer architecture:

```
┌─────────────────────────────────────┐
│         Your Application            │
│   (React, Vue, Vanilla JS)          │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│          Factories Layer            │
│  Framework-specific form factories  │
│  • @schepta/factory-react           │
│  • @schepta/factory-vue             │
│  • @schepta/factory-vanilla         │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│         Adapters Layer              │
│  Framework-specific runtime logic   │
│  • @schepta/adapter-react           │
│  • @schepta/adapter-vue             │
│  • @schepta/adapter-vanilla         │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│           Core Layer                │
│  Framework-agnostic engine          │
│  • @schepta/core                    │
│  • Component orchestration          │
│  • Middleware system                │
│  • Schema validation                │
└─────────────────────────────────────┘
```

## 🚀 Quick Start

### Installation

```bash
# Using pnpm (recommended)
pnpm install

# Build all packages
pnpm build
```

### Usage Examples

#### React

```tsx
import { FormFactory } from '@schepta/factory-react';
import type { FormSchema } from '@schepta/core';

const schema: FormSchema = {
  type: 'object',
  properties: {
    firstName: {
      type: 'string',
      'x-component': 'InputText',
      'x-component-props': {
        label: 'First Name',
        placeholder: 'Enter your first name'
      }
    }
  }
};

function MyForm() {
  const handleSubmit = (values: any) => {
    console.log('Form submitted:', values);
  };

  return (
    <FormFactory
      schema={schema}
      onSubmit={handleSubmit}
    />
  );
}
```

#### Vue

```vue
<script setup lang="ts">
import { FormFactory } from '@schepta/factory-vue';
import type { FormSchema } from '@schepta/core';

const schema: FormSchema = {
  type: 'object',
  properties: {
    firstName: {
      type: 'string',
      'x-component': 'InputText',
      'x-component-props': {
        label: 'First Name',
        placeholder: 'Enter your first name'
      }
    }
  }
};

const handleSubmit = (values: any) => {
  console.log('Form submitted:', values);
};
</script>

<template>
  <FormFactory
    :schema="schema"
    :on-submit="handleSubmit"
  />
</template>
```

#### Vanilla JavaScript

```typescript
import { createFormFactory } from '@schepta/factory-vanilla';
import type { FormSchema } from '@schepta/core';

const schema: FormSchema = {
  type: 'object',
  properties: {
    firstName: {
      type: 'string',
      'x-component': 'InputText',
      'x-component-props': {
        label: 'First Name',
        placeholder: 'Enter your first name'
      }
    }
  }
};

const container = document.getElementById('form-container');

const factory = createFormFactory({
  schema,
  container,
  onSubmit: (values) => {
    console.log('Form submitted:', values);
  }
});
```

## 🎯 Core Concepts

### Schema-Driven UI

Define your forms using JSON schemas with custom extensions:

- `x-component`: Specify which component to render
- `x-component-props`: Pass props to the component
- `x-ui`: UI-specific configuration (order, visibility, etc.)
- `x-content`: Static content for non-input components

### Custom Components

Extend Schepta with your own components:

```typescript
// React
const customComponents = {
  MyCustomInput: createComponentSpec({
    id: 'MyCustomInput',
    type: 'field',
    component: () => MyCustomInputComponent
  })
};

<FormFactory
  schema={schema}
  customComponents={customComponents}
/>
```

### Middleware System

Transform schemas and add business logic:

```typescript
const myMiddleware: MiddlewareFn = (node, context) => {
  // Transform node based on context
  if (context.formValues.userType === 'admin') {
    node.props.disabled = false;
  }
  return node;
};

<FormFactory
  schema={schema}
  middlewares={[myMiddleware]}
/>
```

### Template Expressions

Use JEXL expressions for conditional logic:

```json
{
  "properties": {
    "showField": {
      "x-ui": {
        "visible": "{{formValues.userType == 'admin'}}"
      }
    }
  }
}
```

## 📦 Packages

### Core

- **@schepta/core**: Framework-agnostic rendering engine
  - Component orchestration
  - Middleware system
  - Schema validation (AJV)
  - Template expressions (JEXL)

### Adapters

Framework-specific runtime implementations:

- **@schepta/adapter-react**: React runtime with hooks
- **@schepta/adapter-vue**: Vue runtime with Composition API
- **@schepta/adapter-vanilla**: Vanilla JS runtime with EventEmitter

### Factories

Complete form solutions:

- **@schepta/factory-react**: React form factory with default components
- **@schepta/factory-vue**: Vue form factory with default components
- **@schepta/factory-vanilla**: Vanilla JS form factory with default components

## 🎪 Live Examples

Visit **[schepta.org](https://schepta.org)** to see Schepta in action with live, interactive examples:

- **React Basic**: Native Schepta forms with custom components
- **React + Material UI**: Integration with MUI components
- **React + Chakra UI**: Integration with Chakra UI
- **React Hook Form**: Integration with react-hook-form
- **Formik**: Integration with Formik
- **Vue Basic**: Native Schepta forms with custom components
- **Vue + Vuetify**: Integration with Vuetify
- **Vanilla JS**: Pure JavaScript implementation

## 🧪 Testing

Comprehensive E2E test suite using Playwright:

```bash
# Run all E2E tests (26 tests)
pnpm test:e2e

# Run specific framework tests
npx playwright test tests/e2e/react.spec.ts
npx playwright test tests/e2e/vue.spec.ts
npx playwright test tests/e2e/vanilla.spec.ts

# Run with UI mode
pnpm test:e2e:ui

# Run unit tests
pnpm test
```

### Test Coverage

- ✅ React: 11 E2E tests (including RHF and Formik integrations)
- ✅ Vue: 8 E2E tests
- ✅ Vanilla: 7 E2E tests

## 📚 Documentation

Full documentation is available at **[schepta.org](https://schepta.org)**

Documentation includes:
- 📖 Getting Started guides
- 🔧 API reference
- 🏗️ Architecture overview
- 🔌 Integration guides
- 📝 Examples and recipes
- 🎯 Best practices

## 🛠️ Development

### Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run type checking
pnpm type-check

# Run linting
pnpm lint
```

### Package Development

```bash
# Watch mode for a specific package
cd packages/core && pnpm dev
cd packages/adapters/react && pnpm dev
cd packages/factories/react && pnpm dev

# Clean build artifacts
pnpm clean
```

For detailed contribution guidelines, visit the [documentation](https://schepta.org).

## 📁 Project Structure

```
schepta/
├── packages/
│   ├── core/                    # Framework-agnostic core
│   ├── adapters/
│   │   ├── react/              # React adapter
│   │   ├── vue/                # Vue adapter
│   │   └── vanilla/            # Vanilla JS adapter
│   └── factories/
│       ├── react/              # React form factory
│       ├── vue/                # Vue form factory
│       └── vanilla/            # Vanilla JS form factory
├── showcases/                   # Example applications
│   ├── src/
│   │   ├── frameworks/         # React & Vue showcases
│   │   │   ├── react/         # React examples (basic, MUI, Chakra, RHF, Formik)
│   │   │   └── vue/           # Vue examples (basic, Vuetify)
│   │   └── vanilla/           # Vanilla JS examples
│   └── public/                # Static assets
├── tests/                      # E2E tests with Playwright
│   ├── e2e/                   # Test specs
│   └── playwright.config.ts   # Playwright configuration
├── instances/                  # Shared schema instances
│   └── form/                  # Form schemas
├── docs/                       # Documentation site (VitePress)
└── scripts/                    # Build and publish scripts
```

## 🔧 Integration Examples

### React Hook Form

```tsx
import { FormFactory } from '@schepta/factory-react';
import { useForm } from 'react-hook-form';

function RHFForm() {
  const methods = useForm();
  
  return (
    <FormFactory
      schema={schema}
      renderers={{
        field: createRHFFieldRenderer(methods)
      }}
      onSubmit={methods.handleSubmit(onSubmit)}
    />
  );
}
```

### Material UI

```tsx
import { FormFactory } from '@schepta/factory-react';
import { TextField, Select } from '@mui/material';

const muiComponents = {
  InputText: createComponentSpec({
    id: 'InputText',
    type: 'field',
    component: () => ({ label, ...props }) => (
      <TextField label={label} {...props} />
    )
  })
};

<FormFactory
  schema={schema}
  components={muiComponents}
/>
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

**Schepta Non-Commercial License (SNCL)**

Schepta is free to use for:
- ✅ Personal projects
- ✅ Educational purposes
- ✅ Research and academic projects
- ✅ Non-profit organizations
- ✅ Open-source projects

**Commercial use requires a separate license.** 

For commercial licensing inquiries, please contact us at: https://github.com/guynikan/schepta

See [LICENSE](./LICENSE) for full terms.

---

**Built with ❤️ using TypeScript, Turbo, and PNPM**
