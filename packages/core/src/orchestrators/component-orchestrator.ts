/**
 * Component Orchestrator
 * 
 * Framework-agnostic orchestrator that processes schemas, resolves components,
 * applies middlewares, and coordinates rendering.
 */

import type { RuntimeAdapter, ComponentSpec, DebugContextValue, RenderResult } from '../runtime/types';
import type { FormAdapter } from '../forms/types';
import type { MiddlewareFn, MiddlewareContext } from '../middleware/types';
import { applyMiddlewares } from '../middleware/types';
import { processValue } from '../expressions/template-processor';
import { hasTemplateExpressions } from '../expressions/template-detector';
import { createDefaultResolver } from '../expressions/variable-resolver';
import { createRendererOrchestrator } from './renderer-orchestrator';

/**
 * Resolution result - successful component resolution
 */
export interface ResolutionSuccess {
  componentSpec: ComponentSpec;
  rendererFn: (componentSpec: ComponentSpec, props: Record<string, any>, runtime: RuntimeAdapter, children?: any[]) => RenderResult;
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
  customComponents?: Record<string, ComponentSpec>;
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
  customComponents?: Record<string, ComponentSpec>,
  renderers?: Partial<Record<string, any>>,
  debugEnabled?: boolean
): ResolutionResult {
  const componentName = schema['x-component'] || componentKey;

  const isCustomComponent = schema['x-custom'] === true;
  let componentSpec: ComponentSpec | null = null;

  if (isCustomComponent && customComponents?.[componentKey]) {
    componentSpec = customComponents[componentKey];
  }
  if (!componentSpec) {
    componentSpec = components[componentName] ?? null;
  }

  if (componentSpec && isCustomComponent && !customComponents?.[componentKey] && debugEnabled) {
      console.warn(
        `x-custom is set but no custom component registered for "${componentKey}"; using "${componentName}" from registry.`
      );
  }

  if (!componentSpec) {
    if (debugEnabled) {
      console.warn(`Component not found: ${componentName}`);
    }
    // Return error element (framework adapter will handle)
    return null;
  }

  const componentType = componentSpec.type || 'field';
  const rendererFn = createRendererOrchestrator(renderers?.[componentType]);

  return {
    componentSpec,
    rendererFn,
  };
}

/**
 * Component orchestrator factory
 * Returns a renderer function that processes schemas
 */
export function createComponentOrchestrator(
  getFactorySetup: () => FactorySetupResult,
  runtime: RuntimeAdapter
) {
  // Cache for static subtrees: schema nodes without {{ }} produce identical output
  // across renders (only formValues/externalContext change between renders).
  // Key: "componentKey\0parentName" → WeakMap<schemaRef, renderResult>
  const _staticCache = new Map<string, WeakMap<object, any>>();

  return function render(
    componentKey: string,
    schema: any,
    parentProps: Record<string, any> = {},
    namePath: string[] = [],
    isDirectRootProperty: boolean = false,
    _cachedSetup?: FactorySetupResult & { resolver: ReturnType<typeof createDefaultResolver>; resolverContext: { externalContext: Record<string, any>; formValues: Record<string, any> }; middlewareContext: MiddlewareContext }
  ): any {
    // Resolve setup + resolver once per top-level call, reuse in recursion
    const cached = _cachedSetup ?? (() => {
      const setup = getFactorySetup();
      const resolverContext = {
        externalContext: setup.externalContext,
        formValues: setup.state,
      };
      const resolver = createDefaultResolver(resolverContext);
      const middlewareContext: MiddlewareContext = {
        formValues: setup.state,
        externalContext: setup.externalContext,
        debug: setup.debug,
        formAdapter: setup.formAdapter,
      };
      return { ...setup, resolver, resolverContext, middlewareContext };
    })();

    const {
      components,
      customComponents,
      renderers,
      externalContext,
      state,
      middlewares,
      onSubmit,
      debug,
      resolver,
      resolverContext,
      middlewareContext,
    } = cached;

    // Static branch cache: if this schema node has no templates and same reference,
    // reuse the previous render result (schema is immutable between renders).
    const isStaticNode = schema && typeof schema === 'object' && !hasTemplateExpressions(schema);
    if (isStaticNode) {
      const cacheKey = `${componentKey}\0${parentProps.name || ''}`;
      const weakMap = _staticCache.get(cacheKey);
      if (weakMap) {
        const cachedResult = weakMap.get(schema);
        if (cachedResult !== undefined) {
          return cachedResult;
        }
      }
    }

    const processedSchema = processValue(schema, resolver, resolverContext) as any;

    // Visibility pruning
    const xUi = processedSchema['x-ui'] || {};
    if (xUi.visible === false) {
      return null;
    }

    const { 'x-component-props': componentProps = {} } = processedSchema;

    const resolution = resolveSpec(
      processedSchema,
      componentKey,
      components,
      customComponents,
      renderers,
      debug?.isEnabled
    );

    if (!resolution || resolution === null) {
      return null;
    }

    const { componentSpec, rendererFn } = resolution as ResolutionSuccess;

    const isFieldComponent = componentSpec.type === 'field';

    const shouldIncludeInPath = isFieldComponent || isDirectRootProperty;
    const currentName = shouldIncludeInPath
      ? (parentProps.name ? `${parentProps.name}.${componentKey}` : componentKey)
      : parentProps.name;

    const baseProps = {
      ...componentSpec.defaultProps,
      ...parentProps,
      'data-test-id': `${componentKey}`,
      schema: processedSchema,
      ...(isFieldComponent && currentName ? { name: currentName } : {}),
      ...(Object.keys(componentProps).length > 0 ? { 'x-component-props': componentProps } : {}),
      'x-ui': processedSchema['x-ui'],
      ...(processedSchema['x-content'] ? { 'x-content': processedSchema['x-content'] } : {}),
      externalContext,
      onSubmit,
    };

    const mergedProps = applyMiddlewares(baseProps, processedSchema, middlewares, middlewareContext);

    const children: any[] = [];
    if (processedSchema.properties && typeof processedSchema.properties === 'object') {
      const childParentProps = {
        ...mergedProps,
        ...(currentName !== undefined ? { name: currentName } : {}),
      };

      const sortedEntries = Object.entries(processedSchema.properties).sort(
        ([, a], [, b]) => {
          const orderA = (a as any)?.['x-ui']?.order ?? Infinity;
          const orderB = (b as any)?.['x-ui']?.order ?? Infinity;
          return orderA - orderB;
        }
      );

      for (const [key, childSchema] of sortedEntries) {
        const isChildRootProperty = !parentProps.name && componentKey === 'FormContainer';
        const childResult = render(key, childSchema as any, childParentProps, namePath, isChildRootProperty, cached);
        if (childResult !== null && childResult !== undefined) {
          children.push(childResult);
        }
      }
    }

    const result = rendererFn(componentSpec, mergedProps, runtime, children.length > 0 ? children : undefined);

    // Store in static cache for reuse on next render pass
    if (isStaticNode) {
      const cacheKey = `${componentKey}\0${parentProps.name || ''}`;
      let weakMap = _staticCache.get(cacheKey);
      if (!weakMap) {
        weakMap = new WeakMap();
        _staticCache.set(cacheKey, weakMap);
      }
      weakMap.set(schema, result);
    }

    return result;
  };
}