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
    --schepta-text-1: #333333;
    --schepta-text-2: #666666;
    --schepta-border: #cccccc;
    --schepta-brand: #5c73e7;
    --schepta-brand-text: #ffffff;
    --schepta-error-bg: #fff0f0;
    --schepta-error-border: #ffcccc;
    --schepta-error-text: #cc0000;
    --schepta-error-text-muted: #660000;
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
