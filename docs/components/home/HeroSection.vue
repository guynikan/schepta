<template>
  <div class="home-hero">
    <div class="hero-content">
      <div class="hero-text">
        <h1 class="hero-title">
          <span class="title-main">{{ hero.title }}</span>
          <span class="title-subtitle">{{ hero.subtitle }}</span>
        </h1>
        <p class="hero-description">
          {{ hero.description }}
        </p>
        <div class="hero-actions">
          <a
            class="action-button primary"
            :href="`/${locale}/guide/quick-start`"
          >
            {{ hero.getStarted }}
          </a>
          <a
            class="action-button secondary"
            :href="`/${locale}/showcases/react`"
          >
            {{ hero.viewShowcases }}
          </a>
        </div>
        <div class="hero-install">
          <label class="install-label">
            <div class="install-input-wrapper">
              <input
                type="text"
                value="pnpm add @schepta/core"
                readonly
                class="install-input"
                :id="hero.installCommandId"
              />
              <div
                class="install-copy-overlay"
                :data-install-id="hero.installCommandId"
              ></div>
              <span class="install-icon-leading">
                <TerminalIcon
                  :size="24"
                  class="install-icon"
                />
              </span>
              <span class="install-icon-trailing">
                <button
                  type="button"
                  class="install-copy-button"
                  :data-install-id="hero.installCommandId"
                  :aria-label="hero.copyButtonLabel"
                >
                  <CopyIcon
                    :size="20"
                    class="install-icon install-icon-copy"
                  />
                  <CheckIcon
                    :size="20"
                    class="install-icon install-icon-check"
                    style="display: none"
                  />
                </button>
              </span>
            </div>
          </label>
        </div>
      </div>
      <div class="hero-image">
        <GeckoHead :alt="hero.geckoAlt" />
        <div class="rainbow"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useData } from "vitepress";
  import { computed } from "vue";
  import GeckoHead from "./GeckoHead.vue";

  const { frontmatter } = useData();

  const hero = computed(() => frontmatter.value.homeHero);
  const locale = computed(() => frontmatter.value.locale);
</script>

<style scoped>
  .home-hero {
    padding: 4rem 2rem;
    background: linear-gradient(
      135deg,
      var(--vp-c-bg-soft) 0%,
      var(--vp-c-bg) 100%
    );
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
    background: linear-gradient(
      135deg,
      var(--vp-c-brand-1) 0%,
      var(--vp-c-brand-2) 100%
    );
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
    font-family: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono",
      "Source Code Pro", monospace;
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

    .hero-install {
      max-width: 100%;
    }

    .install-input {
      font-size: 0.875rem;
      padding: 0.625rem 2.75rem 0.625rem 2.5rem;
    }
  }


</style>
