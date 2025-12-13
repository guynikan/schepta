# O Motor de Renderização

**Sistema que controla como cada tipo de component é renderizado** — a "ponte" entre components React/Vue e a lógica de apresentação.

<img src="/images/05-renderer.svg" alt="Renderer" />


**Renderer System é o que decide qual wrapper usar para cada tipo de componente:**

### 🔧 O Que São Renderers:

| **Renderer Type** | **Função** | **Usado Para** | **Exemplo** |
| ----------------- | ---------- | -------------- | ----------- |
| **field** | Renderiza campos de formulário | InputText, Select, etc. | Adiciona validação automática |
| **container** | Renderiza containers de forms | FormGroup, Section | Organiza layout |
| **menu-item** | Renderiza itens de menu | MenuLink, MenuButton | Adiciona navegação |
| **menu-container** | Renderiza containers de menu | MenuContainer | Organiza hierarquia |
| **content** | Renderiza conteúdo estático | Text, Image | Display simples |

### 📊 Como Funcionam:

**Component → Renderer → DOM**
```text
InputText Component → FieldRenderer → <input> + validation + props
```

**Renderer Adds:**
- **Middleware pipeline** automático  
- **Context injection** (form, menu)
- **Props transformation** específica do tipo
- **Error boundaries** integradas

> **💡 Resultado:** Components focam na UI, Renderers focam na lógica de apresentação!


## 🚀 Tipos de Renderer

**Cada tipo de renderer tem responsabilidades específicas:**

### 📝 Field Renderer - Campos de Formulário:

| **Responsabilidade** | **Implementação** | **Benefício** |
| -------------------- | ----------------- | ------------- |
| **Form Integration** | useFormContext() automático | Props do form injetadas |
| **Validation Pipeline** | withCpfValidation, withRules | Validação automática |
| **Dynamic Props** | useReactions() | Props mudam baseado em state |
| **Debug Integration** | useDebug() | Debug visual automático |

### 🏗️ Container Renderer - Layout e Organização:

| **Responsabilidade** | **Implementação** | **Benefício** |
| -------------------- | ----------------- | ------------- |
| **Child Ordering** | `x-ui.order` sorting | Layout automático |
| **Props Filtering** | Remove container props | Props limpos |
| **Layout Logic** | Responsive layout | UI adaptativa |
| **Section Management** | Group relacionados | Organização visual |

### 🧭 Menu Renderers - Navegação:

| **Renderer** | **Função** | **Features** |
| ------------ | ---------- | ------------ |
| **menu-item** | Individual menu items | Link handling, active states |
| **menu-container** | Menu organization | Hierarchy, ordering, responsive |

### 📄 Content Renderer - Display:

| **Função** | **Uso** | **Características** |
| ---------- | ------- | ------------------- |
| **Static Content** | Text, images, etc. | No form integration |
| **Minimal Processing** | Direct rendering | Performance otimizada |


## ⚙️ Como o Sistema Funciona

**Fluxo conceitual de como renderers processam components:**

### 🔄 Resolution Pipeline:

```
Schema JSON
    ↓
Detectar Tipo (Qual renderer usar?)
    ↓
Buscar Renderer (Na hierarquia de prioridade)
    ↓
Preparar Props (Merge + context)
    ↓
Aplicar Middleware (Transform + validate)
    ↓
Renderizar (Component + wrapper)
    ↓
React/Vue Element Final
```

### 🎯 Hierarquia de Resolução:

**Como o sistema escolhe qual renderer usar:**

| **Prioridade** | **Fonte** | **Quando Usar** | **Exemplo** |
| -------------- | --------- | --------------- | ----------- |
| **1º - Local** | Props do Factory | Customização específica | `<FormFactory renderers=\{\{field: CustomField\}\} />` |
| **2º - Global** | scheptaProvider | Padrão da aplicação | `<scheptaProvider renderers=\{\{field: AppField\}\} />` |
| **3º - Registry** | registerRenderer() | Extensões globais | `registerRenderer('field', LibField)` |
| **4º - Default** | Sistema built-in | Comportamento padrão | FieldRenderer interno |

### ⚡ Orquestrador Central:

**O "maestro" que coordena todo o processo:**

**Responsabilidades:**
- **Detecta** qual tipo de component renderizar
- **Escolhe** o renderer apropriado da hierarquia  
- **Prepara** props mesclando contextos
- **Aplica** middleware pipeline específica do tipo
- **Renderiza** o component final com seu wrapper


## 🤝 Por Que Existem Renderers

**Os problemas que o sistema de renderers resolve:**

### 🎯 Separação de Responsabilidades:

**Sem renderers**, cada component precisa:
- Misturar lógica de UI com lógica de negócio
- Gerenciar context de forma manual e inconsistente  
- Implementar validação específica em cada field
- Transformar props de forma ad-hoc e não padronizada

**Com renderers**, components se tornam:
- **Mais limpos:** foco exclusivo na apresentação visual
- **Mais consistentes:** context injection automática e padronizada
- **Mais reutilizáveis:** validation e logic encapsuladas no renderer
- **Mais previsíveis:** props transformation segue padrões estabelecidos

### 🔄 Flexibilidade do Sistema:

**O mesmo component pode ter comportamentos diferentes:**
- **Form Field:** FieldRenderer adiciona validation + form integration
- **Read-only Display:** ContentRenderer mantém display simples, sem form logic  
- **Menu Item:** ItemRenderer adiciona navigation + active state
- **Custom App:** CustomRenderer implementa behavior específico da aplicação

**Isso permite:** multi-tenant apps, A/B testing, integração com diferentes UI libraries, e extensões customizadas sem modificar components base.


## 💡 Conceitos Relacionados

**Renderers são o "motor" que conecta os outros conceitos:**

- **[01. Factories](./01-factories.md):** Factories usam renderers para processar cada component
- **[04. Schema Resolution](./04-schema-resolution.md):** Resolution pipeline detecta qual renderer usar  
- **[06. Middleware](./06-middleware.md):** Cada renderer tem pipeline específica
- **[03. Provider](./03-provider.md):** Configura renderers globalmente
- **[07. Debug System](./07-debug-system.md):** Debug tools mostram qual renderer foi escolhido

