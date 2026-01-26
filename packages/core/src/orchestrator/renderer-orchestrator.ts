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
import { processValue } from '../expressions/template-processor';
import { createDefaultResolver } from '../expressions/variable-resolver';

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
    namePath: string[] = [],
    isDirectRootProperty: boolean = false
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
    
    // Process schema with template expressions BEFORE extracting props
    // This ensures that $formValues.* and $externalContext.* are replaced
    // in any property of the schema (x-ui, x-content, x-component-props, etc.)
    const resolver = createDefaultResolver({
      externalContext,
      formValues: state,
    });
    
    const processedSchema = processValue(schema, resolver, {
      externalContext,
      formValues: state,
    }) as any;
    
    // Check visibility via x-ui.visible
    // If visible === false, don't render this component (and its children)
    // By default, visible is true
    const xUi = processedSchema['x-ui'] || {};
    if (xUi.visible === false) {
      return null;
    }
    
    // Parse schema (now using processed schema)
    const { 'x-component-props': componentProps = {} } = processedSchema;

    // Resolve component and renderer
    // Use processedSchema for x-component resolution (in case x-component has templates)
    // components already has provider components merged in the factory
    const resolution = resolveSpec(
      processedSchema, 
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

    // Construct name path for nested fields
    // ONLY components with type: 'field' are included in the name path
    // EXCEPTION: componentKeys that are direct properties of root schema (isDirectRootProperty)
    // All other components (containers, FormContainer, content, etc.) are ignored
    const componentType = renderSpec.type || 'field';
    const isFieldComponent = componentType === 'field';
    
    // If field OR direct root property: add componentKey to name path
    // If not field and not root property: keep parentProps.name (don't add this component's key)
    const shouldIncludeInPath = isFieldComponent || isDirectRootProperty;
    const currentName = shouldIncludeInPath
      ? (parentProps.name ? `${parentProps.name}.${componentKey}` : componentKey)
      : parentProps.name; // Containers just pass parent's name, don't add their key

    // Props Processing (using processedSchema)
    const baseProps = {
      ...renderSpec.defaultProps,
      ...parentProps,
      // Add name prop ONLY for field components
      ...(isFieldComponent && currentName ? { name: currentName } : {}),
      ...(Object.keys(componentProps).length > 0 ? { 'x-component-props': componentProps } : {}),
      // Extract x-ui props if present (already processed)
      // ...(processedSchema['x-ui'] || {}),
      'x-ui': processedSchema['x-ui'],
      // Extract x-content if present (for content components, already processed)
      ...(processedSchema['x-content'] ? { 'x-content': processedSchema['x-content'] } : {}),
      // Pass externalContext so components can access it (user, api, etc.)
      externalContext,
      // Pass onSubmit separately so components can use it
      onSubmit,
    };

    // Middleware Application
    const middlewareContext: MiddlewareContext = {
      formValues: state,
      externalContext,
      debug,
      formAdapter,
    };
    
    const mergedProps = applyMiddlewares(baseProps, processedSchema, middlewares, middlewareContext);

    // Render children if schema has properties (use processedSchema)
    // Pass name to children: fields add to path, containers just pass it through
    const children: any[] = [];
    if (processedSchema.properties && typeof processedSchema.properties === 'object') {
      const childParentProps = {
        ...mergedProps,
        // Pass currentName to children (fields will add their key, containers will just pass it through)
        ...(currentName !== undefined ? { name: currentName } : {}),
      };

      // Sort children by x-ui.order (lower values first, undefined goes last)
      const sortedEntries = Object.entries(processedSchema.properties).sort(
        ([, a], [, b]) => {
          const orderA = (a as any)?.['x-ui']?.order ?? Infinity;
          const orderB = (b as any)?.['x-ui']?.order ?? Infinity;
          return orderA - orderB;
        }
      );
      
      for (const [key, childSchema] of sortedEntries) {
        // If this component is the root (FormContainer) and has no name, 
        // then its direct children are root properties and should be included in name path
        const isChildRootProperty = !parentProps.name && componentKey === 'FormContainer';
        const childResult = render(key, childSchema as any, childParentProps, namePath, isChildRootProperty);
        if (childResult !== null && childResult !== undefined) {
          children.push(childResult);
        }
      }
    }

    // Final Rendering using renderer function with children
    return rendererFn(componentToRender, mergedProps, runtime, children.length > 0 ? children : undefined);
  };
}

