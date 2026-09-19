/**
 * useScheptaOrchestrator Hook
 *
 * Framework-specific (React) wiring for the framework-agnostic
 * `createComponentOrchestrator` from `@schepta/core`.
 *
 * Handles:
 *   - Runtime adapter creation (memoized)
 *   - Optional fine-grained state subscription (`useSyncExternalStore`) that
 *     only triggers a factory re-render when the schema depends on the state
 *     (e.g. `{{ $formValues.* }}` templates). When no subscription is provided
 *     the factory never re-renders on state changes.
 *   - Building the `FactorySetupResult` closure consumed by the orchestrator.
 *   - Memoizing the renderer so that stable dependencies never recreate it.
 */

import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
import {
  createComponentOrchestrator,
  createTemplateExpressionMiddleware,
  type FactorySetupResult,
  type FormAdapter,
  type MiddlewareFn,
  type DebugContextValue,
  type ComponentSpec,
} from '@schepta/core';
import { createReactRuntimeAdapter } from '@schepta/adapter-react';
import { createDebugContext } from '../../utils/debug';

export interface UseScheptaOrchestratorInput {
  /** Resolved components (defaults + provider + local) */
  components: Record<string, ComponentSpec>;
  /** Resolved custom components (provider + local) */
  customComponents: Record<string, ComponentSpec>;
  /** Resolved renderers (defaults + provider + local) */
  renderers: Partial<Record<string, any>>;
  /** Resolved external context */
  externalContext: Record<string, any>;
  /** User middlewares (after template middleware is prepended) */
  baseMiddlewares: MiddlewareFn[];
  /** Debug flag from merged config */
  debug: boolean;
  /** Schema root component key (e.g. `'FormContainer'`, `'MenuContainer'`) */
  rootComponentKey: string;

  /** Optional state subscription (e.g. form values store) */
  subscribe?: (onChange: () => void) => () => void;
  /** Optional state snapshot (must be paired with `subscribe`) */
  getSnapshot?: () => Record<string, any>;
  /** Current setup state when no external snapshot function is provided */
  state?: Record<string, any>;

  /** Extra middlewares from the factory's `useSetup` (prepended before user middlewares) */
  extraMiddlewares?: MiddlewareFn[];
  /** Extra external context from the factory's `useSetup` */
  extraExternalContext?: Record<string, any>;
  /** Form adapter (optional) from the factory's `useSetup` */
  formAdapter?: FormAdapter;
  /** onSubmit passed through to the orchestrator */
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
}

export interface UseScheptaOrchestratorResult {
  /**
   * Stable renderer function produced by the component orchestrator.
   * Accepts `(componentKey, schema, parentProps?)` and returns a React element.
   */
  renderer: (componentKey: string, schema: any, parentProps?: Record<string, any>) => any;
  /** Current state snapshot (reactive when `subscribe`/`getSnapshot` provided) */
  state: Record<string, any>;
}

const EMPTY_STATE: Record<string, any> = Object.freeze({});

/**
 * Wires up the component orchestrator for a React factory.
 */
export function useScheptaOrchestrator(
  input: UseScheptaOrchestratorInput
): UseScheptaOrchestratorResult {
  const runtime = useMemo(() => createReactRuntimeAdapter(), []);

  const noopSubscribe = useCallback(() => () => {}, []);
  const emptySnapshot = useCallback(() => EMPTY_STATE, []);
  const setupSnapshot = useCallback(
    () => input.state ?? EMPTY_STATE,
    [input.state]
  );

  const subscribe = input.subscribe ?? noopSubscribe;
  const getSnapshot = input.getSnapshot ?? (input.state ? setupSnapshot : emptySnapshot);

  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // Stable ref so the orchestrator closure always reads the latest state
  // without being recreated on every state change.
  const stateRef = useRef(state);
  stateRef.current = state;

  // Refs for per-render values that should be reflected in the closure but
  // should not recreate the orchestrator.
  const extraCtxRef = useRef(input.extraExternalContext);
  extraCtxRef.current = input.extraExternalContext;
  const extraMwRef = useRef(input.extraMiddlewares);
  extraMwRef.current = input.extraMiddlewares;
  const onSubmitRef = useRef(input.onSubmit);
  onSubmitRef.current = input.onSubmit;
  const formAdapterRef = useRef(input.formAdapter);
  formAdapterRef.current = input.formAdapter;

  const renderer = useMemo(() => {
    const getFactorySetup = (): FactorySetupResult => {
      const currentState = stateRef.current;
      const debugContext: DebugContextValue | undefined = createDebugContext(input.debug);

      const mergedExternalContext = {
        ...input.externalContext,
        ...(extraCtxRef.current || {}),
      };

      const templateMiddleware = createTemplateExpressionMiddleware({
        externalContext: mergedExternalContext,
        formValues: currentState,
        debug: debugContext,
      });

      const middlewares: MiddlewareFn[] = [
        templateMiddleware,
        ...(extraMwRef.current || []),
        ...input.baseMiddlewares,
      ];

      return {
        components: input.components,
        customComponents: input.customComponents,
        renderers: input.renderers,
        externalContext: mergedExternalContext,
        state: currentState,
        middlewares,
        onSubmit: onSubmitRef.current,
        debug: debugContext,
        formAdapter: formAdapterRef.current,
        rootComponentKey: input.rootComponentKey,
      };
    };

    return createComponentOrchestrator(getFactorySetup, runtime);
  }, [
    input.components,
    input.customComponents,
    input.renderers,
    input.externalContext,
    input.baseMiddlewares,
    input.debug,
    input.rootComponentKey,
    runtime,
  ]);

  return { renderer, state };
}
