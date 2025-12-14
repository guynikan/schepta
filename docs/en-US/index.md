---
layout: home
---

<div class="home-hero">
  <div class="hero-content">
    <div class="hero-text">
      <h1 class="hero-title">
        <span class="title-main">Schepta</span>
        <span class="title-subtitle">Framework-agnostic rendering engine for server-driven UI</span>
      </h1>
      <p class="hero-description">
        Transform JSON schemas into fully functional UI components. Works seamlessly with React, Vue, and vanilla JavaScript.
      </p>
      <div class="hero-actions">
        <a class="action-button primary" href="/en-US/concepts/01-factories">Get Started</a>
        <a class="action-button secondary" href="/en-US/examples/react">View Examples</a>
      </div>
    </div>
    <div class="hero-image">
      <img src="/guanche-gecko-head.svg" alt="Guanche Gecko - schepta mascot" class="gecko-head" />
    </div>
  </div>
</div>

<div class="home-features">
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">🚀</div>
      <h3>Framework Agnostic</h3>
      <p>Works with React, Vue, and vanilla JavaScript</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">📋</div>
      <h3>Schema-Driven</h3>
      <p>Define UI using JSON schemas</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🔒</div>
      <h3>Type-Safe</h3>
      <p>Full TypeScript support</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🔧</div>
      <h3>Extensible</h3>
      <p>Custom components, renderers, and middleware</p>
    </div>
  </div>
</div>

<div class="home-example">
  <h2>💡 Quick Example</h2>
  <p>This simple schema becomes a fully functional form:</p>
  <div class="code-example">
```json
{
  "type": "object",
  "x-component": "form-container",
  "properties": {
    "email": {
      "type": "string",
      "x-component": "InputText",
      "x-ui": {
        "label": "Email",
        "placeholder": "Enter your email"
      }
    }
  }
}
```
  </div>
</div>

<div class="home-sections">
  <div class="section-card">
    <h2>📚 Core Concepts</h2>
    <p>Learn the fundamental concepts that power schepta:</p>
    <ul>
      <li><a href="/en-US/concepts/01-factories">01. Factories</a> - How schemas become components</li>
      <li><a href="/en-US/concepts/02-schema-language">02. Schema Language</a> - The syntax for defining UI</li>
      <li><a href="/en-US/concepts/03-provider">03. Provider</a> - Global configuration and context</li>
      <li><a href="/en-US/concepts/04-schema-resolution">04. Schema Resolution</a> - From JSON to React/Vue</li>
      <li><a href="/en-US/concepts/05-renderer">05. Renderer</a> - The rendering engine</li>
      <li><a href="/en-US/concepts/06-middleware">06. Middleware</a> - Transforming props and behavior</li>
      <li><a href="/en-US/concepts/07-debug-system">07. Debug System</a> - Development tools</li>
    </ul>
  </div>

  <div class="section-card">
    <h2>🎯 Examples</h2>
    <p>See schepta in action with interactive examples:</p>
    <ul>
      <li><a href="/en-US/examples/react">React Examples</a> - React with react-hook-form</li>
      <li><a href="/en-US/examples/material-ui">React Material UI</a> - React with Material UI</li>
      <li><a href="/en-US/examples/chakra-ui">React Chakra UI</a> - React with Chakra UI</li>
      <li><a href="/en-US/examples/vue">Vue Examples</a> - Vue with custom form adapter</li>
      <li><a href="/en-US/examples/vuetify">Vue Vuetify</a> - Vue with Vuetify Material Design</li>
    </ul>
  </div>
</div>

<style>
.home-hero {
  padding: 4rem 2rem;
  background: linear-gradient(135deg, var(--vp-c-bg-soft) 0%, var(--vp-c-bg) 100%);
  border-radius: 12px;
  margin-bottom: 4rem;
  position: relative;
  overflow: hidden;
}


.hero-content {
  display: flex;
  align-items: center;
  gap: 4rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.hero-text {
  flex: 1;
}

.hero-title {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.title-main {
  font-size: 3.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--vp-c-brand-1) 0%, var(--vp-c-brand-2) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.title-subtitle {
  font-size: 1.25rem;
  color: var(--vp-c-text-2);
  font-weight: 400;
}

.hero-description {
  font-size: 1.125rem;
  color: var(--vp-c-text-1);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-block;
}

.action-button.primary {
  background: var(--vp-c-brand-1);
  color: white;
}

.action-button.primary:hover {
  background: var(--vp-c-brand-2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-button.secondary {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

.action-button.secondary:hover {
  background: var(--vp-c-bg);
  border-color: var(--vp-c-brand-1);
}

.hero-image {
  flex: 0 0 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gecko-head {
  width: 100%;
  max-width: 300px;
  height: auto;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.home-features {
  margin: 4rem 0;
  position: relative;
  overflow: hidden;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.feature-card {
  padding: 2rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--vp-c-text-1);
}

.feature-card p {
  color: var(--vp-c-text-2);
  margin: 0;
}

.home-example {
  margin: 4rem 0;
  padding: 2rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  overflow: hidden;
}

.home-example h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
}

.home-example p {
  color: var(--vp-c-text-2);
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
}

.code-example {
  background: var(--vp-c-bg);
  border-radius: 8px;
  padding: 1.5rem;
  overflow-x: auto;
  position: relative;
  z-index: 1;
}

.home-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin: 4rem 0;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  overflow: hidden;
}

.section-card {
  padding: 2rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  position: relative;
  z-index: 1;
}

.section-card h2 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.section-card p {
  color: var(--vp-c-text-2);
  margin-bottom: 1rem;
}

.section-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.section-card li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.section-card li:last-child {
  border-bottom: none;
}

.section-card a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  transition: color 0.2s ease;
}

.section-card a:hover {
  color: var(--vp-c-brand-2);
  text-decoration: underline;
}

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
  }

  .hero-image {
    flex: 1;
    max-width: 200px;
  }

  .title-main {
    font-size: 2.5rem;
  }

  .home-sections {
    grid-template-columns: 1fr;
  }
}
</style>
