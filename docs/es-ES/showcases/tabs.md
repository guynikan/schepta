---
title: Ejemplo de Tabs
description: Ejemplo interactivo de TabsFactory — una factory integrada de Schepta construida con createReactFactory
aside: false
---

<script setup>
import TabsShowcaseWrapper from '../../.vitepress/showcases/tabs/TabsShowcaseWrapper.vue'
</script>

# Ejemplo de Tabs

Un `TabsFactory` funcional renderizando una interfaz de pestañas a partir del
schema en [`instances/tabs/simple-tabs.json`](https://github.com/guynikan/schepta/blob/main/instances/tabs/simple-tabs.json).
Es una de las **factories integradas de Schepta**, conviviendo con
`FormFactory`, `MenuFactory`, `TableFactory`, `LayoutFactory` y `ModalFactory`,
todas construidas sobre la primitiva genérica `createReactFactory`.

El schema describe las *pestañas* (etiqueta, icono, badge, flag de disabled,
contenido) mientras que el **estado de la pestaña activa y la ref API
imperativa son gestionados por la factory** mediante un React context dedicado.

Qué probar:

- **Haz clic en una pestaña** (Overview, Members, Billing) → cambia el panel
  activo y actualiza *"Last onChange"*.
- **Advanced** está declarada como `disabled: true` en el schema, por lo que
  aparece como no clicable y con `aria-disabled`.
- **"Go to Overview / Billing (ref)"** → llama a
  `tabsRef.current?.setActiveTab(...)` de forma imperativa.
- **"Clear active tab (ref)"** → llama a `tabsRef.current?.setActiveTab(null)`
  y ningún panel es renderizado hasta que se seleccione otra pestaña.
- **"Snapshot tabs (ref)"** → llama a `tabsRef.current?.getTabs()` y muestra las
  keys del schema en orden.

La pestaña `Members` muestra un **badge** (vía `x-component-props.badge`)
renderizado junto a la etiqueta. La orientación (`horizontal` / `vertical`) y la
variante (`underline` / `pills` / `boxed`) también son definidas por el schema.

<ClientOnly>
  <TabsShowcaseWrapper />
</ClientOnly>
