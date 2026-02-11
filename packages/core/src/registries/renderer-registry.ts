/**
 * Renderer Registry
 * 
 * Framework-agnostic renderer registration system.
 * Renderers are functions that wrap components with additional rendering logic.
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

let factoryDefaultRenderers: Record<string, RendererSpec> = {};

export function setFactoryDefaultRenderers(renderers: Record<string, RendererSpec>): void {
  factoryDefaultRenderers = renderers;
}

export function getFactoryDefaultRenderers(): Record<string, RendererSpec> {
  return factoryDefaultRenderers;
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