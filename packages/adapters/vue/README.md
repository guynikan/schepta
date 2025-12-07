# @schepta/adapter-vue

Vue adapter for schepta. Provides Vue 3-specific runtime adapter and form adapter.

## Installation

```bash
npm install @schepta/adapter-vue vue
```

## Peer Dependencies

- `vue` >= 3.0.0

## Usage

```typescript
import { VueRuntimeAdapter } from '@schepta/adapter-vue';
import { ref } from 'vue';

const runtime = new VueRuntimeAdapter();
const formAdapter = {
  getValues: () => formData.value,
  setValue: (name, value) => { /* ... */ },
  // ...
};

// Use with FormFactory
```

## Documentation

For complete documentation, visit [https://schepta.dev](https://schepta.dev)

## License

MIT

