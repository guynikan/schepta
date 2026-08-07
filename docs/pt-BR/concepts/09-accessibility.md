# Acessibilidade

O Schepta renderiza UI a partir de JSON, então quem escreve o schema nunca escreve a marcação — quem decide a semântica é o componente built-in. Isso faz da acessibilidade uma responsabilidade do framework, e não da aplicação: se um componente padrão emite um input sem label, toda aplicação construída sobre ele herda o problema.

Os componentes React built-in miram **WCAG 2.1 AA** por padrão. Nada do que está abaixo exige configuração.

## O que você ganha de graça

### Todas as factories

- **Foco visível** — um anel `:focus-visible` é aplicado aos elementos interativos dentro de qualquer subárvore Schepta. A maioria dos padrões são botões sem estilo (`border: none`), onde o anel do navegador é invisível ou inexistente.
- **Movimento reduzido** — transições e animações são desligadas sob `prefers-reduced-motion: reduce`.
- **IDs sem colisão** — os ids vêm do `useId()` do React, então renderizar o mesmo schema duas vezes na mesma página não quebra `label[for]` nem nenhuma referência `aria-*`.

As duas regras de estilo ficam na camada CSS `schepta-defaults`, injetada pelo `createReactFactory`. Estar numa camada significa que o seu CSS sobrescreve sem precisar de `!important`.

### FormFactory

| Comportamento | Detalhe |
| --- | --- |
| Associação de label | `<label for>` ligado a um id de controle gerado |
| Campos obrigatórios | `required` + `aria-required` a partir de `x-component-props.required` |
| Campos inválidos | `aria-invalid` assim que o campo falha na validação |
| Mensagens de erro | Renderizadas em `role="alert"`, ligadas via `aria-describedby` |
| Texto de apoio | `x-component-props.description`, ligado via `aria-describedby` |
| Resumo de erros | Recebe foco automaticamente num submit inválido, listando todos os erros |
| Seções | `<section aria-labelledby>` nomeada pelo seu `FormSectionTitle` |
| Validação nativa | Desligada (`noValidate`) para que as mensagens anunciadas pelo Schepta não sejam atropeladas pelos balões do navegador |

A validação roda contra o schema (AJV) no submit e popula os erros dos campos. Para desligar, use `validateOnSubmit={false}`.

```json
{
  "type": "string",
  "x-component": "InputText",
  "x-component-props": {
    "label": "E-mail",
    "required": true,
    "description": "Usamos para o seu login"
  }
}
```

Esse schema produz um input rotulado e obrigatório, cujo texto de apoio e (após um submit inválido) o erro são ambos anunciados.

### TabsFactory

Segue o padrão ARIA Tabs. A lista de abas é **um único ponto de tabulação**; as setas navegam entre as abas, `Home` / `End` vão para as pontas, e abas desabilitadas são puladas. O `aria-controls` de cada trigger aponta para o painel que de fato está no DOM.

Abas desabilitadas usam `aria-disabled`, não o atributo nativo `disabled` — um botão desabilitado nativamente sai da árvore de acessibilidade, então quem usa leitor de tela não saberia que a aba existe.

### ModalFactory

- O foco entra no diálogo na abertura e **volta para o elemento que o abriu** no fechamento.
- `Tab` e `Shift+Tab` circulam dentro do diálogo; `Escape` fecha de qualquer lugar.
- Renderizado via portal para o `document.body`, então nunca herda `aria-hidden` nem contexto de empilhamento de um ancestral.
- Nomeia-se pelo título do `ModalHeader` (`aria-labelledby`) e pela descrição (`aria-describedby`), com fallback para `ariaLabel`.
- O scroll do body fica travado enquanto aberto.

### TableFactory

- Com seleção habilitada a tabela vira `role="grid"` com `aria-multiselectable` — `aria-selected` numa linha é inválido numa `table` comum.
- As linhas usam roving tabindex: um `Tab` entra no grid, as setas navegam entre linhas. Sem isso, uma tabela de 50 linhas custa 50 toques para ser pulada.
- Estados de carregamento e vazio são anunciados por uma live region.
- Cabeçalhos ordenáveis mantêm `aria-sort` e `<th scope="col">`.

