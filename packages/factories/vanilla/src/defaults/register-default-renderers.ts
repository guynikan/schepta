/**
 * Register default renderers for Vanilla factory
 * 
 * Note: Unlike React/Vue, Vanilla renderers need the FormAdapter instance
 * which is only available inside createFormFactory. Therefore, we export
 * a function that creates the renderers with the adapter.
 */

import { createRendererSpec } from '@schepta/core';
import type { FormAdapter } from '@schepta/core';
import { createDefaultFieldRenderer } from '../renderers/DefaultFieldRenderer';

/**
 * Create default renderers with form adapter binding
 * 
 * @param adapter Form adapter instance for field binding
 */
export function createDefaultRenderers(adapter: FormAdapter) {
  return {
    field: createRendererSpec({
      id: 'field-renderer-vanilla',
      type: 'field',
      component: () => createDefaultFieldRenderer(adapter) as any,
    }),
  };
}
