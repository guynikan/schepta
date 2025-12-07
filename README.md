# Spectra

Framework-agnostic rendering engine for server-driven UI. Build dynamic forms and menus from JSON schemas that work with React, Vue, or vanilla JavaScript.

## Architecture

Spectra is built with a core-agnostic architecture:

- **Core**: Framework-agnostic rendering logic
- **Adapters**: Framework-specific implementations (React, Vue, Vanilla)
- **Factories**: High-level APIs for each framework

## Packages

- `@spectra/core` - Core agnostic engine
- `@spectra/adapter-react` - React adapter
- `@spectra/adapter-vue` - Vue adapter
- `@spectra/adapter-vanilla` - Vanilla JS adapter
- `@spectra/factory-react` - React factories
- `@spectra/factory-vue` - Vue factories
- `@spectra/factory-vanilla` - Vanilla JS factories

## Quick Start

### React

```tsx
import { FormFactory } from '@spectra/factory-react';
import { createComponentSpec } from '@spectra/core';

const components = {
  InputText: createComponentSpec({
    id: 'InputText',
    type: 'field',
    factory: (props, runtime) => <input {...props} />,
  }),
};

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      'x-component': 'InputText',
    },
  },
};

<FormFactory schema={schema} components={components} />
```

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e
```

## License

Proprietary

