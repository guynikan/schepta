# React Examples

Interactive examples of Spectra forms using React and `react-hook-form`.

## Simple Form

A basic form with first name and last name fields.

<CodeSandboxEmbed
  sandbox-id="spectra-react-simple"
  title="React Simple Form Example"
  height="600px"
/>

### Schema

```json
{
  "$id": "simple-form",
  "type": "object",
  "x-component": "form-container",
  "properties": {
    "personalInfo": {
      "type": "object",
      "x-component": "FormSectionContainer",
      "properties": {
        "title": {
          "type": "object",
          "x-component": "FormSectionTitle",
          "x-content": "Personal Information"
        },
        "fields": {
          "type": "object",
          "x-component": "FormSectionGroupContainer",
          "properties": {
            "nameGroup": {
              "type": "object",
              "x-component": "FormSectionGroup",
              "x-component-props": {
                "columns": "1fr 1fr"
              },
              "properties": {
                "firstName": {
                  "type": "object",
                  "x-component": "FormField",
                  "properties": {
                    "firstName": {
                      "type": "string",
                      "x-component": "InputText",
                      "x-ui": {
                        "label": "First Name",
                        "placeholder": "Enter your first name"
                      },
                      "x-rules": {
                        "required": true
                      }
                    }
                  }
                },
                "lastName": {
                  "type": "object",
                  "x-component": "FormField",
                  "properties": {
                    "lastName": {
                      "type": "string",
                      "x-component": "InputText",
                      "x-ui": {
                        "label": "Last Name",
                        "placeholder": "Enter your last name"
                      },
                      "x-rules": {
                        "required": true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "submit": {
      "type": "object",
      "x-component": "SubmitButton",
      "x-content": "Submit Form"
    }
  }
}
```

### Usage

```tsx
import { FormProvider, useForm } from 'react-hook-form';
import { FormFactory } from '@spectra/factory-react';
import { createComponentSpec } from '@spectra/core';

const components = {
  'form-container': createComponentSpec({
    id: 'form-container',
    type: 'form-container',
    factory: (props, runtime) => FormContainer,
  }),
  InputText: createComponentSpec({
    id: 'InputText',
    type: 'field',
    factory: (props, runtime) => InputText,
  }),
  // ... more components
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

A more complex form with multiple field types including email, phone, select, textarea, number, date, and checkbox.

<CodeSandboxEmbed
  sandbox-id="spectra-react-complex"
  title="React Complex Form Example"
  height="700px"
/>

### Schema

See the [complex form schema](/fixtures/complex-form.json) for the full JSON structure.

### Features

- **Multiple Input Types**: Text, email, phone, select, textarea, number, date, checkbox
- **Grid Layout**: Responsive grid layout with `FormSectionGroup`
- **Validation**: Required field validation
- **Form Submission**: Integrated with `react-hook-form`'s `handleSubmit`

## Integration with UI Libraries

Spectra works seamlessly with popular React UI libraries:

- **Material UI**: See [Material UI example](/examples/material-ui)
- **Chakra UI**: See [Chakra UI example](/examples/chakra-ui)

