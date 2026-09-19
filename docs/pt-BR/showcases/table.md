---
title: Showcase de Tabela
description: Exemplo interativo da TableFactory — terceira factory built-in construída sobre createReactFactory
aside: false
---

<script setup>
import TableShowcaseWrapper from '../../.vitepress/showcases/table/TableShowcaseWrapper.vue'
</script>

# Showcase de Tabela

`TableFactory` em funcionamento renderizando um schema de tabela vindo de
[`instances/table/simple-table.json`](https://github.com/guynikan/schepta/blob/main/instances/table/simple-table.json).
É a **terceira factory built-in** do Schepta, convivendo com `FormFactory` e
`MenuFactory`, construída sobre o primitivo genérico `createReactFactory`
descrito em [Criando uma Factory](../concepts/08-create-factory.md).

O schema descreve a forma visual da tabela (colunas, alinhamento,
ordenação, `format` opcional) enquanto as **linhas são passadas por prop** —
essa é a forma idiomática de renderizar datasets reais sem inflar o schema
com dados.

O que experimentar:

- **Clicar no cabeçalho de uma coluna ordenável** (Name, Email, Role, Seats) →
  alterna `ascendente → descendente → sem ordenação`. O estado atual aparece
  em *"Last onSort"*.
- **Clicar em uma linha** → alterna a seleção. Este showcase usa
  `selectionMode="multiple"`, então várias linhas podem estar selecionadas
  ao mesmo tempo. O payload aparece em *"Last onSelectionChange"*.
- **"Select top 3 via ref"** → chama `tableRef.current?.setSelectedKeys(['u1','u2','u3'])`.
- **"Sort by email desc (ref)"** → chama `tableRef.current?.setSort({ column: 'email', direction: 'desc' })`.
- **"Clear sort (ref)"** → chama `tableRef.current?.setSort(null)`.
- **"Snapshot visible rows (ref)"** → chama `tableRef.current?.getVisibleRows()` e mostra
  os IDs das linhas na ordem atual.

A coluna **Status** usa o template opcional `format: "● {{ value }}"`
declarado no schema — uma substituição mínima aplicada pelo renderizador
default de células.

<ClientOnly>
  <TableShowcaseWrapper />
</ClientOnly>
