# @schepta/factory-vanilla

Vanilla JavaScript factory for Spectra. Provides `FormFactory` for rendering forms from JSON schemas without any framework dependencies.

## Installation

```bash
npm install @schepta/factory-vanilla @schepta/core @schepta/adapter-vanilla
```

## Usage

```typescript
import { FormFactory } from '@schepta/factory-vanilla';
import { createComponentSpec } from '@schepta/core';

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

For complete documentation and examples, visit [https://schepta.dev](https://schepta.dev)

## License

MIT

