# @spectra/adapter-vue

Vue adapter for Spectra. Provides Vue 3-specific runtime adapter and form adapter.

## Installation

```bash
npm install @spectra/adapter-vue vue
```

## Peer Dependencies

- `vue` >= 3.0.0

## Usage

```typescript
import { VueRuntimeAdapter } from '@spectra/adapter-vue';
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

For complete documentation, visit [https://spectra.dev](https://spectra.dev)

## License

MIT

