# @spectra/factory-react

React factory for Spectra. Provides `FormFactory` component for rendering forms from JSON schemas in React applications.

## Installation

```bash
npm install @spectra/factory-react @spectra/core @spectra/adapter-react react react-dom react-hook-form
```

## Peer Dependencies

- `react` >= 18.0.0
- `react-dom` >= 18.0.0
- `react-hook-form` >= 7.52.2

## Usage

```tsx
import { FormProvider, useForm } from 'react-hook-form';
import { FormFactory } from '@spectra/factory-react';
import { createComponentSpec } from '@spectra/core';

const components = {
  InputText: createComponentSpec({
    id: 'InputText',
    type: 'field',
    factory: (props, runtime) => InputText,
  }),
};

function App() {
  const methods = useForm();
  
  return (
    <FormProvider {...methods}>
      <FormFactory
        schema={formSchema}
        components={components}
        onSubmit={(values) => console.log(values)}
      />
    </FormProvider>
  );
}
```

## Documentation

For complete documentation and examples, visit [https://spectra.dev](https://spectra.dev)

## License

MIT

