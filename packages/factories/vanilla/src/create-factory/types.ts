/**
 * Types for createVanillaFactory
 */

import type {
  ComponentSpec,
  MiddlewareFn,
  FormAdapter,
} from '@schepta/core';

export interface VanillaFactoryBaseOptions {
  /** Schema instance to render */
  schema: any;
  /** Target DOM container — the factory mounts the rendered tree into it */
  container: HTMLElement;
  /** Local components override (highest priority) */
  components?: Record<string, ComponentSpec>;
  customComponents?: Record<string, ComponentSpec>;
  renderers?: Partial<Record<string, any>>;
  externalContext?: Record<string, any>;
  middlewares?: MiddlewareFn[];
  debug?: boolean;
}

export interface VanillaFactoryMergedConfig {
  components: Record<string, ComponentSpec>;
  customComponents?: Record<string, ComponentSpec>;
  renderers: Partial<Record<string, any>>;
  externalContext: Record<string, any>;
  baseMiddlewares: MiddlewareFn[];
  debug: boolean;
}

export interface VanillaFactorySetupContext<TOptions extends VanillaFactoryBaseOptions> {
  options: TOptions;
  mergedConfig: VanillaFactoryMergedConfig;
}

export interface VanillaFactorySetupReturn<TApi> {
  /** Current state snapshot fed to the orchestrator on every render */
  getState: () => Record<string, any>;
  /** Form adapter (optional, only for form-style factories) */
  formAdapter?: FormAdapter;
  /** onSubmit passed to the orchestrator */
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  /** Extra middlewares injected BEFORE the user middlewares */
  middlewares?: MiddlewareFn[];
  /** Extra external context entries merged in */
  externalContext?: Record<string, any>;
  /**
   * Subscribe to state changes to trigger a re-render. When omitted, the
   * factory renders once and stays static (zero overhead).
   */
  subscribe?: (scheduleRerender: () => void) => () => void;
  /** Hook invoked BEFORE the DOM subtree is replaced on a reactive re-render */
  onBeforeRerender?: (currentRoot: HTMLElement | null) => any;
  /** Hook invoked AFTER the DOM subtree is replaced — restores any saved state */
  onAfterRerender?: (newRoot: HTMLElement | null, snapshot: any) => void;
  /** Imperative API surface returned to callers of the factory function */
  api: TApi;
  /** Cleanup callback invoked when `destroy()` is called on the factory */
  onDestroy?: () => void;
}

export type VanillaFactorySetupFn<TOptions extends VanillaFactoryBaseOptions, TApi> = (
  ctx: VanillaFactorySetupContext<TOptions>
) => VanillaFactorySetupReturn<TApi>;

export interface CreateVanillaFactoryConfig<
  TOptions extends VanillaFactoryBaseOptions,
  TApi,
> {
  /** JSON Schema definition used to validate the instance schema */
  schemaDefinition: object;
  /** Root schema component key */
  rootComponentKey: string;
  /** Built-in default components */
  defaultComponents: Record<string, ComponentSpec>;
  /**
   * Build built-in default renderers. Vanilla renderers often depend on the
   * form adapter instance, so a factory function is used (called once per
   * factory invocation after `setup` runs).
   */
  createDefaultRenderers?: (setup: VanillaFactorySetupReturn<TApi>) => Partial<Record<string, any>>;
  /** Per-invocation setup function */
  setup: VanillaFactorySetupFn<TOptions, TApi>;
}

/** Base API exposed by every vanilla factory */
export interface VanillaFactoryBaseApi {
  /** Tear down the factory and clear the mounted DOM subtree */
  destroy: () => void;
}
