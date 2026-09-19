---
title: Modal Showcase
description: Interactive ModalFactory example powered by createReactFactory
aside: false
---

<script setup>
import ModalShowcaseWrapper from '../../.vitepress/showcases/modal/ModalShowcaseWrapper.vue'
</script>

# Modal Showcase

This interactive example renders `ModalFactory` from the schema in
[`instances/modal/confirm-dialog.json`](https://github.com/guynikan/schepta/blob/main/instances/modal/confirm-dialog.json).
The schema defines the header, body and footer slots, while the factory owns
open state, focus trapping, dismissal and dialog accessibility attributes.

What to try:

- **Open modal** → opens the dialog through the `ModalFactoryRef` API.
- **Close modal (ref)** and **Toggle modal (ref)** → exercise imperative state
  control without changing the schema.
- **Read state (ref)** → displays the value returned by `isOpen()`.
- Use the dialog close button, backdrop, or Escape key to test dismissible
  behavior and the `onOpenChange` payload.

The dialog is rendered in a portal with `role="dialog"`, `aria-modal="true"`,
an accessible name from the schema title, and a focus trap that restores focus
to the opener when it closes.

<ClientOnly>
  <ModalShowcaseWrapper />
</ClientOnly>
