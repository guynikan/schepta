# Inicio Rápido

**Ponte en marcha con schepta en minutos**

Esta guía te llevará paso a paso para configurar schepta, configurar el Provider, registrar componentes y crear tu primer formulario.

## Lo que Aprenderás

- Cómo instalar y configurar schepta
- Cómo configurar el `ScheptaProvider`
- Cómo registrar componentes usando `createComponentSpec`
- Cómo crear tu primer formulario desde un schema JSON

## Instalación

Primero, instala los paquetes necesarios:

```bash
# Instalar paquete core
pnpm add @schepta/core

# Instalar adaptador y factory de React (para proyectos React)
pnpm add @schepta/adapter-react @schepta/factory-react

# Instalar React Hook Form (requerido para formularios)
pnpm add react-hook-form
```

## Configuración del Provider

El `ScheptaProvider` es el punto central de configuración para tu aplicación. Gestiona los registros globales de componentes, middleware y contexto que todas las factories pueden acceder.

### Configuración Básica del Provider

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

### Props del Provider

| Prop | Tipo | Descripción |
|------|------|-------------|
| `components` | `Record<string, ComponentSpec>` | Registro global de componentes |
| `middlewares` | `Middleware[]` | Pila global de middleware |
| `externalContext` | `object` | Contexto compartido (usuario, API, etc.) |
| `debug` | `object` | Configuración de depuración |

## Registrando Componentes con createComponentSpec

Los componentes deben registrarse usando `createComponentSpec` antes de poder usarse en schemas. Esta función crea una especificación de componente que le dice a schepta cómo renderizar tus componentes.

### Tipos de Componentes

schepta soporta varios tipos de componentes:

- **`field`** - Campos de entrada (texto, select, checkbox, etc.)
- **`container`** - Componentes contenedores (FormField, FormSection, etc.)
- **`content`** - Componentes de contenido (títulos, botones, etc.)
- **`FormContainer`** - Contenedor raíz del formulario

### Creando Especificaciones de Componentes

```tsx
import { createComponentSpec } from '@schepta/core';

// Ejemplo: Componente de entrada simple
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

// Registrar el componente
const components = {
  InputText: createComponentSpec({
    id: 'InputText',
    type: 'field',
    factory: (props, runtime) => InputText,
  }),
};
```

### Ejemplo Completo de Registro de Componentes

```tsx
import { createComponentSpec } from '@schepta/core';
import React from 'react';
import { useFormContext } from 'react-hook-form';

// Define tus componentes
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

// Registrar todos los componentes usando createComponentSpec
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

## Tu Primer Formulario

Ahora vamos a crear un ejemplo completo combinando todo:

### 1. Define tu Schema

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

### 2. Ejemplo Completo de React

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
        <h1>Mi Primer Formulario schepta</h1>
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

## Próximos Pasos

Ahora que tienes lo básico, explora más:

### Conceptos Fundamentales

Aprende los conceptos fundamentales que impulsan schepta:

- **[01. Factories](/es-ES/concepts/01-factories)** - Cómo los schemas se convierten en componentes
- **[02. Schema Language](/es-ES/concepts/02-schema-language)** - La sintaxis para definir UI
- **[03. Provider](/es-ES/concepts/03-provider)** - Configuración global y contexto
- **[04. Schema Resolution](/es-ES/concepts/04-schema-resolution)** - De JSON a React/Vue
- **[05. Renderer](/es-ES/concepts/05-renderer)** - El motor de renderizado
- **[06. Middleware](/es-ES/concepts/06-middleware)** - Transformando props y comportamiento
- **[07. Debug System](/es-ES/concepts/07-debug-system)** - Herramientas de desarrollo

## Recursos

- [Repositorio GitHub](https://github.com/guynikan/schepta)

