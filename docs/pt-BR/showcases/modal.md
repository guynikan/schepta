---
title: Showcase de Modal
description: Exemplo interativo da ModalFactory construído sobre createReactFactory
aside: false
---

<script setup>
import ModalShowcaseWrapper from '../../.vitepress/showcases/modal/ModalShowcaseWrapper.vue'
</script>

# Showcase de Modal

Este exemplo interativo renderiza a `ModalFactory` usando o schema em
[`instances/modal/confirm-dialog.json`](https://github.com/guynikan/schepta/blob/main/instances/modal/confirm-dialog.json).
O schema define os slots de cabeçalho, corpo e rodapé; a factory gerencia o
estado de abertura, o foco, o fechamento e os atributos de acessibilidade.

Experimente:

- **Open modal** abre o diálogo usando a API imperativa `ModalFactoryRef`.
- **Close modal (ref)** e **Toggle modal (ref)** controlam o estado pela ref.
- **Read state (ref)** exibe o valor retornado por `isOpen()`.
- Use o botão de fechar, o backdrop ou a tecla Escape para testar o
  comportamento dismissible e o callback `onOpenChange`.

O diálogo usa `role="dialog"`, `aria-modal="true"`, nome acessível derivado do
título do schema e uma armadilha de foco que devolve o foco ao elemento que o
abriu.

<ClientOnly>
  <ModalShowcaseWrapper />
</ClientOnly>
