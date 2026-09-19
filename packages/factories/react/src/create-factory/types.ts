/**
 * Types for createReactFactory
 *
 * Contract between the generic React factory primitive and each concrete
 * factory (FormFactory, MenuFactory, user-defined factories).
 */

import type { ReactNode } from 'react';
import type {
  ComponentSpec,
  MiddlewareFn,
  FormAdapter,
} from '@schepta/core';
import type { MergedConfig } from '../hooks/use-merged-config';

/**
 * Props shared by every Schepta React factory.
 *
 * Concrete factories extend this with their own props (e.g. `onSubmit`,
 * `initialValues`, `adapter` for forms).
 */
export interface FactoryBaseProps {
  /** Schema instance to render */
  schema: any;
  /** Local components override (highest priority) */
  components?: Record<string, ComponentSpec>;
  /** Local custom components override */
  customComponents?: Record<string, ComponentSpec>;
  /** Local renderers override (by component type) */
  renderers?: Partial<Record<string, any>>;
  /** External context for expression resolution (merged with provider) */
  externalContext?: Record<string, any>;
  /** Extra middlewares appended after provider and defaults */
  middlewares?: MiddlewareFn[];
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Context passed to a factory's `useSetup` hook on every render.
 */
export interface FactorySetupContext<TProps extends FactoryBaseProps> {
  /** Complete props as passed to the factory component */
  props: TProps;
  /** Merged config (defaults + provider + local) */
  mergedConfig: MergedConfig;
}

/**
 * Return value of a factory's `useSetup` hook.
 *
 * Every field is optional — a factory only provides what it needs. At a
 * minimum, state will default to `{}` and no imperative ref API is exposed.
 */
export interface FactorySetupReturn<TRefApi = unknown, TState = Record<string, any>> {
  /**
   * Current state value at render time. For FormFactory this is the current
   * form values snapshot; for a MenuFactory it could be the active item.
   */
  state?: TState;
  /** Form adapter (only relevant for form-style factories) */
  formAdapter?: FormAdapter;
  /** Callback invoked by the orchestrator for submit-style flows */
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  /** Extra middlewares injected BEFORE the merged user middlewares */
  middlewares?: MiddlewareFn[];
  /** Additional entries merged into `externalContext` */
  externalContext?: Record<string, any>;
  /** Imperative ref API exposed via `useImperativeHandle` */
  refApi?: TRefApi;
  /**
   * State subscription source used by `useSyncExternalStore` to trigger a
   * re-render of the factory component when the state changes (e.g. for
   * cross-field template expression resolution). When omitted, the factory
   * does not re-render on state changes.
   */
  subscribe?: (onChange: () => void) => () => void;
  /** Snapshot function paired with `subscribe` */
  getSnapshot?: () => TState;
  /**
   * Wraps the rendered schema tree in an optional factory-specific context
   * provider (e.g. `ScheptaFormProvider`, `ScheptaMenuProvider`).
   */
  wrap?: (children: ReactNode) => ReactNode;
}

/**
 * Hook function that produces per-render setup for a factory.
 */
export type FactorySetupHook<
  TProps extends FactoryBaseProps,
  TRefApi = unknown,
  TState = Record<string, any>,
> = (ctx: FactorySetupContext<TProps>) => FactorySetupReturn<TRefApi, TState>;

/**
 * Configuration passed to `createReactFactory`.
 */
export interface CreateReactFactoryConfig<
  TProps extends FactoryBaseProps,
  TRefApi = unknown,
  TState = Record<string, any>,
> {
  /** React displayName for devtools */
  displayName?: string;
  /** JSON Schema definition used to validate the instance schema */
  schemaDefinition: object;
  /** Root schema component key for name-path resolution */
  rootComponentKey: string;
  /** Built-in default components (by name) */
  defaultComponents: Record<string, ComponentSpec>;
  /** Built-in default renderers (by component type) */
  defaultRenderers?: Partial<Record<string, any>>;
  /** Per-render setup hook */
  useSetup: FactorySetupHook<TProps, TRefApi, TState>;
}
