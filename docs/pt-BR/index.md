---
layout: home
locale: pt-BR

homeHero:
  title: Schepta
  subtitle: Motor de renderização agnóstico de framework para UI dirigida por servidor
  description: Transforme schemas JSON em componentes de UI totalmente funcionais. Funciona perfeitamente com React, Vue e JavaScript vanilla.
  getStarted: Começar
  viewExamples: Ver Exemplos
  installCommandId: install-command-pt
  copyButtonLabel: Copiar comando
  geckoAlt: Gecko Guanche - mascote do schepta
homeFeatures:
  title: Funcionalidades
  description: Funcionalidades do Schepta
  items:
    - icon: 🚀
      title: Agnóstico de Framework
      description: Funciona com React, Vue e JavaScript vanilla
    - icon: 📋
      title: Dirigido por Schema
      description: Defina UI usando schemas JSON
    - icon: 🔒
      title: Type-Safe
      description: Suporte completo a TypeScript
    - icon: 🔧
      title: Extensível
      description: Componentes, renderers e middleware customizados
example:
  title: Exemplo Rápido
  description: Este schema simples se torna um formulário totalmente funcional
concepts:
  title: Conceitos Fundamentais
  description: Aprenda os conceitos fundamentais que impulsionam o schepta
  items:
    - title: Factories
      link: /concepts/01-factories
      description: Como schemas se tornam componentes
    - title: Schema Language
      link: /concepts/02-schema-language
      description: A sintaxe para definir UI
    - title: Provider
      link: /concepts/03-provider
      description: Configuração global e contexto
    - title: Schema Resolution
      link: /concepts/04-schema-resolution
      description: De JSON para React/Vue
    - title: Renderer
      link: /concepts/05-renderer
      description: O motor de renderização
    - title: Middleware
      link: /concepts/06-middleware
      description: Transformando props e comportamento
    - title: Debug System
      link: /concepts/07-debug-system
      description: Ferramentas de desenvolvimento
examples:
  title: Exemplos
  description: Veja o schepta em ação com exemplos interativos
  items:
    - title: Exemplos React
      link: /examples/react
      description: React com react-hook-form
    - title: React Material UI
      link: /examples/material-ui
      description: React com Material UI
    - title: React Chakra UI
      link: /examples/chakra-ui
      description: React com Chakra UI
    - title: Exemplos Vue
      link: /examples/vue
      description: Vue com adaptador de formulário customizado
    - title: Vue Vuetify
      link: /examples/vuetify
      description: Vue com Vuetify Material Design
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
