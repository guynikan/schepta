# Schepta

Framework-agnostic rendering engine for server-driven UI. Build dynamic forms and menus from JSON schemas with support for React, Vue, and Vanilla JavaScript.

## Features

- 🎨 **Framework Agnostic**: Works with React, Vue, and Vanilla JS
- 📝 **Dynamic Forms**: Render forms from JSON schemas
- 🔌 **Pluggable Form Management**: Use react-hook-form or any other form library
- 🎯 **Component Registry**: Register and resolve components dynamically
- 🔄 **Middleware System**: Transform props and add business logic
- ⚡ **Reactive System**: Handle declarative and imperative reactions
- 🧩 **Type Safe**: Full TypeScript support

## Showcases

### React (Vanilla)
```bash
pnpm --filter showcases-react dev
# http://localhost:3000
```


## Running Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test suite
pnpm --filter tests exec playwright test react
pnpm --filter tests exec playwright test material-ui
pnpm --filter tests exec playwright test chakra-ui
```

## Project Structure

```
schepta/
├── packages/
│   ├── core/              # Framework-agnostic core logic
│   ├── adapters/          # Framework adapters (react, vue, vanilla)
│   └── factories/         # Framework factories (react, vue, vanilla)
├── showcases/             # Showcase applications
│   ├── react/             # React showcase
│   ├── vue/               # Vue showcase
│   └── vue-vuetify/       # Vue with Vuetify showcase
└── tests/                 # E2E tests with Playwright
```

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run in development mode
pnpm dev

# Run tests
pnpm test
```

## License

MIT
