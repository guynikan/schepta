---
layout: home
---

<div class="home-hero">
  <div class="hero-content">
    <div class="hero-text">
      <h1 class="hero-title">
        <span class="title-main">Schepta</span>
        <span class="title-subtitle">Motor de renderização agnóstico de framework para UI dirigida por servidor</span>
      </h1>
      <p class="hero-description">
        Transforme schemas JSON em componentes de UI totalmente funcionais. Funciona perfeitamente com React, Vue e JavaScript vanilla.
      </p>
      <div class="hero-actions">
        <a class="action-button primary" href="/pt-BR/concepts/01-factories">Começar</a>
        <a class="action-button secondary" href="/pt-BR/examples/react">Ver Exemplos</a>
      </div>
      <div class="hero-install">
        <label class="install-label">
          <div class="install-input-wrapper">
            <input type="text" value="pnpm add @schepta/core" readonly class="install-input" id="install-command-pt" />
            <div class="install-copy-overlay" data-install-id="install-command-pt"></div>
            <span class="install-icon-leading">
              <TerminalIcon :size="24" class="install-icon" />
            </span>
            <span class="install-icon-trailing">
              <button type="button" class="install-copy-button" data-install-id="install-command-pt" aria-label="Copiar comando">
                <CopyIcon :size="20" class="install-icon install-icon-copy" />
                <CheckIcon :size="20" class="install-icon install-icon-check" style="display: none;" />
              </button>
            </span>
          </div>
        </label>
      </div>
    </div>
    <div class="hero-image">
      <img src="/guanche-gecko-head.svg" alt="Gecko Guanche - mascote do schepta" class="gecko-head" />
    </div>
  </div>
</div>

<div class="home-features">
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">🚀</div>
      <h3>Agnóstico de Framework</h3>
      <p>Funciona com React, Vue e JavaScript vanilla</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">📋</div>
      <h3>Dirigido por Schema</h3>
      <p>Defina UI usando schemas JSON</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🔒</div>
      <h3>Type-Safe</h3>
      <p>Suporte completo a TypeScript</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🔧</div>
      <h3>Extensível</h3>
      <p>Componentes, renderers e middleware customizados</p>
    </div>
  </div>
</div>

<div class="home-example">
  <h2>💡 Exemplo Rápido</h2>
  <p>Este schema simples se torna um formulário totalmente funcional:</p>
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
        "placeholder": "Digite seu email"
      }
    }
  }
}
```
  </div>
</div>

<div class="home-sections">
  <div class="section-card">
    <h2>📚 Conceitos Fundamentais</h2>
    <p>Aprenda os conceitos fundamentais que impulsionam o schepta:</p>
    <ul>
      <li><a href="/pt-BR/concepts/01-factories">01. Factories</a> - Como schemas se tornam componentes</li>
      <li><a href="/pt-BR/concepts/02-schema-language">02. Schema Language</a> - A sintaxe para definir UI</li>
      <li><a href="/pt-BR/concepts/03-provider">03. Provider</a> - Configuração global e contexto</li>
      <li><a href="/pt-BR/concepts/04-schema-resolution">04. Schema Resolution</a> - De JSON para React/Vue</li>
      <li><a href="/pt-BR/concepts/05-renderer">05. Renderer</a> - O motor de renderização</li>
      <li><a href="/pt-BR/concepts/06-middleware">06. Middleware</a> - Transformando props e comportamento</li>
      <li><a href="/pt-BR/concepts/07-debug-system">07. Debug System</a> - Ferramentas de desenvolvimento</li>
    </ul>
  </div>

  <div class="section-card">
    <h2>🎯 Exemplos</h2>
    <p>Veja o schepta em ação com exemplos interativos:</p>
    <ul>
      <li><a href="/pt-BR/examples/react">Exemplos React</a> - React com react-hook-form</li>
      <li><a href="/pt-BR/examples/material-ui">React Material UI</a> - React com Material UI</li>
      <li><a href="/pt-BR/examples/chakra-ui">React Chakra UI</a> - React com Chakra UI</li>
      <li><a href="/pt-BR/examples/vue">Exemplos Vue</a> - Vue com adaptador de formulário customizado</li>
      <li><a href="/pt-BR/examples/vuetify">Vue Vuetify</a> - Vue com Vuetify Material Design</li>
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
  width: fit-content;
  max-width: 100%;
}

.action-button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none !important;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-block;
  cursor: pointer;
  border: none;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  outline: none;
}

.action-button:hover {
  text-decoration: none !important;
}

.action-button:visited {
  color: inherit;
}

.action-button.primary {
  background: var(--vp-c-brand-1);
  color: white !important;
}

.action-button.primary:hover {
  background: var(--vp-c-brand-2);
  color: white !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-decoration: none !important;
}

.action-button.primary:visited {
  color: white !important;
}

.action-button.secondary {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1) !important;
  border: 1px solid var(--vp-c-divider);
}

.action-button.secondary:hover {
  background: var(--vp-c-bg);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-text-1) !important;
  text-decoration: none !important;
}

.action-button.secondary:visited {
  color: var(--vp-c-text-1) !important;
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

.hero-install {
  margin-top: 2rem;
  width: fit-content;
  max-width: 100%;
}

.hero-install .install-input-wrapper {
  width: 100%;
  min-width: 0;
}

.install-label {
  display: block;
  width: 100%;
}

.install-input-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 100%;
}

.install-input {
  width: 100%;
  border-radius: 8px;
  border: 0;
  appearance: none;
  padding: 0.75rem 3rem 0.75rem 2.75rem;
  font-size: 0.9375rem;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', monospace;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.2s ease;
  cursor: text;
  user-select: all;
}

.install-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px rgba(var(--vp-c-brand-1-rgb), 0.1);
}

.install-copy-overlay {
  position: absolute;
  inset: 0;
  cursor: copy;
  z-index: 1;
}

.install-icon-leading {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  color: var(--vp-c-text-2);
  pointer-events: none;
  z-index: 2;
}

.install-icon-trailing {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  z-index: 2;
}

.install-copy-button {
  padding: 0.375rem;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-family: inherit;
}

.install-copy-button:hover {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.install-copy-button:active {
  transform: scale(0.95);
}

.install-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.install-icon-check {
  display: none !important;
}

.install-copy-button.copied .install-icon-copy {
  display: none !important;
}

.install-copy-button.copied .install-icon-check {
  display: block !important;
  color: var(--vp-c-brand-1) !important;
}

@media (max-width: 768px) {
  .hero-install {
    max-width: 100%;
  }
  
  .install-input {
    font-size: 0.875rem;
    padding: 0.625rem 2.75rem 0.625rem 2.5rem;
  }
}
</style>
