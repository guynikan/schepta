---
title: Showcase de Layout
description: Ejemplo interactivo de LayoutFactory construido sobre createReactFactory
aside: false
---

<script setup>
import LayoutShowcaseWrapper from '../../.vitepress/showcases/layout/LayoutShowcaseWrapper.vue'
</script>

# Showcase de Layout

Este ejemplo interactivo renderiza `LayoutFactory` con el schema de shell de
aplicación en
[`instances/layout/app-shell.json`](https://github.com/guynikan/schepta/blob/main/instances/layout/app-shell.json).
El schema compone las ranuras de cabecera, sidebar, contenido principal y pie
en un shell con la variante `with-sidebar`.

Qué probar:

- Inspecciona las ranuras semánticas renderizadas desde JSON.
- Usa **Read slots (ref)** para llamar a `getSlots()` y mostrar sus claves.
- Usa **Check sidebar (ref)** para llamar a `hasSlot('sidebar')`.
- Enfoca el enlace **Skip to main content** para verificar la navegación de
  teclado hasta el landmark principal.

La factory mantiene la composición en el nivel del schema y los componentes
React proporcionan HTML semántico y recursos de accesibilidad para el shell.

<ClientOnly>
  <LayoutShowcaseWrapper />
</ClientOnly>
