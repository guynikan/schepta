/**
 * Vanilla JS Form Renderer
 */

import type { FormAdapter } from '@schepta/core';
import type { DOMElement } from '@schepta/adapter-vanilla';

export interface FormRendererOptions {
  componentKey: string;
  schema: any;
  renderer: (componentKey: string, schema: any, parentProps?: Record<string, any>) => any;
  formAdapter: FormAdapter;
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
}

export function renderForm(options: FormRendererOptions): DocumentFragment | DOMElement | null {
  try {
    const result = options.renderer(options.componentKey, options.schema);
    
    if (!result) {
      console.warn('[renderForm] Renderer returned null/undefined for key:', options.componentKey);
      return null;
    }

    if (result && 'element' in result) {
      return result as DOMElement;
    }

    return null;
  } catch (error) {
    console.error('[renderForm] Error rendering component:', options.componentKey, error);
    throw error;
  }
}

