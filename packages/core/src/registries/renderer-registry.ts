/**
 * Renderer Registry
 *
 * Framework-agnostic renderer helpers. Renderers wrap components with
 * additional rendering logic (e.g. form field binding). Factories declare
 * their own defaults locally — there is no module-level global state here.
 */

import type { RendererSpec } from '../runtime/types';

/**
 * Props passed to field renderer components (framework-agnostic interface)
 * Each framework (React, Vue) will type the component appropriately.
 */
export interface FieldRendererProps {
  /** Field name (supports dot notation for nested fields) */
  name: string;
  component: any;
  /** Props to pass to the field component */
  componentProps: Record<string, any>;
  /** Optional children */
  children?: any;
}

/**
 * Create a renderer spec from a component.
 * Similar API to createComponentSpec - user just passes the component.
 *
 * @example Using with React
 * ```tsx
 * import { createRendererSpec } from '@schepta/core';
 * import { RHFFieldRenderer } from './rhf/RHFFieldRenderer';
 *
 * const renderers = {
 *   field: createRendererSpec({
 *     id: 'rhf-field-renderer',
 *     type: 'field',
 *     component: RHFFieldRenderer,
 *   }),
 * };
 *
 * <FormFactory renderers={renderers} />
 * ```
 */
export function createRendererSpec(
  config: RendererSpec
): RendererSpec {
  return {
    id: config.id,
    type: config.type,
    component: config.component,
  };
}
