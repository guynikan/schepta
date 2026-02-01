/**
 * Runtime Abstraction Layer
 * 
 * Provides framework-agnostic interfaces for rendering, state management,
 * and component lifecycle.
 */

/**
 * Generic render result - framework adapter will convert this to framework-specific element
 */
export type RenderResult = unknown;

/**
 * Component specification - describes how to render a component
 */
export interface ComponentSpec {
  /** Component identifier */
  id: string;
  /** Component type (field, container, etc.) */
  type: ComponentType;
  /** Display name for debugging */
  displayName?: string;
  /** Default props to apply */
  defaultProps?: Record<string, any>;
  /** Factory function to create component instance */
  factory: ComponentFactory;
}

/**
 * Component factory function - creates component instances
 */
export type ComponentFactory = (
  props: Record<string, any>,
  runtime: RuntimeAdapter
) => RenderResult;

/**
 * Element specification for rendering
 */
export interface ElementSpec {
  /** Component name to resolve */
  component: string;
  /** Props to pass to component */
  props?: Record<string, any>;
  /** Children elements */
  children?: ElementSpec[];
}

/**
 * Runtime adapter interface - framework-specific implementation
 */
export interface RuntimeAdapter {
  /** Create an element from a component spec and props */
  create(spec: ComponentSpec, props: Record<string, any>): RenderResult;
  
  /** Create a fragment/container for children */
  fragment(children: RenderResult[]): RenderResult;
  
  /** Check if a value is a valid element */
  isValidElement(value: unknown): boolean;
  
  /** Get children from an element */
  getChildren(element: RenderResult): RenderResult[];
  
  /** Set props on an element */
  setProps(element: RenderResult, props: Record<string, any>): void;
}

/**
 * Reactive state interface - framework-agnostic reactive state
 */
export interface ReactiveState<T> {
  /** Get current value */
  get(): T;
  
  /** Set new value */
  set(value: T): void;
  
  /** Watch for changes */
  watch(callback: (value: T, oldValue: T) => void): () => void;
  
  /** Get current value synchronously (for computed values) */
  readonly value: T;
}

/**
 * Context interface - framework-agnostic context system
 */
export interface Context<T> {
  /** Provide a value in the context */
  provide(value: T): void;
  
  /** Consume a value from the context */
  consume(): T | null;
  
  /** Get current value without throwing */
  tryConsume(): T | null;
}

/**
 * Component types supported by the system
 */
export type ComponentType = 
  | 'field' 
  | 'field-wrapper' 
  | 'container' 
  | 'content' 
  | 'addon' 
  | 'menu-item' 
  | 'menu-container';

/**
 * Debug configuration
 */
export interface DebugConfig {
  enabled: boolean;
  logComponentResolution?: boolean;
  logMiddlewareExecution?: boolean;
  logReactions?: boolean;
}

/**
 * Debug context value
 */
export interface DebugContextValue {
  isEnabled: boolean;
  log: (category: string, message: string, data?: any) => void;
  buffer: {
    add: (entry: DebugEntry) => void;
    clear: () => void;
    getAll: () => DebugEntry[];
  };
}

/**
 * Debug entry
 */
export interface DebugEntry {
  type: string;
  componentKey?: string;
  data?: any;
  timestamp: number;
}

