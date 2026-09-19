/**
 * Types for createVueFactory
 */

import type { VNode, ComputedRef } from 'vue';
import type {
  ComponentSpec,
  MiddlewareFn,
  FormAdapter,
} from '@schepta/core';

export interface VueFactoryMergedConfig {
  components: Record<string, ComponentSpec>;
  customComponents: Record<string, ComponentSpec>;
  renderers: Partial<Record<string, any>>;
  externalContext: Record<string, any>;
  baseMiddlewares: MiddlewareFn[];
  debug: boolean;
}

/**
 * Props common to every Schepta Vue factory.
 */
export interface VueFactoryBaseProps {
  schema: any;
  components?: Record<string, ComponentSpec>;
  customComponents?: Record<string, ComponentSpec>;
  renderers?: Partial<Record<string, any>>;
  externalContext?: Record<string, any>;
  middlewares?: MiddlewareFn[];
  debug?: boolean;
}

export interface VueFactorySetupContext<TProps extends VueFactoryBaseProps> {
  /** Raw Vue props (reactive object) */
  props: TProps;
  /** Reactive merged config */
  mergedConfig: ComputedRef<VueFactoryMergedConfig>;
}

/**
 * Return value of a Vue factory's `useSetup`.
 *
 * All getters are called during the `renderer` `computed()` evaluation — Vue
 * will track reactive dependencies automatically, so there is no explicit
 * subscribe model.
 */
export interface VueFactorySetupReturn<TRefApi = unknown, TState = Record<string, any>> {
  /** Reactive state snapshot consumed by the orchestrator */
  getState?: () => TState;
  /** Form adapter (optional, only relevant for form-style factories) */
  getFormAdapter?: () => FormAdapter | undefined;
  /** onSubmit passed through to the orchestrator */
  getOnSubmit?: () => ((values: Record<string, any>) => void | Promise<void>) | undefined;
  /** Extra middlewares injected BEFORE the merged user middlewares */
  getMiddlewares?: () => MiddlewareFn[] | undefined;
  /** Extra entries merged into `externalContext` */
  getExternalContext?: () => Record<string, any> | undefined;
  /** Imperative API surface exposed via Vue's `expose()` */
  refApi: TRefApi;
  /** Optional wrapper around the rendered schema tree */
  wrap?: (children: VNode | VNode[]) => VNode;
}

export type VueFactorySetupHook<
  TProps extends VueFactoryBaseProps,
  TRefApi = unknown,
  TState = Record<string, any>,
> = (ctx: VueFactorySetupContext<TProps>) => VueFactorySetupReturn<TRefApi, TState>;

export interface CreateVueFactoryConfig<
  TProps extends VueFactoryBaseProps,
  TRefApi = unknown,
  TState = Record<string, any>,
> {
  /** Component name for devtools */
  name?: string;
  /** JSON Schema definition to validate instances against */
  schemaDefinition: object;
  /** Root schema component key */
  rootComponentKey: string;
  /** Built-in default components */
  defaultComponents: Record<string, ComponentSpec>;
  /** Built-in default renderers */
  defaultRenderers?: Partial<Record<string, any>>;
  /** Vue prop definitions (runtime + types) */
  propsDef: any;
  /** Per-render setup hook */
  useSetup: VueFactorySetupHook<TProps, TRefApi, TState>;
}
