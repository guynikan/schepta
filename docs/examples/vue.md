# Vue Examples

Interactive examples of schepta forms using Vue 3.

> 🚧 **Coming Soon** - Vue examples are being prepared and will be available soon!

## Simple Form

A basic form with first name and last name fields.

<CodeSandboxEmbed
  sandbox-id="schepta-vue-simple"
  title="Vue Simple Form Example"
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

```vue
<template>
  <FormFactoryComponent />
</template>

<script setup lang="ts">
import { createFormFactory } from '@schepta/factory-vue';
import { components } from './components/InputComponents';
import simpleFormSchema from './fixtures/simple-form.json';

const handleSubmit = (values: any) => {
  console.log('Form submitted:', values);
};

const FormFactoryComponent = createFormFactory({
  schema: simpleFormSchema,
  components,
  onSubmit: handleSubmit,
});
</script>
```

## Complex Form

A more complex form with multiple field types including email, phone, select, textarea, number, date, and checkbox.

<CodeSandboxEmbed
  sandbox-id="schepta-vue-complex"
  title="Vue Complex Form Example"
  height="700px"
/>

### Schema

See the [complex form schema](/fixtures/complex-form.json) for the full JSON structure.

### Features

- **Multiple Input Types**: Text, email, phone, select, textarea, number, date, checkbox
- **Grid Layout**: Responsive grid layout with `FormSectionGroup`
- **Validation**: Required field validation
- **Form State Management**: Custom Vue form adapter

## Integration with UI Libraries

schepta works seamlessly with popular Vue UI libraries:

- **Vuetify**: See [Vuetify example](/examples/vuetify)

