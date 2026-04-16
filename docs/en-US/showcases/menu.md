---
title: Menu Showcase
description: Interactive MenuFactory example — a second built-in factory powered by createReactFactory
aside: false
---

<script setup>
import MenuShowcaseWrapper from '../../.vitepress/showcases/menu/MenuShowcaseWrapper.vue'
</script>

# Menu Showcase

A working `MenuFactory` rendering a two-level navigation schema from
[`instances/menu/simple-menu.json`](https://github.com/guynikan/schepta/blob/main/instances/menu/simple-menu.json).
This is the canonical example of a **second built-in factory** coexisting with
`FormFactory`, built on top of the generic `createReactFactory` primitive
described in [Creating a Factory](../concepts/08-create-factory.md).

What to try:

- **Click a menu item** → the active item updates and the `onSelect` payload is shown.
- **"Read active (ref)"** → calls `menuRef.current?.getActiveItem()` via the imperative ref API.
- **"Select settings via ref"** → calls `menuRef.current?.setActiveItem('settings')` programmatically.
- **"Clear selection"** → resets state through the ref API.
- The item **"Drafts"** is disabled via `x-component-props.disabled: true` in the schema — clicking it has no effect.

<ClientOnly>
  <MenuShowcaseWrapper />
</ClientOnly>
