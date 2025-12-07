# React Material UI Examples

Interactive examples of Spectra forms using React with Material UI components.

## Simple Form

A basic form with first name and last name fields using Material UI components.

<CodeSandboxEmbed
  sandbox-id="schepta-react-material-ui-simple"
  title="React Material UI Simple Form Example"
  height="600px"
/>

### Schema

The same schema structure as the [React example](/examples/react), but rendered with Material UI components.

### Usage

```tsx
import { FormProvider, useForm } from 'react-hook-form';
import { FormFactory } from '@schepta/factory-react';
import { TextField, Button, Grid } from '@mui/material';
import { createComponentSpec } from '@schepta/core';

const components = {
  InputText: createComponentSpec({
    id: 'InputText',
    type: 'field',
    factory: (props, runtime) => TextField,
  }),
  // ... more Material UI components
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

A more complex form with multiple field types using Material UI components.

<CodeSandboxEmbed
  sandbox-id="schepta-react-material-ui-complex"
  title="React Material UI Complex Form Example"
  height="700px"
/>

### Features

- **Material Design**: Material UI's Material Design components
- **Responsive Grid**: Material UI's `Grid` system for responsive layouts
- **Form Validation**: Integrated with `react-hook-form` and Material UI validation
- **Consistent Styling**: Material Design theme applied automatically

