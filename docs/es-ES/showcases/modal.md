---
title: Showcase de Modal
description: Ejemplo interactivo de ModalFactory construido sobre createReactFactory
aside: false
---

<script setup>
import ModalShowcaseWrapper from '../../.vitepress/showcases/modal/ModalShowcaseWrapper.vue'
</script>

# Showcase de Modal

Este ejemplo interactivo renderiza `ModalFactory` usando el schema de
[`instances/modal/confirm-dialog.json`](https://github.com/guynikan/schepta/blob/main/instances/modal/confirm-dialog.json).
El schema define las ranuras de cabecera, cuerpo y pie; la factory gestiona el
estado de apertura, el foco, el cierre y los atributos de accesibilidad.

Qué probar:

- **Open modal** abre el diálogo mediante la API imperativa `ModalFactoryRef`.
- **Close modal (ref)** y **Toggle modal (ref)** controlan el estado mediante la ref.
- **Read state (ref)** muestra el valor devuelto por `isOpen()`.
- Usa el botón de cierre, el backdrop o Escape para probar el comportamiento
  dismissible y el callback `onOpenChange`.

El diálogo usa `role="dialog"`, `aria-modal="true"`, un nombre accesible
derivado del título del schema y una trampa de foco que devuelve el foco al
elemento que lo abrió.

<ClientOnly>
  <ModalShowcaseWrapper />
</ClientOnly>
