/**
 * Renderer Orchestrator
 * 
 * Framework-agnostic orchestrator that processes schemas, resolves components,
 * applies middlewares, and coordinates rendering.
 */

import type { RuntimeAdapter, ComponentSpec, DebugContextValue } from '../runtime/types';
import type { FormAdapter } from '../forms/types';
import type { MiddlewareFn, MiddlewareContext } from '../middleware/types';
import { getComponentSpec, getComponentRegistry } from '../registry/component-registry';
import { getRendererForType } from '../registry/renderer-registry';
import { applyMiddlewares } from '../middleware/types';

/**
 * Resolution result - successful component resolution
 */
export interface ResolutionSuccess {
  renderSpec: ComponentSpec;
  componentToRender: ComponentSpec;
  rendererFn: ReturnType<typeof getRendererForType>;
}

/**
 * Resolution result
 */
export type ResolutionResult = ResolutionSuccess | null;

/**
 * Factory setup result - provides runtime dependencies
 */
export interface FactorySetupResult {
  components: Record<string, ComponentSpec>;
  renderers?: Partial<Record<string, any>>;
  externalContext: Record<string, any>;
  state: Record<string, any>;
  middlewares: MiddlewareFn[];
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  debug?: DebugContextValue;
  formAdapter?: FormAdapter;
}

/**
 * Resolve component spec from schema
 */
export function resolveSpec(
  schema: any,
  componentKey: string,
  components: Record<string, ComponentSpec>,
  localRenderers?: Partial<Record<string, any>>,
  debugEnabled?: boolean
): ResolutionResult {
  const componentName = schema['x-component'] || componentKey;
  // components already has provider components merged in the factory
  // Pass components as globalComponents (includes provider components) and undefined as localComponents
  const renderSpec = getComponentSpec(componentName, components, undefined, debugEnabled);
  
  if (!renderSpec) {
    if (debugEnabled) {
      console.warn(`Component not found: ${componentName}`);
    }
    // Return error element (framework adapter will handle)
    return null;
  }

  const componentType = renderSpec.type || 'field';
  const rendererFn = getRendererForType(
    componentType,
    undefined,
    localRenderers as any,
    debugEnabled
  );

  return {
    renderSpec,
    componentToRender: renderSpec,
    rendererFn,
  };
}

/**
 * Renderer orchestrator factory
 * Returns a renderer function that processes schemas
 */
export function createRendererOrchestrator(
  getFactorySetup: () => FactorySetupResult,
  runtime: RuntimeAdapter
) {
  return function render(
    componentKey: string,
    schema: any,
    parentProps: Record<string, any> = {},
    namePath: string[] = []
  ): any {
    const { 
      components, 
      renderers: localRenderers, 
      externalContext, 
      state, 
      middlewares, 
      onSubmit,
      debug,
      formAdapter
    } = getFactorySetup();
    
    // Parse schema
    const { 'x-component-props': componentProps = {} } = schema;

    // Resolve component and renderer
    // components already has provider components merged in the factory
    const resolution = resolveSpec(
      schema, 
      componentKey, 
      components, 
      localRenderers, 
      debug?.isEnabled
    );
    
    // Check if resolution failed
    if (!resolution || resolution === null) {
      // Return error component (framework adapter will provide)
      return null;
    }

    // Extract successful resolution
    const { renderSpec, componentToRender, rendererFn } = resolution as ResolutionSuccess;

    // Construct full name path for nested fields
    const currentName = parentProps.name ? `${parentProps.name}.${componentKey}` : componentKey;

    // Props Processing
    const baseProps = {
      ...renderSpec.defaultProps,
      ...parentProps,
      name: currentName, // Add name prop for field components (with full path for nested fields)
      ...(Object.keys(componentProps).length > 0 ? { 'x-component-props': componentProps } : {}),
      // Extract x-ui props if present
      ...(schema['x-ui'] || {}),
      // Extract x-content if present (for content components)
      ...(schema['x-content'] ? { 'x-content': schema['x-content'] } : {}),
      // Pass externalContext so components can access it (user, api, etc.)
      externalContext,
      // Pass onSubmit separately so components can use it
      onSubmit,
    };

    // Middleware Application
    const middlewareContext: MiddlewareContext = {
      formState: state,
      externalContext,
      debug,
      formAdapter,
    };
    
    const mergedProps = applyMiddlewares(baseProps, schema, middlewares, middlewareContext);

    // Render children if schema has properties
    const children: any[] = [];
    if (schema.properties && typeof schema.properties === 'object') {
      for (const [key, childSchema] of Object.entries(schema.properties)) {
        const childResult = render(key, childSchema as any, mergedProps);
        if (childResult !== null && childResult !== undefined) {
          children.push(childResult);
        }
      }
    }

    // Final Rendering using renderer function with children
    return rendererFn(componentToRender, mergedProps, runtime, children.length > 0 ? children : undefined);
  };
}

