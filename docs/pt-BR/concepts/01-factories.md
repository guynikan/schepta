# Como Schemas Viram Componentes

**Sistema que transforma JSON em componentes funcionais** — schema entra, interface sai.

<img src="/images/01-factories.svg" alt="Factories" />

**Factory Pattern é o coração do schepta:**

### O Que É:

| **Input**      | **Factory**        | **Output**       | **Resultado**          | **Status** |
| -------------- | ------------------ | ---------------- | ---------------------- | ------------ |
| Form JSON      | `FormFactory`      | React/Vue Form   | Interface funcionando  | Pronto
| Menu JSON      | `MenuFactory`      | React/Vue Navigation | Navegação completa     | Em desenvolvimento

### Como Funciona:

**Processo Automático:**
1. **JSON Schema** define estrutura e comportamento (usando `properties` e `x-component` por nó)
2. **Factory** interpreta schema e resolve componentes no registro (defaults + Provider + props locais)
3. **Middleware Pipeline** transforma props (ex.: expressões de template)
4. **React/Vue Component** renderiza a interface final

**Exemplo Rápido:**
```json
{
  "type": "object",
  "x-component": "FormContainer",
  "properties": {
    "email": {
      "type": "string",
      "x-component": "InputText",
      "x-component-props": { "placeholder": "Email" }
    }
  }
}
```
↓ **FormFactory processa**
```jsx
<form>
  <input name="email" placeholder="Email" />
</form>
```

> **Resultado:** JSON estruturado → Interface React/Vue funcional. Zero configuração manual!

## Tipos de Factory

**Cada Factory é especializada em um tipo de interface:**

### FormFactory - Formulários Dinâmicos:

| **Propriedade do Schema** | **Função** | **Exemplo** | **Resultado** |
| ------------------- | ---------- | ----------- | ------------- |
| `properties` | Define a estrutura do formulário (JSON Schema) | `{ "email": { ... } }` | Nós aninhados com componentes |
| `x-component` | Componente a renderizar | `"InputText"` | Input de texto |
| `x-component-props` | Props do componente | `{ "placeholder": "Email" }` | Passadas ao componente |

### MenuFactory - Navegação Dinâmica:

| **Propriedade do Schema** | **Função** | **Exemplo** | **Resultado** |
| ------------------- | ---------- | ----------- | ------------- |
| `properties` | Define itens de menu | `{ "home": {...} }` | Item de navegação |
| `x-component-props.href` | Link de navegação | `"/dashboard"` | Link funcional |
| `properties.submenu` | Submenu hierárquico | Propriedades aninhadas | Menu dropdown |

## Arquitetura da Factory

**Como o Factory Pattern funciona internamente:**

### Pipeline de Processamento:

```
JSON Schema
    ↓
Validar Schema (Estrutura correta?)
    ↓
Resolver Componentes (x-component → componente de defaults / Provider / local)
    ↓
Transformar Props (Middleware + contexto)
    ↓
Orquestrar Render (Árvore final de componentes)
    ↓
Elementos React/Vue
```

### Como as Factories se Especializam:

**Cada Factory tem lógica específica para seu domínio:**
- **FormFactory:** Injeta contexto do adapter de formulário, aplica validações, gerencia estado
- **MenuFactory:** Gerencia navegação, estados ativos, hierarquia de menu

**Pontos de extensão:** `components` e `customComponents` do Provider, props da Factory para overrides locais, Middleware Pipeline (ex.: array `middlewares`), `externalContext` para estado compartilhado.

## Casos de Uso Práticos

**O Factory Pattern resolve problemas reais de desenvolvimento:**

### Cenários Resolvidos:

| **Situação** | **Problema Tradicional** | **Com Factory Pattern** | **Benefício** |
| ------------ | ----------------------- | ----------------------- | ------------- |
| **Formulários Repetitivos** | Copy-paste de JSX | Schema reutilizável | Princípio DRY |
| **Validações Complexas** | Código duplicado | Regras no schema | Centralização |
| **Menus Dinâmicos** | Condicionais hardcoded | Expressões em props | Flexibilidade |
| **UI Multi-tenant** | Branches por cliente | Schema por tenant | Escalabilidade |
| **A/B Testing** | Feature flags complexas | Schemas diferentes | Agilidade |

## Links Essenciais

| **Para Entender** | **Leia** | **Relação com Factories** |
| ----------------- | -------- | ------------------------- |
| **Como escrever schemas** | [02. Schema Language](./02-schema-language.md) | Sintaxe que as factories interpretam |
| **Pipeline interno** | [04. Schema Resolution](./04-schema-resolution.md) | Como as factories processam schemas |
| **Motor de renderização** | [05. Renderer](./05-renderer.md) | Sistema usado pelas factories |
| **Transformação de props** | [06. Middleware](./06-middleware.md) | Pipeline aplicado pelas factories |
| **Configuração global** | [03. Provider](./03-provider.md) | Como configurar as factories |
