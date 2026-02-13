# O Motor de Renderização

**Sistema que controla como cada tipo de componente é renderizado** — a "ponte" entre componentes React/Vue e a lógica de apresentação.

<img src="/images/05-renderer.svg" alt="Renderer" />

**O sistema de Renderer decide qual wrapper usar para cada tipo de componente:**

### O Que São Renderers:

| **Tipo de Renderer** | **Função** | **Usado Para** | **Exemplo** |
| ----------------- | ---------- | -------------- | ----------- |
| **field** | Renderiza campos de formulário | InputText, Select, etc. | Vincula ao adapter de formulário, passa props |
| **button** | Renderiza botões | SubmitButton | Comportamento de botão |
| **container** | Renderiza containers de formulário | FormGroup, Section | Organiza layout |
| **content** | Renderiza conteúdo estático | Títulos, labels | Exibição simples |
| **menu-item** | Renderiza itens de menu | MenuLink, MenuButton | Navegação (quando MenuFactory é usado) |
| **menu-container** | Renderiza containers de menu | MenuContainer | Hierarquia de menu |
| **addon** | Renderiza addons | UI de complemento | Conteúdo suplementar |

### Como Funcionam:

**Componente → Renderer → DOM**
```text
InputText Component → FieldRenderer → <input> + binding de formulário + props
```

**O Renderer Adiciona:**
- **Binding com adapter de formulário** (ex.: value, onChange do contexto de formulário Schepta)
- **Injeção de contexto** (valores do formulário, contexto externo)
- **Transformação de props** específica por tipo

> **Resultado:** Componentes focam na UI, Renderers focam na lógica de apresentação!


## Tipos de Renderer

### Field Renderer - Campos de Formulário:

| **Responsabilidade** | **Implementação** | **Benefício** |
| -------------------- | ----------------- | ------------- |
| **Integração com formulário** | Adapter de formulário (ex.: useScheptaFormAdapter no React) | value e onChange ligados ao estado do formulário |
| **Props** | Recebe name, component, componentProps | Renderização consistente de campos |
| **Renderers customizados** | Override via `renderers.field` | Usar com React Hook Form, Formik, etc. |

### Container Renderer - Layout e Organização:

| **Responsabilidade** | **Implementação** | **Benefício** |
| -------------------- | ----------------- | ------------- |
| **Ordenação de filhos** | Ordenação por `x-ui.order` | Layout automático |
| **Filtragem de props** | Remover props de container | Props limpas |
| **Gerenciamento de seções** | Agrupar itens relacionados | Organização visual |

### Content e Button Renderers:

- **content:** Conteúdo estático (títulos, texto). Processamento mínimo.
- **button:** Componentes de botão (ex.: SubmitButton). Tipo `button` na spec do componente.


## Como o Sistema Funciona

### Pipeline de Resolução:

```
Schema JSON
    ↓
Detectar Tipo (tipo da spec: field, container, button, content, ...)
    ↓
Escolher Renderer (Default → renderers do ScheptaProvider → renderers da Factory)
    ↓
Preparar Props (Merge + contexto)
    ↓
Aplicar Middleware (ex.: expressões de template)
    ↓
Renderizar (Renderer envolve o componente)
    ↓
Elemento React/Vue Final
```

### Hierarquia de Resolução:

**Como o sistema escolhe qual renderer usar:**

| **Prioridade** | **Fonte** | **Quando Usar** | **Exemplo** |
| -------------- | --------- | --------------- | ----------- |
| **1ª - Default** | Built-in da factory | Comportamento padrão | DefaultFieldRenderer para tipo `field` |
| **2ª - Global** | ScheptaProvider | Padrão da aplicação | `<ScheptaProvider renderers={{ field: AppFieldRenderer }} />` |
| **3ª - Local** | Props da factory | Override por factory | `<FormFactory renderers={{ field: CustomField }} />` |

Não existe API separada "registerRenderer"; os renderers vêm dos defaults da factory, depois dos `renderers` do Provider, depois da prop `renderers` da factory.


## Por Que os Renderers Existem

**Separação de responsabilidades:**
- **Componentes** definem a UI (input, botão, container).
- **Renderers** os envolvem com binding de formulário, layout ou outro comportamento. O field renderer padrão usa o adapter de formulário do Schepta para que os campos funcionem sem uma biblioteca de formulário específica; você pode substituí-lo por um renderer customizado que use React Hook Form ou Formik.


## Conceitos Relacionados

**Renderers são o "motor" que conecta outros conceitos:**

- **[01. Factories](./01-factories.md):** Factories usam renderers para processar cada componente
- **[04. Schema Resolution](./04-schema-resolution.md):** O pipeline de resolução detecta qual renderer usar  
- **[06. Middleware](./06-middleware.md):** O pipeline roda antes/durante a renderização
- **[03. Provider](./03-provider.md):** Configura renderers globalmente via prop `renderers`
- **[07. Debug System](./07-debug-system.md):** Debug pode mostrar qual renderer foi escolhido
