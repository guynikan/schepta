/**
 * Framework-agnostic contracts for the semantic Generative UI layer.
 *
 * These types intentionally contain JSON-compatible values only. A renderer
 * may attach framework objects at its boundary, but they must never cross
 * this contract.
 */

export const UI_SPEC_VERSION = '1.0' as const;
export type UiSpecVersion = typeof UI_SPEC_VERSION;

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export interface JsonObject {
  [key: string]: JsonValue;
}

/** A deliberately small JSON Schema subset used by props, state and inputs. */
export interface JsonSchema {
  $schema?: string;
  title?: string;
  description?: string;
  type?: JsonSchemaType | JsonSchemaType[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  additionalProperties?: boolean | JsonSchema;
  items?: JsonSchema;
  enum?: JsonValue[];
  const?: JsonValue;
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minItems?: number;
  maxItems?: number;
}

export type JsonSchemaType =
  | 'null'
  | 'boolean'
  | 'object'
  | 'array'
  | 'number'
  | 'integer'
  | 'string';

export type UiBindingMode = 'read' | 'write' | 'twoWay';

export interface UiBinding {
  /** State path, for example `state.profile.name` or `/profile/name`. */
  path: string;
  mode?: UiBindingMode;
}

export interface UiStateDefinition {
  schema?: JsonSchema;
  initial?: JsonValue;
}

export interface UiAction {
  /** The action id declared by the semantic catalog. */
  action?: string;
  /** Alias accepted for integrations that use `name` for action ids. */
  name?: string;
  args?: JsonObject;
  /** Alias for `args`, useful when an action catalog calls them inputs. */
  inputs?: JsonObject;
}

export interface UiElement {
  component: string;
  props?: JsonObject;
  children?: string[];
  slots?: Record<string, string[]>;
  /** Maps a component property to a named top-level binding. */
  bindings?: Record<string, string>;
  /** Maps a component event to a named top-level action invocation. */
  actions?: Record<string, string>;
}

export interface UiSpec {
  version: UiSpecVersion;
  /** Element id from `elements`. */
  root: string;
  elements: Record<string, UiElement>;
  state?: Record<string, UiStateDefinition>;
  bindings?: Record<string, UiBinding>;
  actions?: Record<string, UiAction>;
  metadata?: JsonObject;
}

export interface SemanticSlotDefinition {
  description?: string;
  required?: boolean;
  multiple?: boolean;
  allowedComponents?: string[];
}

export interface SemanticActionDefinition {
  description?: string;
  args?: JsonSchema;
  /** Alias for `args`, matching the terminology used by input validation. */
  argsSchema?: JsonSchema;
  capabilities?: string[];
}

export type SemanticActionReference = string | SemanticActionDefinition;

export interface SemanticComponentDefinition {
  description?: string;
  props?: JsonSchema;
  /** Alias for `props`, retained to make catalog declarations explicit. */
  propsSchema?: JsonSchema;
  slots?: Record<string, SemanticSlotDefinition>;
  /** State properties that this semantic component may bind. */
  bindings?: Record<string, UiBindingMode[]>;
  actions?: Record<string, SemanticActionReference>;
  capabilities?: string[];
}

export interface SemanticCatalog {
  version?: string;
  components: Record<string, SemanticComponentDefinition>;
  actions?: Record<string, SemanticActionDefinition>;
}

export type CapabilitySet = ReadonlySet<string> | readonly string[];

export interface RendererCapabilities {
  components?: CapabilitySet;
  supportedComponents?: CapabilitySet;
  actions?: CapabilitySet;
  supportedActions?: CapabilitySet;
  capabilities?: CapabilitySet;
  supportedCapabilities?: CapabilitySet;
}

export type UiValidationSeverity = 'error' | 'warning';

export interface UiValidationIssue {
  severity: UiValidationSeverity;
  code: string;
  path: string;
  message: string;
  suggestion?: string;
}

export interface UiValidationReport {
  valid: boolean;
  errors: UiValidationIssue[];
  warnings: UiValidationIssue[];
  issues: UiValidationIssue[];
}

export interface UiValidationOptions {
  catalog?: SemanticCatalog;
  rendererCapabilities?: RendererCapabilities;
}

export interface UiAcceptanceResult {
  accepted: boolean;
  spec?: UiSpec;
  report: UiValidationReport;
}

export type UiRepairOperation = 'canonicalize' | 'removeUnknownProperties';

export interface UiRepairOptions extends UiValidationOptions {
  operations?: UiRepairOperation[];
  maxChanges?: number;
}

export interface UiRepairChange {
  operation: UiRepairOperation;
  path: string;
  description: string;
}

export interface UiRepairResult {
  accepted: boolean;
  spec?: UiSpec;
  report: UiValidationReport;
  changes: UiRepairChange[];
}

export interface UiInputValidationOptions {
  path?: string;
}
