# schepta

**Motor de renderização agnóstico de framework para UI dirigida por servidor**

schepta é um poderoso motor de renderização agnóstico de framework que transforma schemas JSON em componentes de UI totalmente funcionais. Funciona perfeitamente com React, Vue e JavaScript vanilla, fornecendo uma abordagem unificada para UI dirigida por servidor.

## 🚀 Início Rápido

```bash
# Instalar dependências
pnpm install

# Iniciar servidor de desenvolvimento
pnpm --filter docs dev
```

## 📚 Documentação

### Conceitos Fundamentais

Aprenda os conceitos fundamentais que impulsionam o schepta:

- **[01. Factories](/pt-BR/concepts/01-factories)** - Como schemas se tornam componentes
- **[02. Schema Language](/pt-BR/concepts/02-schema-language)** - A sintaxe para definir UI
- **[03. Provider](/pt-BR/concepts/03-provider)** - Configuração global e contexto
- **[04. Schema Resolution](/pt-BR/concepts/04-schema-resolution)** - De JSON para React/Vue
- **[05. Renderer](/pt-BR/concepts/05-renderer)** - O motor de renderização
- **[06. Middleware](/pt-BR/concepts/06-middleware)** - Transformando props e comportamento
- **[07. Debug System](/pt-BR/concepts/07-debug-system)** - Ferramentas de desenvolvimento

### Exemplos

Veja o schepta em ação com exemplos interativos:

- **[Exemplos React](/pt-BR/examples/react)** - React com react-hook-form
- **[Exemplos React Material UI](/pt-BR/examples/material-ui)** - React com Material UI
- **[Exemplos React Chakra UI](/pt-BR/examples/chakra-ui)** - React com Chakra UI
- **[Exemplos Vue](/pt-BR/examples/vue)** - Vue com adaptador de formulário customizado
- **[Exemplos Vue Vuetify](/pt-BR/examples/vuetify)** - Vue com Vuetify Material Design

## 🎯 Principais Recursos

- **Agnóstico de Framework**: Funciona com React, Vue e JavaScript vanilla
- **Dirigido por Schema**: Defina UI usando schemas JSON
- **Type-Safe**: Suporte completo a TypeScript
- **Extensível**: Componentes, renderers e middleware customizados
- **Experiência do Desenvolvedor**: Ferramentas de debug e validação integradas

## 💡 Exemplo

```json
{
  "type": "object",
  "x-component": "form-container",
  "properties": {
    "email": {
      "type": "string",
      "x-component": "InputText",
      "x-ui": {
        "label": "Email",
        "placeholder": "Digite seu email"
      }
    }
  }
}
```

Este schema simples se torna um formulário totalmente funcional com validação, gerenciamento de estado e tratamento de submissão.

## 🔗 Recursos

- [Repositório GitHub](https://github.com/guynikan/schepta)

