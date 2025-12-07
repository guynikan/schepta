# @spectra/adapter-react

React adapter for Spectra. Provides React-specific runtime adapter and form adapter integration with `react-hook-form`.

## Installation

```bash
npm install @spectra/adapter-react react react-dom react-hook-form
```

## Peer Dependencies

- `react` >= 18.0.0
- `react-dom` >= 18.0.0

## Usage

```typescript
import { ReactRuntimeAdapter } from '@spectra/adapter-react';
import { useForm } from 'react-hook-form';

const runtime = new ReactRuntimeAdapter();
const formAdapter = useForm();

// Use with FormFactory
```

## Documentation

For complete documentation, visit [https://spectra.dev](https://spectra.dev)

## License

MIT

