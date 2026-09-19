---
title: Showcase de Layout
description: Exemplo interativo da LayoutFactory construído sobre createReactFactory
aside: false
---

<script setup>
import LayoutShowcaseWrapper from '../../.vitepress/showcases/layout/LayoutShowcaseWrapper.vue'
</script>

# Showcase de Layout

Este exemplo interativo renderiza a `LayoutFactory` usando o schema de shell de
aplicação em
[`instances/layout/app-shell.json`](https://github.com/guynikan/schepta/blob/main/instances/layout/app-shell.json).
O schema compõe os slots de cabeçalho, sidebar, conteúdo principal e rodapé em
um shell com variante `with-sidebar`.

Experimente:

- Inspecione os slots semânticos renderizados a partir do JSON.
- Use **Read slots (ref)** para chamar `getSlots()` e exibir as chaves.
- Use **Check sidebar (ref)** para chamar `hasSlot('sidebar')`.
- Mova o foco para o link **Skip to main content** e verifique a navegação por
  teclado até o landmark principal.

A factory mantém a composição no nível do schema e os componentes React
fornecem HTML semântico e recursos de acessibilidade para o shell.

<ClientOnly>
  <LayoutShowcaseWrapper />
</ClientOnly>
