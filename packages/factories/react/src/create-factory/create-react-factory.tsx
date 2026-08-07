/**
 * createReactFactory
 *
 * Generic HOF that turns a factory specification into a React `forwardRef`
 * component. The resulting component:
 *   - Validates the provided `schema` against a JSON Schema definition.
 *   - Merges factory defaults, provider config, and local props.
 *   - Invokes the factory's `useSetup` hook to obtain state, optional state
 *     subscription, extra middlewares, and an imperative ref API.
 *   - Memoizes a Schepta orchestrator and renders the root schema node.
 *
 * @example Minimal factory
 * ```tsx
 * export const MyFactory = createReactFactory({
 *   schemaDefinition: mySchemaJson,
 *   rootComponentKey: 'MyRoot',
 *   defaultComponents,
 *   defaultRenderers,
 *   useSetup: ({ props }) => ({}),
 * });
 * ```
 */

import React, {
  forwardRef,
  useImperativeHandle,
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type RefAttributes,
} from 'react';
import { FormRenderer } from '../form-renderer';
import { useMergedScheptaConfig } from '../hooks/use-merged-config';
import { useScheptaSchemaValidation } from '../hooks/use-schepta-schema-validation';
import { injectScheptaTokens } from '../schepta-tokens';
import { useScheptaOrchestrator } from './hooks/use-schepta-orchestrator';
import type {
  CreateReactFactoryConfig,
  FactoryBaseProps,
} from './types';

export function createReactFactory<
  TProps extends FactoryBaseProps,
  TRefApi = unknown,
  TState extends Record<string, any> = Record<string, any>,
>(
  config: CreateReactFactoryConfig<TProps, TRefApi, TState>
): ForwardRefExoticComponent<PropsWithoutRef<TProps> & RefAttributes<TRefApi>> {
  const {
    displayName = 'ScheptaFactory',
    schemaDefinition,
    rootComponentKey,
    defaultComponents,
    defaultRenderers,
    useSetup,
  } = config;

  const Factory = forwardRef<TRefApi, TProps>(function ScheptaFactory(rawProps, ref) {
    const props = rawProps as TProps;

    // Every factory — including user-defined ones — needs the default tokens,
    // which carry the `:focus-visible` ring and the reduced-motion overrides.
    // Called during render (not in an effect) so the styles are in place
    // before first paint; the function is idempotent and no-ops under SSR,
    // where it runs again on the client during hydration.
    injectScheptaTokens();

    const validation = useScheptaSchemaValidation(props.schema, {
      schemaDefinition,
    });

    const mergedConfig = useMergedScheptaConfig({
      defaultComponents,
      defaultRenderers,
      components: props.components,
      customComponents: props.customComponents,
      renderers: props.renderers,
      externalContext: props.externalContext,
      middlewares: props.middlewares,
      debug: props.debug,
    });

    const setup = useSetup({ props, mergedConfig });

    useImperativeHandle(ref, () => setup.refApi as TRefApi, [setup.refApi]);

    const { renderer } = useScheptaOrchestrator({
      components: mergedConfig.components,
      customComponents: mergedConfig.customComponents,
      renderers: mergedConfig.renderers,
      externalContext: mergedConfig.externalContext,
      baseMiddlewares: mergedConfig.baseMiddlewares,
      debug: mergedConfig.debug,
      rootComponentKey,
      subscribe: setup.subscribe,
      getSnapshot: setup.getSnapshot as (() => Record<string, any>) | undefined,
      extraMiddlewares: setup.middlewares,
      extraExternalContext: setup.externalContext,
      formAdapter: setup.formAdapter,
      onSubmit: setup.onSubmit,
    });

    if (!validation.valid) {
      return (
        <div
          style={{
            padding: '16px',
            backgroundColor: 'var(--schepta-error-bg)',
            border: '1px solid var(--schepta-error-border)',
            borderRadius: '4px',
            fontFamily: 'monospace',
          }}
        >
          <h3 style={{ color: 'var(--schepta-error-text)', margin: '0 0 12px 0' }}>
            Schema Validation Error
          </h3>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              fontSize: '12px',
              margin: 0,
              color: 'var(--schepta-error-text-muted)',
            }}
          >
            {validation.formattedErrors}
          </pre>
        </div>
      );
    }

    const resolvedRootKey =
      (props.schema as any)?.['x-component'] || rootComponentKey;

    const tree = (
      <FormRenderer
        componentKey={resolvedRootKey}
        schema={props.schema}
        renderer={renderer}
      />
    );

    return <>{setup.wrap ? setup.wrap(tree) : tree}</>;
  });

  Factory.displayName = displayName;

  return Factory;
}
