/**
 * Helper for single-spa vanilla JS apps (no framework).
 * Returns bootstrap, mount, unmount using render + optional styles + afterMount.
 */

export interface SingleSpaVanillaProps {
  name?: string;
  singleSpa?: unknown;
  mountParcel?: unknown;
  customProps?: Record<string, unknown>;
  domElement?: HTMLElement;
  domElementGetter?(): HTMLElement;
}

export interface SingleSpaVanillaOptions {
  /** Returns the root DOM element to mount. */
  render(props: SingleSpaVanillaProps): HTMLElement;
  /** Optional CSS string injected into document.head on mount, removed on unmount. */
  styles?: string;
  /** Optional: run after the root element is appended (e.g. attach event listeners). */
  afterMount?(element: HTMLElement, props: SingleSpaVanillaProps): void;
}

export interface SingleSpaVanillaLifecycles {
  bootstrap(props: SingleSpaVanillaProps): Promise<void>;
  mount(props: SingleSpaVanillaProps): Promise<void>;
  unmount(props: SingleSpaVanillaProps): Promise<void>;
}

export function singleSpaVanilla(options: SingleSpaVanillaOptions): SingleSpaVanillaLifecycles {
  let rootElement: HTMLElement | null = null;
  let styleElement: HTMLStyleElement | null = null;

  return {
    bootstrap(): Promise<void> {
      return Promise.resolve();
    },

    mount(props: SingleSpaVanillaProps): Promise<void> {
      const container =
        props.domElement ??
        (typeof props.domElementGetter === 'function' ? props.domElementGetter() : null);

      if (!container) {
        return Promise.resolve();
      }

      rootElement = options.render(props);
      container.appendChild(rootElement);

      if (options.styles) {
        styleElement = document.createElement('style');
        styleElement.textContent = options.styles;
        document.head.appendChild(styleElement);
      }

      options.afterMount?.(rootElement, props);
      return Promise.resolve();
    },

    unmount(): Promise<void> {
      if (rootElement?.parentNode) {
        rootElement.parentNode.removeChild(rootElement);
      }
      rootElement = null;

      if (styleElement?.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
      styleElement = null;

      return Promise.resolve();
    },
  };
}
