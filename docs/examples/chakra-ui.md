# React Chakra UI Examples

Interactive examples of Spectra forms using React with Chakra UI components.

## Simple Form

A basic form with first name and last name fields using Chakra UI components.

<CodeSandboxEmbed
  sandbox-id="spectra-react-chakra-ui-simple"
  title="React Chakra UI Simple Form Example"
  height="600px"
/>

### Schema

The same schema structure as the [React example](/examples/react), but rendered with Chakra UI components.

### Usage

```tsx
import { FormProvider, useForm } from 'react-hook-form';
import { FormFactory } from '@spectra/factory-react';
import { Input, Button, Grid } from '@chakra-ui/react';
import { createComponentSpec } from '@spectra/core';

const components = {
  InputText: createComponentSpec({
    id: 'InputText',
    type: 'field',
    factory: (props, runtime) => Input,
  }),
  // ... more Chakra UI components
};

function App() {
  const methods = useForm();
  
  const handleSubmit = (values: any) => {
    console.log('Form submitted:', values);
  };

  return (
    <FormProvider {...methods}>
      <FormFactory
        schema={simpleFormSchema}
        components={components}
        onSubmit={handleSubmit}
      />
    </FormProvider>
  );
}
```

## Complex Form

A more complex form with multiple field types using Chakra UI components.

<CodeSandboxEmbed
  sandbox-id="spectra-react-chakra-ui-complex"
  title="React Chakra UI Complex Form Example"
  height="700px"
/>

### Features

- **Chakra Design System**: Chakra UI's accessible component library
- **Responsive Grid**: Chakra UI's `Grid` system for responsive layouts
- **Form Validation**: Integrated with `react-hook-form` and Chakra UI validation
- **Theme Customization**: Easy theme customization with Chakra UI

