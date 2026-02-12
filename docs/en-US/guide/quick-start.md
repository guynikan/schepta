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
```

FormFactory uses native React state by default, so **no form library is required** for your first form. To integrate with React Hook Form or Formik later, see the [React Showcase](/en-US/showcases/react) for examples.

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
| `components` | `Record<string, ComponentSpec>` | Global component registry (optional) |
| `customComponents` | `Record<string, ComponentSpec>` | Custom components keyed by schema key (optional) |
| `renderers` | `Partial<Record<ComponentType, RendererFn>>` | Custom renderers per component type (optional) |
| `middlewares` | `Middleware[]` | Global middleware stack |
| `externalContext` | `object` | Shared context (user, API, etc.) |
| `debug` | `object` | Debug configuration |

## Registering Components with createComponentSpec

Components must be registered using `createComponentSpec` before they can be used in schemas. This function creates a component specification that tells schepta how to render your components.

### Component Types

schepta supports several component types:

- **`field`** - Input fields (text, select, checkbox, etc.)
- **`container`** - Container components (FormField, FormSection, FormContainer, etc.)
- **`content`** - Content components (titles, etc.)
- **`button`** - Button components (e.g. SubmitButton)

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
    component: (props, runtime) => InputText,
  }),
};
```

### Complete Component Registration Example

```tsx
import { createComponentSpec } from '@schepta/core';
import React from 'react';
import { useScheptaFormAdapter } from '@schepta/factory-react';

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

const FormSectionGroup = ({ children, ...props }: any) => {
  return <div style={{ display: 'grid', gap: '16px' }} {...props}>{children}</div>;
};

const FormSectionGroupContainer = ({ children, ...props }: any) => {
  return <div {...props}>{children}</div>;
};

const SubmitButton = ({ 'x-content': content, ...props }: any) => {
  return (
    <button type="submit" {...props}>
      {content || 'Submit'}
    </button>
  );
};

const FormContainer = ({ children, onSubmit, ...props }: any) => {
  const adapter = useScheptaFormAdapter();
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) adapter.handleSubmit(onSubmit)();
  };
  return (
    <form onSubmit={handleFormSubmit} {...props}>
      {children}
    </form>
  );
};

// Register all components using createComponentSpec
export const globalComponents = {
  FormContainer: createComponentSpec({
    id: 'FormContainer',
    type: 'container',
    component: (props, runtime) => FormContainer,
  }),
  InputText: createComponentSpec({
    id: 'InputText',
    type: 'field',
    component: (props, runtime) => InputText,
  }),
  FormField: createComponentSpec({
    id: 'FormField',
    type: 'container',
    component: (props, runtime) => FormField,
  }),
  FormSectionContainer: createComponentSpec({
    id: 'FormSectionContainer',
    type: 'container',
    component: (props, runtime) => FormSectionContainer,
  }),
  FormSectionTitle: createComponentSpec({
    id: 'FormSectionTitle',
    type: 'content',
    component: (props, runtime) => FormSectionTitle,
  }),
  FormSectionGroup: createComponentSpec({
    id: 'FormSectionGroup',
    type: 'container',
    component: (props, runtime) => FormSectionGroup,
  }),
  FormSectionGroupContainer: createComponentSpec({
    id: 'FormSectionGroupContainer',
    type: 'container',
    component: (props, runtime) => FormSectionGroupContainer,
  }),
  SubmitButton: createComponentSpec({
    id: 'SubmitButton',
    type: 'button',
    component: (props, runtime) => SubmitButton,
  }),
};
```

## Your First Form

Now let's create a complete example combining everything.

### Minimal Example (Using Defaults)

FormFactory ships with built-in components, so you can render a form with just a schema and `onSubmit`—no custom registration required:

```tsx
import React from 'react';
import { ScheptaProvider } from '@schepta/adapter-react';
import { FormFactory } from '@schepta/factory-react';
import formSchema from './form-schema.json';

function App() {
  const handleSubmit = (values: any) => {
    console.log('Form submitted:', values);
  };

  return (
    <ScheptaProvider>
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>My First schepta Form</h1>
        <FormFactory schema={formSchema} onSubmit={handleSubmit} />
      </div>
    </ScheptaProvider>
  );
}

export default App;
```

### 1. Define Your Schema

You can use `x-component-props` or `x-ui` for field labels and placeholders. The `$schema` property is optional (useful for IDE validation when working inside the monorepo).

```json
{
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
                      "x-component-props": {
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

### 2. Complete React Example (With Custom Components)

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

## Resources

- [React Showcase](/en-US/showcases/react) - Examples with React Hook Form and Formik
- [GitHub Repository](https://github.com/guynikan/schepta)
