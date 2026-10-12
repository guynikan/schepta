/**
 * Reaction System Types
 * 
 * Framework-agnostic reaction system for responding to form state changes.
 */

import type { FormAdapter } from '../forms/types';
import type { DebugContextValue } from '../runtime/types';
import type { ExpressionConfig, ExpressionDiagnostics } from '../expressions/diagnostics';

/**
 * Runtime reaction context
 */
export interface RuntimeReactionContext {
  /** Field key being reacted to */
  fieldKey: string;
  /** Field schema */
  schema: any;
  /** Full form schema */
  fullSchema: any;
  /** Form adapter */
  formAdapter: FormAdapter;
  /** Function to set field props dynamically */
  setFieldProps: (fieldKey: string, props: Record<string, any>) => void;
  /** Debug utilities */
  debug?: DebugContextValue;
  /** Expression diagnostics and strict-mode configuration. */
  expressions?: ExpressionConfig;
  /** Diagnostic sink shared with the form; one is kept per form adapter when omitted. */
  expressionDiagnostics?: ExpressionDiagnostics;
  /**
   * Form paths declared by the schema (see `collectDeclaredFormPaths`). With
   * them, a `$form` path that is neither present nor declared is an error;
   * without them a missing `$form` path can only be warned about.
   */
  declaredFormPaths?: ReadonlySet<string>;
}

/**
 * Default reaction function - imperative reactions
 */
export type DefaultReaction = (context: RuntimeReactionContext) => void;

/**
 * Reaction registry for imperative reactions
 */
const reactionRegistry = new Map<string, DefaultReaction>();

/**
 * Register a default reaction
 */
export function registerReaction(name: string, reaction: DefaultReaction): void {
  reactionRegistry.set(name, reaction);
}

/**
 * Get a reaction by name
 */
export function getReaction(name: string): DefaultReaction | undefined {
  return reactionRegistry.get(name);
}

/**
 * Get all registered reactions
 */
export function getAllReactions(): Map<string, DefaultReaction> {
  return reactionRegistry;
}

