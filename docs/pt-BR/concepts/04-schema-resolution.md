# De JSON a Componentes

**Sistema que interpreta schemas JSON e os transforma em elementos React/Vue** — o "tradutor" entre backend e frontend.

<img src="/images/04-schema-resolution.svg" alt="Schema Resolution" />

**Schema Resolution é o processo que transforma configurações JSON em interfaces funcionais:**

### O Que Faz:

| **Entrada** | **Processo** | **Saída** | **Resultado** |
| --------- | ------------ | ---------- | ------------- |
| JSON Schema | Resolução + Validação | Árvore de Elementos React/Vue | Interface renderizada |
| Especificações de componente | Lookup (defaults + Provider + local) | Instâncias de componentes | Componentes funcionando |
| Props e contexto | Pipeline de middleware | Props enriquecidas | Comportamento correto |

### Fluxo de Resolução:

**Passos Automáticos:**
1. **Parsing do Schema:** JSON → Estrutura interna
2. **Lookup de Componente:** `x-component` (e opcional `x-custom`) → Componente do registro mesclado
3. **Resolução de Props:** Propriedades do schema → Props do componente
4. **Injeção de Contexto:** Adapter de formulário, contexto externo → disponíveis aos componentes
5. **Aplicação de Middleware:** Transformação de props (ex.: expressões de template)
6. **Criação de Elemento:** React.createElement() / Vue h()

**Exemplo Visual:**
```json
{ "name": "email", "x-component": "InputText", "required": true }
```
↓ **Processo de Resolução**
```jsx
<InputText name="email" required={true} onChange={...} />
```

> **Resultado:** Schema declarativo → Componente imperativo.


## Tipos de Resolução

### Resolução de Schema de Formulário:

| **Propriedade do Schema** | **Estratégia de Resolução** | **Resultado React/Vue** | **Exemplo** |
| ------------------- | ----------------------- | ---------------- | ----------- |
| `name` | Identificação do campo | prop `name` | `<input name="email" />` |
| `x-component` | Lookup de componente no registro mesclado | Tipo do componente | `<InputText />` |
| `required` | Regra de validação | prop `required` + validação | `required={true}` |
| `x-component-props` | Passagem de props (após processamento de template) | Props diretas | `placeholder="Digite email"` |
| `x-rules` | Configuração de validação | Props de validação | `pattern="email"` |

### Resolução de Schema de Componente:

| **Propriedade do Schema** | **Estratégia de Resolução** | **Resultado React/Vue** | **Exemplo** |
| ------------------- | ----------------------- | ---------------- | ----------- |
| `x-component` | Lookup do tipo de componente | Classe do componente | `<Button />` |
| `x-ui` | Props de layout/estilo | Passadas ao componente | Props de layout |
| `x-component-props` | Props específicas do componente (expressões de template resolvidas) | Objeto de props | `{ variant: "primary" }` |


## Motor de Resolução

**Como o sistema resolve schemas internamente:**

### Pipeline de Resolução:

```
JSON Schema bruto
    ↓
Validar Schema (Estrutura válida?)
    ↓
Resolver Componente (Lookup: customComponents para x-custom, senão components mesclados)
    ↓
Mapear Props (Schema → Props do componente)
    ↓
Injetar Contexto (formValues, externalContext)
    ↓
Aplicar Middleware (ex.: expressões de template)
    ↓
Criar Elemento (React.createElement / Vue h())
    ↓
Elemento React/Vue Final
```

### Prioridades de Resolução:

**Resolução de Componentes:**
- Quando um nó do schema tem `x-custom: true`, o resolvedor busca a chave do nó em **customComponents** (Provider / factory).
- Caso contrário, o nome do componente (`x-component` ou chave do nó) é buscado no registro **merged components**. Ordem do merge: **Default (factory) → Global (ScheptaProvider) → Local (props da factory)**. O que vier depois sobrescreve.

**Ordem de Resolução de Props:**
1. **Props definidas no schema** (`x-component-props`, etc.), com expressões de template resolvidas
2. **Props derivadas** (da estrutura do schema, ex.: nome do campo)
3. **Contexto** (adapter de formulário, externalContext) disponível aos componentes
4. **Props padrão** (defaults do componente)

**Ordem de Resolução de Middleware:**
- O middleware de expressões de template roda primeiro (assim `{{ $formValues.x }}` e `{{ $externalContext.x }}` são resolvidos).
- Em seguida **`middlewares` do Provider** e **`middlewares` da factory** rodam na ordem do array.


## Resolução de Expressões

**Expressões de template nas props são resolvidas usando valores do formulário e contexto externo:**

| **Tipo de Expressão**   | **Resolução** | **Exemplo** | **Resultado** |
| --------------------- | --------------- | ----------- | ---------- |
| **Valores estáticos**     | Direto          | `"required": true` | `required={true}` |
| **Valores do formulário**       | `$formValues`   | `"{{ $formValues.email }}"` | Valor atual do campo |
| **Contexto externo**  | `$externalContext` | `"{{ $externalContext.user.name }}"` | Valor do externalContext do Provider |
| **Expressões JEXL**  | Avaliadas       | `"{{ $formValues.age >= 18 }}"` | boolean |


## Conceitos Relacionados

**Schema Resolution é o "processador" que conecta schemas com React/Vue:**

- **[01. Factories](./01-factories.md):** Factories usam a resolução para processar schemas
- **[02. Schema Language](./02-schema-language.md):** Sintaxe interpretada pela resolução  
- **[05. Renderer](./05-renderer.md):** Renderers escolhidos pela resolução
- **[06. Middleware](./06-middleware.md):** Pipeline executado durante a resolução
- **[03. Provider](./03-provider.md):** Contexto e configuração usados na resolução
- **[07. Debug System](./07-debug-system.md):** Debug mostra os passos da resolução
