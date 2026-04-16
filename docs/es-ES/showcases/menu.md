---
title: Showcase de Menú
description: Ejemplo interactivo de MenuFactory — segunda factory integrada sobre createReactFactory
aside: false
---

<script setup>
import MenuShowcaseWrapper from '../../.vitepress/showcases/menu/MenuShowcaseWrapper.vue'
</script>

# Showcase de Menú

`MenuFactory` funcionando sobre un schema de navegación de dos niveles tomado
de
[`instances/menu/simple-menu.json`](https://github.com/guynikan/schepta/blob/main/instances/menu/simple-menu.json).
Este es el ejemplo canónico de una **segunda factory integrada** que convive
con `FormFactory`, construida sobre la primitiva genérica
`createReactFactory` descrita en
[Creando una Factory](../concepts/08-create-factory.md).

Qué probar:

- **Hacer clic en un ítem** → el ítem activo se actualiza y se muestra el payload de `onSelect`.
- **"Read active (ref)"** → invoca `menuRef.current?.getActiveItem()` vía ref API imperativa.
- **"Select settings via ref"** → invoca `menuRef.current?.setActiveItem('settings')` programáticamente.
- **"Clear selection"** → limpia el estado vía ref API.
- El ítem **"Drafts"** está deshabilitado por `x-component-props.disabled: true` en el schema — al hacer clic no pasa nada.

<ClientOnly>
  <MenuShowcaseWrapper />
</ClientOnly>
