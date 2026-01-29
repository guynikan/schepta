---
layout: home
locale: es-ES

homeHero:
  title: Schepta
  subtitle: Motor de renderizado agnóstico de framework para UI dirigida por servidor
  description: Transforma schemas JSON en componentes de UI completamente funcionales. Funciona perfectamente con React, Vue y JavaScript vanilla.
  getStarted: Comenzar
  viewShowcases: Ver Ejemplos
  installCommandId: install-command-es
  copyButtonLabel: Copiar comando
  geckoAlt: Gecko Guanche - mascota de schepta
homeFeatures:
  title: Funcionalidades
  description: Funcionalidades de Schepta
  items:
    - icon: 🚀
      title: Agnóstico de Framework
      description: Funciona con React, Vue y JavaScript vanilla
    - icon: 📋
      title: Dirigido por Schema
      description: Define UI usando schemas JSON
    - icon: 🔒
      title: Type-Safe
      description: Soporte completo para TypeScript
    - icon: 🔧
      title: Extensible
      description: Componentes, renderers y middleware personalizados
example:
  title: Ejemplo Rápido
  description: Este schema simple se convierte en un formulario completamente funcional
concepts:
  title: Conceptos Fundamentales
  description: Aprende los conceptos fundamentales que impulsan schepta
  items:
    - title: Factories
      link: /concepts/01-factories
      description: Cómo los schemas se convierten en componentes
    - title: Schema Language
      link: /concepts/02-schema-language
      description: La sintaxis para definir UI
    - title: Provider
      link: /concepts/03-provider
      description: Configuración global y contexto
    - title: Schema Resolution
      link: /concepts/04-schema-resolution
      description: De JSON a React/Vue
    - title: Renderer
      link: /concepts/05-renderer
      description: El motor de renderizado
    - title: Middleware
      link: /concepts/06-middleware
      description: Transformando props y comportamiento
    - title: Debug System
      link: /concepts/07-debug-system
      description: Herramientas de desarrollo
showcases:
  title: Ejemplos
  description: Ve schepta en acción con ejemplos interactivos
  items:
    - title: Ejemplos React
      link: /showcases/react
      description: React con react-hook-form
    - title: React Material UI
      link: /showcases/material-ui
      description: React con Material UI
    - title: React Chakra UI
      link: /showcases/chakra-ui
      description: React con Chakra UI
    - title: Ejemplos Vue
      link: /showcases/vue
      description: Vue con adaptador de formulario personalizado
    - title: Vue Vuetify
      link: /showcases/vuetify
      description: Vue con Vuetify Material Design
---

<script setup>
import HeroSection from '../components/home/HeroSection.vue'
import FeaturesSection from '../components/home/FeaturesSection.vue'
import ExampleSection from '../components/home/ExampleSection.vue'
import ConceptsSection from '../components/home/ConceptsSection.vue'
</script>

<HeroSection />
<FeaturesSection />
<ExampleSection />
<ConceptsSection />
