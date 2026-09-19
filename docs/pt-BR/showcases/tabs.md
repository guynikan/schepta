---
title: Exemplo de Tabs
description: Exemplo interativo do TabsFactory — uma factory built-in do Schepta construída com createReactFactory
aside: false
---

<script setup>
import TabsShowcaseWrapper from '../../.vitepress/showcases/tabs/TabsShowcaseWrapper.vue'
</script>

# Exemplo de Tabs

Um `TabsFactory` funcional renderizando uma interface de abas a partir do
schema em [`instances/tabs/simple-tabs.json`](https://github.com/guynikan/schepta/blob/main/instances/tabs/simple-tabs.json).
É uma das **factories built-in do Schepta**, convivendo com `FormFactory`,
`MenuFactory`, `TableFactory`, `LayoutFactory` e `ModalFactory`, todas
construídas sobre a primitiva genérica `createReactFactory`.

O schema descreve as *abas* (label, ícone, badge, flag de disabled, conteúdo)
enquanto o **estado da aba ativa e a ref API imperativa são completamente
gerenciados pela factory** via um React context dedicado.

O que experimentar:

- **Clique em uma aba** (Overview, Members, Billing) → muda o painel ativo e
  atualiza *"Last onChange"*.
- **Advanced** é declarada como `disabled: true` no schema, portanto aparece
  como não clicável e com `aria-disabled`.
- **"Go to Overview / Billing (ref)"** → chama `tabsRef.current?.setActiveTab(...)`
  imperativamente.
- **"Clear active tab (ref)"** → chama `tabsRef.current?.setActiveTab(null)` e
  nenhum painel é renderizado até que outra aba seja selecionada.
- **"Snapshot tabs (ref)"** → chama `tabsRef.current?.getTabs()` e exibe as
  keys do schema na ordem.

A aba `Members` mostra um **badge** (via `x-component-props.badge`) renderizado
ao lado do label. Orientação (`horizontal` / `vertical`) e variante
(`underline` / `pills` / `boxed`) também são definidas pelo schema.

<ClientOnly>
  <TabsShowcaseWrapper />
</ClientOnly>
