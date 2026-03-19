---
layout: home
locale: en-US

homeHero:
  title: Schepta
  subtitle: Framework-agnostic rendering engine for server-driven UI
  description: Transform JSON schemas into fully functional UI components. Works seamlessly with React, Vue, and vanilla JavaScript.
  getStarted: Get Started
  viewShowcases: View Showcases
  installCommandId: install-command
  copyButtonLabel: Copy command
  geckoAlt: Guanche Gecko - schepta mascot
homeFeatures:
  title: Features
  description: Features
  items:
    - icon: 🚀
      title: Framework Agnostic
      description: Works with React, Vue, and vanilla JavaScript
    - icon: 📋
      title: Schema-Driven
      description: Define UI using JSON schemas
    - icon: 🔒
      title: Type-Safe
      description: Full TypeScript support
    - icon: 🔧
      title: Extensible
      description: Custom components, renderers, and middleware
example:
  title: Quick Example
  description: This simple schema becomes a fully functional form
concepts:
  title: Core Concepts
  description: Learn the fundamental concepts that power schepta
  items:
    - title: Factories
      link: /concepts/01-factories
      description: How schemas become components
    - title: Schema Language
      link: /concepts/02-schema-language
      description: The syntax for defining UI
    - title: Provider
      link: /concepts/03-provider
      description: Global configuration and context
    - title: Schema Resolution
      link: /concepts/04-schema-resolution
      description: From JSON to React/Vue
    - title: Renderer
      link: /concepts/05-renderer
      description: The rendering engine
    - title: Middleware
      link: /concepts/06-middleware
      description: Transforming props and behavior
    - title: Debug System
      link: /concepts/07-debug-system
      description: Development tools
showcases:
  title: Showcases
  description: See schepta in action with interactive examples
  items:
    - title: React Examples
      link: /showcases/react
      description: React with react-hook-form
    - title: React Material UI
      link: /showcases/material-ui
      description: React with Material UI
    - title: React Chakra UI
      link: /showcases/chakra-ui
      description: React with Chakra UI
    - title: Vue Examples
      link: /showcases/vue
      description: Vue with custom form adapter
    - title: Vue Vuetify
      link: /showcases/vuetify
      description: Vue with Vuetify Material Design
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
