# @spectra/factory-vanilla

Vanilla JavaScript factory for Spectra. Provides `FormFactory` for rendering forms from JSON schemas without any framework dependencies.

## Installation

```bash
npm install @spectra/factory-vanilla @spectra/core @spectra/adapter-vanilla
```

## Usage

```typescript
import { FormFactory } from '@spectra/factory-vanilla';
import { createComponentSpec } from '@spectra/core';

const components = {
  InputText: createComponentSpec({
    id: 'InputText',
    type: 'field',
    factory: (props, runtime) => {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = props.value || '';
      input.addEventListener('input', (e) => {
        props.onChange?.(e.target.value);
      });
      return input;
    },
  }),
};

const factory = new FormFactory({
  schema: formSchema,
  components,
  onSubmit: (values) => console.log(values),
});

// Render to DOM
const container = document.getElementById('app');
factory.render(container);
```

## Documentation

For complete documentation and examples, visit [https://spectra.dev](https://spectra.dev)

## License

MIT

