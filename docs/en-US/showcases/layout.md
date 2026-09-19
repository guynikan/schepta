---
title: Layout Showcase
description: Interactive LayoutFactory example powered by createReactFactory
aside: false
---

<script setup>
import LayoutShowcaseWrapper from '../../.vitepress/showcases/layout/LayoutShowcaseWrapper.vue'
</script>

# Layout Showcase

This interactive example renders `LayoutFactory` from the application-shell
schema in
[`instances/layout/app-shell.json`](https://github.com/guynikan/schepta/blob/main/instances/layout/app-shell.json).
The schema composes header, sidebar, main and footer slots into a responsive
shell with a `with-sidebar` variant.

What to try:

- Inspect the semantic header, navigation sidebar, main content and footer
  slots rendered from JSON.
- Use **Read slots (ref)** to call `getSlots()` and display the declared slot
  keys.
- Use **Check sidebar (ref)** to call `hasSlot('sidebar')`.
- Focus the **Skip to main content** link to verify keyboard navigation to the
  main landmark.

The layout factory keeps slot composition framework-agnostic at the schema
level while its default React components provide semantic HTML and the
accessibility affordances required by the application shell.

<ClientOnly>
  <LayoutShowcaseWrapper />
</ClientOnly>
