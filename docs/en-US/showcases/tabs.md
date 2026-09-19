---
title: Tabs Showcase
description: Interactive TabsFactory example — a built-in Schepta factory powered by createReactFactory
aside: false
---

<script setup>
import TabsShowcaseWrapper from '../../.vitepress/showcases/tabs/TabsShowcaseWrapper.vue'
</script>

# Tabs Showcase

A working `TabsFactory` rendering a tabbed interface schema from
[`instances/tabs/simple-tabs.json`](https://github.com/guynikan/schepta/blob/main/instances/tabs/simple-tabs.json).
It is one of the **built-in Schepta factories**, living alongside `FormFactory`,
`MenuFactory`, `TableFactory`, `LayoutFactory` and `ModalFactory`, all built on
top of the generic `createReactFactory` primitive.

The schema describes the *tabs* (label, icon, badge, disabled flag, content)
while the **active tab state and imperative ref API are fully managed by the
factory** through a dedicated React context.

What to try:

- **Click a tab** (Overview, Members, Billing) → changes the active panel and
  updates *"Last onChange"*.
- **Advanced** is declared as `disabled: true` in the schema, so it is rendered
  as unclickable and aria-disabled.
- **"Go to Overview / Billing (ref)"** → calls `tabsRef.current?.setActiveTab(...)`
  imperatively.
- **"Clear active tab (ref)"** → calls `tabsRef.current?.setActiveTab(null)` and
  no panel is rendered until another tab is selected.
- **"Snapshot tabs (ref)"** → calls `tabsRef.current?.getTabs()` and shows the
  ordered schema keys.

The `Members` tab shows a **badge** (from `x-component-props.badge`) rendered
next to its label. Orientation (`horizontal` / `vertical`) and variant
(`underline` / `pills` / `boxed`) are also schema-driven.

<ClientOnly>
  <TabsShowcaseWrapper />
</ClientOnly>
