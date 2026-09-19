/**
 * Schepta Design Tokens
 *
 * Default CSS custom properties for all Schepta default components.
 * Consumers can override these variables to theme the form components.
 *
 * @example
 * ```css
 * :root {
 *   --schepta-brand: #6366f1;
 *   --schepta-border: #d1d5db;
 * }
 * ```
 */

const SCHEPTA_TOKENS = `
@layer schepta-defaults {
  :root {
    --schepta-bg: #ffffff;
    --schepta-bg-soft: #f6f6f7;
    --schepta-bg-subtle: #f6f6f7;
    --schepta-bg-selected: rgba(92, 115, 231, 0.12);
    --schepta-text-1: #333333;
    --schepta-text-2: #595959;
    --schepta-text-3: #6b6b6b;
    --schepta-border: #cccccc;
    --schepta-border-subtle: rgba(0, 0, 0, 0.08);
    --schepta-brand: #5c73e7;
    --schepta-brand-text: #ffffff;
    --schepta-accent: #4457c7;
    --schepta-error-bg: #fff0f0;
    --schepta-error-border: #ffcccc;
    --schepta-error-text: #b32020;
    --schepta-error-text-muted: #660000;
    --schepta-focus-ring: #1a56db;
    --schepta-focus-ring-width: 2px;
    --schepta-focus-ring-offset: 2px;
  }

  /*
   * WCAG 2.4.7 (Focus Visible). Most default components are unstyled buttons
   * (border: none, background: transparent), so the UA focus ring is either
   * invisible or absent — every interactive element inside a Schepta subtree
   * gets an explicit ring instead.
   *
   * :focus-visible (not :focus) so pointer users do not see a ring on click.
   */
  [data-schepta-menu] :focus-visible,
  [data-schepta-menu-item] :focus-visible,
  [data-schepta-tabs] :focus-visible,
  [data-schepta-table] :focus-visible,
  [data-schepta-modal] :focus-visible,
  [data-schepta-layout] :focus-visible,
  [data-schepta-form] :focus-visible,
  [data-schepta-modal]:focus-visible,
  [data-schepta-skip-link]:focus-visible {
    outline: var(--schepta-focus-ring-width) solid var(--schepta-focus-ring);
    outline-offset: var(--schepta-focus-ring-offset);
    border-radius: 2px;
  }

  /* WCAG 2.3.3 (Animation from Interactions). */
  @media (prefers-reduced-motion: reduce) {
    [data-schepta-menu] *,
    [data-schepta-tabs] *,
    [data-schepta-table] *,
    [data-schepta-modal] *,
    [data-schepta-layout] *,
    [data-schepta-form] * {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
    }
  }
}
`;

let injected = false;

/**
 * Injects default Schepta CSS tokens into the document head.
 * Safe to call multiple times — only injects once.
 * No-op in SSR/Node environments.
 */
export function injectScheptaTokens(): void {
  if (injected || typeof document === 'undefined') return;
  const existing = document.getElementById('schepta-default-tokens');
  if (existing) {
    injected = true;
    return;
  }
  const style = document.createElement('style');
  style.id = 'schepta-default-tokens';
  style.textContent = SCHEPTA_TOKENS;
  document.head.appendChild(style);
  injected = true;
}
