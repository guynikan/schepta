/**
 * Vanilla JS Form Renderer
 */

import type { FormAdapter } from '@spectra/core';
import type { DOMElement } from '@spectra/adapter-vanilla';

export interface FormRendererOptions {
  componentKey: string;
  schema: any;
  renderer: (componentKey: string, schema: any, parentProps?: Record<string, any>) => any;
  formAdapter: FormAdapter;
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
}

export function renderForm(options: FormRendererOptions): DocumentFragment | DOMElement | null {
  const result = options.renderer(options.componentKey, options.schema);
  
  if (!result) {
    return null;
  }

  // Handle children if schema has properties
  if (options.schema.properties && typeof options.schema.properties === 'object') {
    const fragment = document.createDocumentFragment();
    
    if (result && 'element' in result) {
      const domElement = result as DOMElement;
      fragment.appendChild(domElement.element);
      
      for (const [key, childSchema] of Object.entries(options.schema.properties)) {
        const childResult = options.renderer(key, childSchema as any);
        if (childResult && 'element' in childResult) {
          fragment.appendChild((childResult as DOMElement).element);
        }
      }
      
      return fragment;
    }
  }

  if (result && 'element' in result) {
    return result as DOMElement;
  }

  return null;
}

