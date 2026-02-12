# Início Rápido

**Comece a usar o schepta em minutos**

Este guia vai te mostrar como configurar o schepta, configurar o Provider, registrar componentes e criar seu primeiro formulário.

## O Que Você Vai Aprender

- Como instalar e configurar o schepta
- Como configurar o `ScheptaProvider`
- Como registrar componentes usando `createComponentSpec`
- Como criar seu primeiro formulário a partir de um schema JSON

## Instalação

Primeiro, instale os pacotes necessários:

```bash
# Instalar pacote core
pnpm add @schepta/core

# Instalar adapter e factory React (para projetos React)
pnpm add @schepta/adapter-react @schepta/factory-react
```

O FormFactory usa estado nativo do React por padrão, então **nenhuma biblioteca de formulário é obrigatória** para o primeiro formulário. Para integrar com React Hook Form ou Formik depois, veja o [Showcase React](/pt-BR/showcases/react).

## Configurando o Provider

O `ScheptaProvider` é o ponto central de configuração da sua aplicação. Ele gerencia registros globais de componentes, middleware e contexto que todas as factories podem acessar.

### Configuração Básica do Provider

```tsx
import { ScheptaProvider } from '@schepta/adapter-react';

function App() {
  return (
    <ScheptaProvider
      components={globalComponents}
      middlewares={[]}
      externalContext={{
        user: { id: 1, name: 'João Silva' },
        api: 'https://api.exemplo.com',
      }}
      debug={{ enabled: true }}
    >
      <SuaApp />
    </ScheptaProvider>
  );
}
```

### Props do Provider

| Prop | Tipo | Descrição |
|------|------|-------------|
| `components` | `Record<string, ComponentSpec>` | Registro global de componentes (opcional) |
| `customComponents` | `Record<string, ComponentSpec>` | Componentes customizados por chave do schema (opcional) |
| `renderers` | `Partial<Record<ComponentType, RendererFn>>` | Renderers customizados por tipo de componente (opcional) |
| `middlewares` | `Middleware[]` | Stack global de middleware |
| `externalContext` | `object` | Contexto compartilhado (usuário, API, etc.) |
| `debug` | `object` | Configuração de debug |

## Registrando Componentes com createComponentSpec

Componentes devem ser registrados usando `createComponentSpec` antes de poderem ser usados em schemas. Esta função cria uma especificação de componente que diz ao schepta como renderizar seus componentes.

### Tipos de Componentes

O schepta suporta vários tipos de componentes:

- **`field`** - Campos de entrada (texto, select, checkbox, etc.)
- **`container`** - Componentes container (FormField, FormSection, FormContainer, etc.)
- **`content`** - Componentes de conteúdo (títulos, etc.)
- **`button`** - Componentes de botão (ex.: SubmitButton)

### Criando Component Specs

```tsx
import { createComponentSpec } from '@schepta/core';

// Exemplo: Componente de input simples
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

// Registrar o componente
const components = {
  InputText: createComponentSpec({
    id: 'InputText',
    type: 'field',
    component: (props, runtime) => InputText,
  }),
};
```

### Exemplo Completo de Registro de Componentes

```tsx
import { createComponentSpec } from '@schepta/core';
import React from 'react';
import { useScheptaFormAdapter } from '@schepta/factory-react';

// Definir seus componentes
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
      {content || 'Enviar'}
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

// Registrar todos os componentes usando createComponentSpec
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

## Seu Primeiro Formulário

Agora vamos criar um exemplo completo combinando tudo.

### Exemplo Mínimo (Usando os Padrões)

O FormFactory já inclui componentes built-in, então você pode renderizar um formulário apenas com um schema e `onSubmit`—sem registro customizado:

```tsx
import React from 'react';
import { ScheptaProvider } from '@schepta/adapter-react';
import { FormFactory } from '@schepta/factory-react';
import formSchema from './form-schema.json';

function App() {
  const handleSubmit = (values: any) => {
    console.log('Formulário enviado:', values);
  };

  return (
    <ScheptaProvider>
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Meu Primeiro Formulário schepta</h1>
        <FormFactory schema={formSchema} onSubmit={handleSubmit} />
      </div>
    </ScheptaProvider>
  );
}

export default App;
```

### 1. Definir Seu Schema

Você pode usar `x-component-props` ou `x-ui` para rótulos e placeholders dos campos. A propriedade `$schema` é opcional (útil para validação na IDE dentro do monorepo).

```json
{
  "$id": "meu-primeiro-formulario",
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
          "x-content": "Informações Pessoais"
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
                        "label": "Primeiro Nome",
                        "placeholder": "Digite seu primeiro nome"
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
      "x-content": "Enviar Formulário"
    }
  }
}
```

### 2. Exemplo Completo em React (Com Componentes Customizados)

```tsx
import React from 'react';
import { ScheptaProvider } from '@schepta/adapter-react';
import { FormFactory } from '@schepta/factory-react';
import { globalComponents } from './components';
import formSchema from './form-schema.json';

function App() {
  const handleSubmit = (values: any) => {
    console.log('Formulário enviado:', values);
  };

  return (
    <ScheptaProvider
      components={globalComponents}
      externalContext={{
        user: { id: 1, name: 'João Silva' },
        api: 'https://api.exemplo.com',
      }}
      debug={{ enabled: true }}
    >
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Meu Primeiro Formulário schepta</h1>
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

## Próximos Passos

Agora que você tem o básico, explore mais:

### Conceitos Fundamentais

Aprenda os conceitos fundamentais que impulsionam o schepta:

- **[01. Factories](/pt-BR/concepts/01-factories)** - Como schemas se tornam componentes
- **[02. Schema Language](/pt-BR/concepts/02-schema-language)** - A sintaxe para definir UI
- **[03. Provider](/pt-BR/concepts/03-provider)** - Configuração global e contexto
- **[04. Schema Resolution](/pt-BR/concepts/04-schema-resolution)** - De JSON para React/Vue
- **[05. Renderer](/pt-BR/concepts/05-renderer)** - O motor de renderização
- **[06. Middleware](/pt-BR/concepts/06-middleware)** - Transformando props e comportamento
- **[07. Debug System](/pt-BR/concepts/07-debug-system)** - Ferramentas de desenvolvimento

## Recursos

- [Showcase React](/pt-BR/showcases/react) - Exemplos com React Hook Form e Formik
- [Repositório GitHub](https://github.com/guynikan/schepta)
