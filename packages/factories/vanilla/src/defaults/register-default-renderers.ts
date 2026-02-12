/**
 * Register default renderers for Vanilla factory
 */

import { setFactoryDefaultRenderers, createRendererSpec } from '@schepta/core';
import type { FormAdapter } from '@schepta/core';
import { createDefaultFieldRenderer } from '../renderers/DefaultFieldRenderer';

/**
 * Register all default Vanilla renderers with the core registry
 * 
 * @param adapter Form adapter instance for field binding
 */
export function registerDefaultRenderers(adapter: FormAdapter) {
  setFactoryDefaultRenderers({
    field: createRendererSpec({
      id: 'field-renderer-vanilla',
      type: 'field',
      component: createDefaultFieldRenderer(adapter),
    }),
  });
}