### MenuFactory

- O item ativo carrega `aria-current="page"`.
- Itens desabilitados saem da ordem de tabulação, em vez de apenas não serem clicáveis.

### LayoutFactory

- Um skip link é renderizado como primeiro elemento focável, apontando para `#main-content`.
- O `<main>` é focável (`tabindex="-1"`) para que seguir o skip link mova o foco, e não só o scroll.
- `banner` / `contentinfo` só são reivindicados quando `isPageRoot: true`. Um `<header>` aninhado dentro de uma `<div>` não é landmark, e uma página com dois banners é pior do que uma com nenhum.

## Sobrescrevendo os padrões

`x-component-props` aceita qualquer prop e é espalhado no elemento por último, então o que você definir ali vence o valor gerado:

```json
{
  "type": "string",
  "x-component": "InputText",
  "x-component-props": {
    "label": "Buscar",
    "aria-label": "Buscar em todos os projetos",
    "aria-keyshortcuts": "Control+K"
  }
}
```

Use isso quando precisar de um nome acessível específico, uma dica de atalho ou um atributo ARIA que o Schepta não emite. Prefira o comportamento built-in onde ele existe — um `aria-describedby` escrito à mão não se atualiza quando o estado de validação muda.

## Componentes customizados

Um componente customizado substitui o built-in por inteiro, acessibilidade incluída. As mesmas primitivas que os padrões usam são exportadas, para você não ter que reconstruí-las:

```tsx
import {
  useFieldA11y,
  FieldMessages,
  type InputTextProps,
} from '@schepta/factory-react';

export function MyInput({ name, label, description, required, ...rest }: InputTextProps) {
  const { ids, errorText, labelProps, controlProps } = useFieldA11y({
    name,
    description,
    required,
  });

  return (
    <div>
      <label {...labelProps}>{label}</label>
      <input name={name} {...controlProps} {...rest} />
      <FieldMessages ids={ids} description={description} errorText={errorText} />
    </div>
  );
}
```

O `useFieldA11y` lê o erro do campo reativamente do adapter de formulário e devolve o `aria-invalid` / `aria-describedby` correspondente, para o seu componente anunciar a validação do mesmo jeito que os padrões.

Também disponíveis:

| Export | Para que serve |
| --- | --- |
| `useA11yIds` | IDs sem colisão para uma instância de componente |
| `composeDescribedBy` | Junta candidatos a `aria-describedby`, descartando os vazios |
| `useRovingTabIndex` | Navegação por setas com um único ponto de tabulação |
| `useFocusTrap` | Prisão e restauração de foco para diálogos |
| `useAnnouncer` | Live region para mudanças de estado assíncronas |
| `visuallyHiddenStyle` | Esconde visualmente mantendo na árvore de acessibilidade |

## Testes

O repositório protege a acessibilidade no CI em dois níveis:

- **Unitário** — `vitest-axe` roda o axe contra a saída de cada factory, mais testes explícitos de teclado (`packages/factories/react/src/a11y/a11y.test.tsx`).
- **E2E** — `@axe-core/playwright` varre cada showcase num navegador real e exercita os caminhos de teclado (`tests/e2e/a11y.spec.ts`, projeto `a11y`).

```bash
pnpm --filter @schepta/factory-react test
pnpm test:e2e -- --project=a11y
```

O axe não consegue dizer se as setas navegam entre abas ou se o foco está preso num diálogo. São justamente essas falhas que trancam quem usa teclado do lado de fora, então as duas suítes combinam varredura estática com testes de interação explícitos.

## Limitações atuais

- Os padrões de Vue e Vanilla **ainda não** receberam esse trabalho. Só o `@schepta/factory-react` cumpre o contrato descrito aqui.
- O contraste de cor é garantido apenas para os tokens padrão. Se você sobrescrever `--schepta-*`, verifique se o resultado se mantém em 4.5:1.
