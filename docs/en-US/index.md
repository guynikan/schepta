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
      description: How schemas become components
    - title: Schema Language
      description: The syntax for defining UI
    - title: Provider
      description: Global configuration and context
    - title: Schema Resolution
      description: From JSON to React/Vue
    - title: Renderer
      description: The rendering engine
    - title: Middleware
      description: Transforming props and behavior
    - title: Debug System
      description: Development tools
showcases:
  title: Showcases
  description: Showcases of how to use schepta
  items:
    - title: React
      description: React example
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
