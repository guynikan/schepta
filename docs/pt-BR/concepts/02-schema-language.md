# Schema Language

**Sintaxe e propriedades que o schepta entende** — o "vocabulário" para definir interfaces dinâmicas.

<img src="/images/02-schema-language.svg" alt="Schema Language" />

**Schema Language define como escrever JSON que o schepta pode interpretar:**

### Propriedades Essenciais:

| **Propriedade** | **Função** | **Valor** | **Resultado** |
| ------------ | ---------- | --------- | ------------- |
| `x-component` | Define qual componente usar | `"InputText"` | Componente React/Vue específico |
| `x-component-props` | Props do componente | `{ placeholder: "Email" }` | Props passadas diretamente |
| `x-ui` | Layout e visual | `{ order: 1 }` | Ordenação e posicionamento |
| `x-rules` | Validação e regras | `{ required: true }` | Validação automática |
| `name` | Identificador único | `"email"` | Campo identificado |

### Sintaxe Básica:

**Campo de formulário:**
```json
{
  "name": "email",
  "x-component": "InputText",
  "x-component-props": {
    "placeholder": "Digite seu email"
  },
  "x-rules": {
    "required": true,
    "pattern": "email"
  }
}
```

**Item de menu:**
```json
{
  "type": "object",
  "x-component": "MenuLink",
  "x-component-props": {
    "label": "Dashboard",
    "href": "/dashboard",
    "icon": "dashboard"
  }
}
```

> **Resultado:** JSON estruturado → Componente React/Vue funcionando. Sintaxe simples e poderosa!


## Propriedades Principais

**Propriedades fundamentais que todo schema deve conhecer:**

### Definição de Componente:

| **Propriedade** | **Obrigatório** | **Tipo** | **Descrição** | **Exemplo** |
| ------------ | ------------ | -------- | --------------- | ----------- |
| `x-component` | Sim | string | Nome do componente | `"InputText"`, `"MenuLink"` |
| `x-component-props` | Não | object | Props do componente | `{ variant: "outlined" }` |
| `type` | Contexto | string | Tipo do schema | `"string"`, `"object"` |
| `name` | Não (formulários) | string | Identificador do campo | `"email"`, `"password"` |

### Visual e Layout:

| **Propriedade** | **Obrigatório** | **Tipo** | **Descrição** | **Exemplo** |
| ------------ | ------------ | -------- | --------------- | ----------- |
| `x-ui` | Não | object | Configuração de UI | `{ order: 1, grid: { xs: 12 } }` |
| `title` | Não | string | Rótulo de exibição | `"Email"` |
| `description` | Não | string | Texto de ajuda | `"Digite seu email"` |
| `placeholder` | Não | string | Placeholder do input | `"user@company.com"` |

### Comportamento e Lógica:

| **Propriedade** | **Obrigatório** | **Tipo** | **Descrição** | **Exemplo** |
| ------------ | ------------ | -------- | --------------- | ----------- |
| `x-content` | Não | string | Conteúdo estático (ex.: rótulo de botão) | `"Enviar Formulário"` |

**Valores dinâmicos:** Use expressões de template em `x-component-props` (ou outras props) com `{{ $formValues.fieldName }}` e `{{ $externalContext.property }}`. O middleware de template substitui isso em tempo de execução. Veja Expression Language abaixo.


## Tipos de Schema

**Diferentes tipos de schema para diferentes casos de uso:**

### Schemas de Formulário:

**Estrutura do schema de campo:**
```json
{
  "name": "fieldName",
  "x-component": "ComponentName",
  "x-component-props": {
    "prop1": "value1",
    "prop2": "value2"
  },
  "x-rules": {
    "required": true,
    "pattern": "regex",
    "minLength": 5
  },
  "x-ui": {
    "order": 1,
    "grid": { "xs": 12, "md": 6 }
  }
}
```

**Schema do container do formulário:**
```json
{
  "type": "object",
  "x-component": "FormContainer",
  "properties": {
    "fieldKey1": { /* field schema */ },
    "fieldKey2": { /* field schema */ }
  }
}
```


## Responsivo e Layout

| **Propriedade** | **Configuração** | **Propósito** | **Exemplo** |
| ------------ | ----------------- | ----------- | ----------- |
| `x-ui.grid` | Sistema de grid | Layout responsivo | `{ xs: 12, md: 6, lg: 4 }` |
| `x-ui.order` | number | Ordem de exibição | `1`, `2`, `3` |
| `x-ui.span` | number | Colunas ocupadas | `2` (ocupa 2 colunas) |
| `x-ui.offset` | number | Offset de coluna | `1` (desloca 1 coluna) |


## Expression Language

**Sintaxe para expressões dinâmicas nos schemas. As expressões são processadas pelo middleware de template e suportam `$formValues` e `$externalContext`.**

### Tipos de Expressão:

| **Tipo de Expressão** | **Sintaxe** | **Contexto** | **Exemplo** |
| ------------------- | ---------- | ----------- | ----------- |
| **Valores do formulário** | `{{ $formValues.fieldName }}` | Estado atual do formulário | `"{{ $formValues.email }}"` |
| **Contexto externo** | `{{ $externalContext.property }}` | `externalContext` do Provider | `"{{ $externalContext.user.name }}"` |

### Operadores Disponíveis:

| **Operador** | **Uso** | **Exemplo** | **Resultado** |
| ------------ | --------- | ----------- | ---------- |
| `===`, `!==` | Igualdade | `"{{ $externalContext.role === 'admin' }}"` | boolean |
| `&&`, `\|\|` | Lógico | `"{{ $formValues.type === 'user' && $externalContext.plan === 'premium' }}"` | boolean |
| `>`, `<`, `>=`, `<=` | Comparação | `"{{ $formValues.age >= 18 }}"` | boolean |

Expressões podem ser usadas dentro de strings em props (ex.: em `x-component-props`) e são avaliadas com os valores atuais do formulário e do contexto externo.


## Conceitos Relacionados

**Schema Language é a "sintaxe" que conecta todos os conceitos:**

- **[01. Factories](./01-factories.md):** Factories interpretam o Schema Language
- **[04. Schema Resolution](./04-schema-resolution.md):** Pipeline que processa a sintaxe  
- **[05. Renderer](./05-renderer.md):** Renderers executam propriedades do schema
- **[06. Middleware](./06-middleware.md):** Pipeline transforma propriedades do schema (incluindo expressões de template)
- **[03. Provider](./03-provider.md):** Configura componentes e contextos usados nos schemas
- **[07. Debug System](./07-debug-system.md):** Debug mostra como os schemas são interpretados
