# Quick Start

**Get up and running with schepta in minutes**

This guide will walk you through setting up schepta, configuring the Provider, registering components, and creating your first form.

## What You'll Learn

- How to install and set up schepta
- How to configure the `ScheptaProvider`
- How to register components using `createComponentSpec`
- How to create your first form from a JSON schema

## Installation

First, install the necessary packages:

```bash
# Install core package
pnpm add @schepta/core

# Install React adapter and factory (for React projects)
pnpm add @schepta/adapter-react @schepta/factory-react

# Install React Hook Form (required for forms)
pnpm add react-hook-form
```

## Setting Up the Provider

The `ScheptaProvider` is the central configuration point for your application. It manages global component registrations, middleware, and context that all factories can access.

### Basic Provider Setup

```tsx
import { ScheptaProvider } from '@schepta/adapter-react';

function App() {
  return (
    <ScheptaProvider
      components={globalComponents}
      middlewares={[]}
      externalContext={{
        user: { id: 1, name: 'John Doe' },
        api: 'https://api.example.com',
      }}
      debug={{ enabled: true }}
    >
      <YourApp />
    </ScheptaProvider>
  );
}
```

### Provider Props

| Prop | Type | Description |
|------|------|-------------|
| `components` | `Record<string, ComponentSpec>` | Global component registry |
| `middlewares` | `Middleware[]` | Global middleware stack |
| `externalContext` | `object` | Shared context (user, API, etc.) |
| `debug` | `object` | Debug configuration |

## Registering Components with createComponentSpec

Components must be registered using `createComponentSpec` before they can be used in schemas. This function creates a component specification that tells schepta how to render your components.

### Component Types

schepta supports several component types:

- **`field`** - Input fields (text, select, checkbox, etc.)
- **`container`** - Container components (FormField, FormSection, etc.)
- **`content`** - Content components (titles, buttons, etc.)
- **`FormContainer`** - Root form container

### Creating Component Specs

```tsx
import { createComponentSpec } from '@schepta/core';

// Example: Simple input component
const InputText = React.forwardRef<HTMLInputElement, any>((props, ref) => {
  const { label, name, value, onChange, placeholder, ...rest } = props;
  return (
    <div>
      {label && <label htmlFor={name}>{label}</label>}
      <input
        ref={ref}
        name={name}
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        {...rest}
      />
    </div>
  );
});

// Register the component
const components = {
  InputText: createComponentSpec({
    id: 'InputText',
    type: 'field',
    factory: (props, runtime) => InputText,
  }),
};
```

### Complete Component Registration Example

```tsx
import { createComponentSpec } from '@schepta/core';
import React from 'react';
import { useFormContext } from 'react-hook-form';

// Define your components
const InputText = React.forwardRef<HTMLInputElement, any>((props, ref) => {
  const { label, name, value, onChange, placeholder, ...rest } = props;
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && <label htmlFor={name}>{label}</label>}
      <input
        ref={ref}
        name={name}
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        {...rest}
      />
    </div>
  );
});

const FormField = ({ children, ...props }: any) => {
  return <div {...props}>{children}</div>;
};

const FormSectionContainer = ({ children, ...props }: any) => {
  return <div style={{ marginBottom: '24px' }} {...props}>{children}</div>;
};

const FormSectionTitle = ({ 'x-content': content, ...props }: any) => {
  return <h2 {...props}>{content}</h2>;
};

const SubmitButton = ({ 'x-content': content, ...props }: any) => {
  const { handleSubmit } = useFormContext();
  return (
    <button
      type="button"
      onClick={() => handleSubmit(props.onSubmit)()}
      {...props}
    >
      {content || 'Submit'}
    </button>
  );
};

const FormContainer = ({ children, ...props }: any) => {
  return <form {...props}>{children}</form>;
};

// Register all components using createComponentSpec
export const globalComponents = {
  'FormContainer': createComponentSpec({
    id: 'FormContainer',
    type: 'FormContainer',
    factory: (props, runtime) => FormContainer,
  }),
  InputText: createComponentSpec({
    id: 'InputText',
    type: 'field',
    factory: (props, runtime) => InputText,
  }),
  FormField: createComponentSpec({
    id: 'FormField',
    type: 'container',
    factory: (props, runtime) => FormField,
  }),
  FormSectionContainer: createComponentSpec({
    id: 'FormSectionContainer',
    type: 'container',
    factory: (props, runtime) => FormSectionContainer,
  }),
  FormSectionTitle: createComponentSpec({
    id: 'FormSectionTitle',
    type: 'content',
    factory: (props, runtime) => FormSectionTitle,
  }),
  SubmitButton: createComponentSpec({
    id: 'SubmitButton',
    type: 'content',
    factory: (props, runtime) => SubmitButton,
  }),
};
```

## Your First Form

Now let's create a complete example combining everything:

### 1. Define Your Schema

```json
{
  "$schema": "../../packages/factories/src/schemas/form-schema.json",
  "$id": "my-first-form",
  "type": "object",
  "x-component": "FormContainer",
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

### 2. Complete React Example

```tsx
import React from 'react';
import { ScheptaProvider } from '@schepta/adapter-react';
import { FormFactory } from '@schepta/factory-react';
import { globalComponents } from './components';
import formSchema from './form-schema.json';

function App() {
  const handleSubmit = (values: any) => {
    console.log('Form submitted:', values);
  };

  return (
    <ScheptaProvider
      components={globalComponents}
      externalContext={{
        user: { id: 1, name: 'John Doe' },
        api: 'https://api.example.com',
      }}
      debug={{ enabled: true }}
    >
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>My First schepta Form</h1>
        <FormFactory
          schema={formSchema}
          onSubmit={handleSubmit}
        />
      </div>
    </ScheptaProvider>
  );
}

export default App;
```

## Next Steps

Now that you have the basics, explore more:

### Core Concepts

Learn the fundamental concepts that power schepta:

- **[01. Factories](/en-US/concepts/01-factories)** - How schemas become components
- **[02. Schema Language](/en-US/concepts/02-schema-language)** - The syntax for defining UI
- **[03. Provider](/en-US/concepts/03-provider)** - Global configuration and context
- **[04. Schema Resolution](/en-US/concepts/04-schema-resolution)** - From JSON to React/Vue
- **[05. Renderer](/en-US/concepts/05-renderer)** - The rendering engine
- **[06. Middleware](/en-US/concepts/06-middleware)** - Transforming props and behavior
- **[07. Debug System](/en-US/concepts/07-debug-system)** - Development tools

### Examples

See schepta in action with interactive examples:

- **[React Examples](/en-US/examples/react)** - React with react-hook-form
- **[React Material UI Examples](/en-US/examples/material-ui)** - React with Material UI
- **[React Chakra UI Examples](/en-US/examples/chakra-ui)** - React with Chakra UI
- **[Vue Examples](/en-US/examples/vue)** - Vue with custom form adapter
- **[Vue Vuetify Examples](/en-US/examples/vuetify)** - Vue with Vuetify Material Design

## Resources

- [GitHub Repository](https://github.com/guynikan/schepta)
