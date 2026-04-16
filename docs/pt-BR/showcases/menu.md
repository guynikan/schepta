---
title: Showcase de Menu
description: Exemplo interativo da MenuFactory — segunda factory built-in construída sobre createReactFactory
aside: false
---

<script setup>
import MenuShowcaseWrapper from '../../.vitepress/showcases/menu/MenuShowcaseWrapper.vue'
</script>

# Showcase de Menu

`MenuFactory` em funcionamento renderizando um schema de navegação de dois
níveis vindo de
[`instances/menu/simple-menu.json`](https://github.com/guynikan/schepta/blob/main/instances/menu/simple-menu.json).
Este é o exemplo canônico de uma **segunda factory built-in** coexistindo com
a `FormFactory`, construída sobre o primitivo genérico `createReactFactory`
descrito em [Criando uma Factory](../concepts/08-create-factory.md).

O que experimentar:

- **Clicar em um item do menu** → o item ativo é atualizado e o payload do `onSelect` é exibido.
- **"Read active (ref)"** → chama `menuRef.current?.getActiveItem()` via ref API imperativa.
- **"Select settings via ref"** → chama `menuRef.current?.setActiveItem('settings')` programaticamente.
- **"Clear selection"** → limpa o estado via ref API.
- O item **"Drafts"** está desabilitado via `x-component-props.disabled: true` no schema — clicar não tem efeito.

<ClientOnly>
  <MenuShowcaseWrapper />
</ClientOnly>
