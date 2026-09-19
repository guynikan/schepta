import Ajv, { type ErrorObject } from 'ajv';
import type {
  JsonSchema,
  RendererCapabilities,
  SemanticActionDefinition,
  SemanticCatalog,
  SemanticComponentDefinition,
  UiAction,
  UiElement,
  UiInputValidationOptions,
  UiSpec,
  UiValidationIssue,
  UiValidationOptions,
  UiValidationReport,
} from './types';

const ID_PATTERN = /^[A-Za-z_][A-Za-z0-9_-]*$/;
const STATE_PATH_PATTERN = /^(?:state(?:\.[A-Za-z_][A-Za-z0-9_-]*)+|(?:\/[A-Za-z_][A-Za-z0-9_-]*)+)$/;

function issue(
  severity: UiValidationIssue['severity'],
  code: string,
  path: string,
  message: string,
  suggestion?: string,
): UiValidationIssue {
  return { severity, code, path, message, ...(suggestion ? { suggestion } : {}) };
}

function pointer(parent: string, child: string): string {
  const escaped = child.replace(/~/g, '~0').replace(/\//g, '~1');
  return parent === '/' ? `/${escaped}` : `${parent}/${escaped}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isJsonSafe(value: unknown, seen = new Set<unknown>()): boolean {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'object' || seen.has(value) || !isRecord(value) && !Array.isArray(value)) return false;
  seen.add(value);
  const values = Array.isArray(value) ? value : Object.values(value);
  const safe = values.every((child) => isJsonSafe(child, seen));
  seen.delete(value);
  return safe;
}

function asSet(values: RendererCapabilities['components']): Set<string> | undefined {
  if (!values) return undefined;
  return new Set(values);
}

function componentSet(capabilities: RendererCapabilities): Set<string> | undefined {
  return asSet(capabilities.components ?? capabilities.supportedComponents);
}

function actionSet(capabilities: RendererCapabilities): Set<string> | undefined {
  return asSet(capabilities.actions ?? capabilities.supportedActions);
}

function capabilitySet(capabilities: RendererCapabilities): Set<string> | undefined {
  return asSet(capabilities.capabilities ?? capabilities.supportedCapabilities);
}

function actionId(action: UiAction): string | undefined {
  if (typeof action.action === 'string' && typeof action.name !== 'string') return action.action;
  if (typeof action.name === 'string' && typeof action.action !== 'string') return action.name;
  return undefined;
}

function actionArgs(action: UiAction): Record<string, unknown> | undefined {
  if (action.args !== undefined && action.inputs !== undefined) return undefined;
  return (action.args ?? action.inputs) as Record<string, unknown> | undefined;
}

function schemaForProps(component: SemanticComponentDefinition): JsonSchema | undefined {
  return component.propsSchema ?? component.props;
}

function schemaForAction(action: SemanticActionDefinition): JsonSchema | undefined {
  return action.argsSchema ?? action.args;
}

function transformAjvErrors(errors: ErrorObject[] | null | undefined, basePath: string): UiValidationIssue[] {
  return (errors ?? []).map((error) => {
    const path = error.instancePath ? `${basePath}${error.instancePath}` : basePath;
    return issue(
      'error',
      `props-${error.keyword}`,
      path,
      error.message ?? 'Value does not match the declared schema',
      error.keyword === 'additionalProperties' && typeof error.params.additionalProperty === 'string'
        ? `Remove unknown property "${error.params.additionalProperty}".`
        : undefined,
    );
  });
}

function validateSchema(value: unknown, schema: JsonSchema, path: string): UiValidationIssue[] {
  try {
    const ajv = new Ajv({ allErrors: true, strict: false });
    const validate = ajv.compile(schema);
    return validate(value) ? [] : transformAjvErrors(validate.errors, path);
  } catch (error) {
    return [issue('error', 'invalid-schema', path, `Schema compilation failed: ${String(error)}`)];
  }
}

function validateSchemaDefinition(schema: unknown, path: string): UiValidationIssue[] {
  if (!isRecord(schema)) {
    return [issue('error', 'invalid-schema', path, 'Schema must be a JSON object.')];
  }
  try {
    new Ajv({ allErrors: true, strict: false }).compile(schema);
    return [];
  } catch (error) {
    return [issue('error', 'invalid-schema', path, `Schema compilation failed: ${String(error)}`)];
  }
}

function validateCapabilities(
  required: string[] | undefined,
  available: Set<string> | undefined,
  path: string,
  kind: string,
  issues: UiValidationIssue[],
): void {
  if (!required?.length || !available) return;
  for (const capability of required) {
    if (!available.has(capability)) {
      issues.push(issue(
        'error',
        'renderer-capability-missing',
        path,
        `Renderer does not provide required ${kind} capability "${capability}".`,
        `Add "${capability}" to the renderer capabilities or choose another ${kind}.`,
      ));
    }
  }
}

function validateElement(
  element: UiElement,
  elementId: string,
  spec: UiSpec,
  catalog: SemanticCatalog | undefined,
  renderer: RendererCapabilities | undefined,
  issues: UiValidationIssue[],
): void {
  const elementPath = pointer('/elements', elementId);
  if (!isRecord(element) || typeof element.component !== 'string' || element.component.length === 0) {
    issues.push(issue('error', 'invalid-element', elementPath, 'Element must declare a non-empty component id.'));
    return;
  }

  const definition = catalog?.components[element.component];
  if (catalog && !definition) {
    issues.push(issue('error', 'unknown-component', `${elementPath}/component`, `Component "${element.component}" is not in the semantic catalog.`));
  }

  const supportedComponents = renderer && componentSet(renderer);
  if (supportedComponents && !supportedComponents.has(element.component)) {
    issues.push(issue('error', 'renderer-component-unsupported', `${elementPath}/component`, `Renderer does not support component "${element.component}".`));
  }

  if (definition) {
    validateCapabilities(definition.capabilities, renderer && capabilitySet(renderer), `${elementPath}/component`, 'component', issues);
  }
  if (element.props !== undefined && !isRecord(element.props)) {
    issues.push(issue('error', 'invalid-props', `${elementPath}/props`, 'Component props must be a JSON object.'));
  }
  if (definition) validateSchemaForElementProps(element, definition, elementPath, issues);

  if (element.children !== undefined && !Array.isArray(element.children)) {
    issues.push(issue('error', 'invalid-children', `${elementPath}/children`, 'Children must be an array of element ids.'));
  }
  for (const child of Array.isArray(element.children) ? element.children : []) {
    if (typeof child !== 'string') {
      issues.push(issue('error', 'invalid-child', `${elementPath}/children`, 'Child references must be strings.'));
      continue;
    }
    if (typeof child !== 'string' || !spec.elements[child]) {
      issues.push(issue('error', 'unknown-child', `${elementPath}/children`, `Child element "${String(child)}" does not exist.`));
    }
  }

  if (element.slots !== undefined && !isRecord(element.slots)) {
    issues.push(issue('error', 'invalid-slots', `${elementPath}/slots`, 'Slots must be an object whose values are arrays of element ids.'));
  }
  for (const [slotName, childIds] of isRecord(element.slots) ? Object.entries(element.slots) : []) {
    if (!Array.isArray(childIds)) {
      issues.push(issue('error', 'invalid-slot-children', `${elementPath}/slots/${slotName}`, 'Slot children must be an array of element ids.'));
      continue;
    }
    for (const child of childIds) {
      if (typeof child !== 'string') {
        issues.push(issue('error', 'invalid-slot-child', `${elementPath}/slots/${slotName}`, 'Slot child references must be strings.'));
        continue;
      }
      if (typeof child !== 'string' || !spec.elements[child]) {
        issues.push(issue('error', 'unknown-slot-child', `${elementPath}/slots/${slotName}`, `Slot child "${String(child)}" does not exist.`));
      }
    }
    const slot = definition?.slots?.[slotName];
    if (definition && !slot) {
      issues.push(issue('error', 'unknown-slot', `${elementPath}/slots/${slotName}`, `Slot "${slotName}" is not declared by component "${element.component}".`));
    }
    if (slot?.multiple === false && childIds.length > 1) {
      issues.push(issue('error', 'slot-cardinality', `${elementPath}/slots/${slotName}`, `Slot "${slotName}" accepts only one child.`));
    }
    for (const child of childIds) {
      const childElement = spec.elements[child];
      if (slot?.allowedComponents && childElement && !slot.allowedComponents.includes(childElement.component)) {
        issues.push(issue('error', 'slot-component-unsupported', `${elementPath}/slots/${slotName}`, `Component "${childElement.component}" is not allowed in slot "${slotName}".`));
      }
    }
  }
  for (const [slotName, slot] of Object.entries(definition?.slots ?? {})) {
    if (slot.required && (!isRecord(element.slots) || !Array.isArray(element.slots[slotName]) || element.slots[slotName].length === 0)) {
      issues.push(issue('error', 'required-slot-missing', `${elementPath}/slots/${slotName}`, `Required slot "${slotName}" is missing.`));
    }
  }

  if (element.bindings !== undefined && !isRecord(element.bindings)) {
    issues.push(issue('error', 'invalid-element-bindings', `${elementPath}/bindings`, 'Element bindings must be an object.'));
  }
  for (const [property, bindingName] of isRecord(element.bindings) ? Object.entries(element.bindings) : []) {
    if (typeof bindingName !== 'string') {
      issues.push(issue('error', 'invalid-element-binding', `${elementPath}/bindings/${property}`, 'Element binding references must be strings.'));
      continue;
    }
    if (!spec.bindings?.[bindingName]) {
      issues.push(issue('error', 'unknown-binding', `${elementPath}/bindings/${property}`, `Binding "${bindingName}" does not exist.`));
    }
    if (definition?.bindings && !definition.bindings[property]) {
      issues.push(issue('error', 'component-binding-unsupported', `${elementPath}/bindings/${property}`, `Component "${element.component}" does not support binding property "${property}".`));
    }
    const binding = spec.bindings?.[bindingName];
    const allowedModes = definition?.bindings?.[property];
    if (binding && allowedModes && binding.mode && !allowedModes.includes(binding.mode)) {
      issues.push(issue('error', 'component-binding-mode-unsupported', `${elementPath}/bindings/${property}`, `Binding mode "${binding.mode}" is not supported for "${element.component}.${property}".`));
    }
  }

  if (element.actions !== undefined && !isRecord(element.actions)) {
    issues.push(issue('error', 'invalid-element-actions', `${elementPath}/actions`, 'Element actions must be an object.'));
  }
  for (const [event, actionName] of isRecord(element.actions) ? Object.entries(element.actions) : []) {
    if (typeof actionName !== 'string') {
      issues.push(issue('error', 'invalid-element-action', `${elementPath}/actions/${event}`, 'Element action references must be strings.'));
      continue;
    }
    if (!spec.actions?.[actionName]) {
      issues.push(issue('error', 'unknown-action-invocation', `${elementPath}/actions/${event}`, `Action invocation "${actionName}" does not exist.`));
      continue;
    }
    const invocation = spec.actions[actionName];
    const invokedAction = isRecord(invocation) ? actionId(invocation as UiAction) : undefined;
    if (definition?.actions && (!invokedAction || (!definition.actions[invokedAction] && !definition.actions[event]))) {
      issues.push(issue('error', 'component-action-unsupported', `${elementPath}/actions/${event}`, `Component "${element.component}" does not declare action "${invokedAction}".`));
    }
  }
}

function validateSchemaForElementProps(
  element: UiElement,
  definition: SemanticComponentDefinition,
  elementPath: string,
  issues: UiValidationIssue[],
): void {
  const propsSchema = schemaForProps(definition);
  if (propsSchema) {
    issues.push(...validateSchema(element.props ?? {}, propsSchema, `${elementPath}/props`));
  }
}

function validateAction(
  action: UiAction,
  actionName: string,
  spec: UiSpec,
  catalog: SemanticCatalog | undefined,
  renderer: RendererCapabilities | undefined,
  issues: UiValidationIssue[],
): void {
  const path = pointer('/actions', actionName);
  if (!isRecord(action)) {
    issues.push(issue('error', 'invalid-action', path, 'Action invocation must be an object.'));
    return;
  }
  const id = actionId(action);
  if (!id) {
    issues.push(issue('error', 'invalid-action', path, 'Action invocation must provide exactly one string `action` or `name` field.'));
    return;
  }
  if (action.args !== undefined && !isRecord(action.args)) {
    issues.push(issue('error', 'invalid-action-args', `${path}/args`, 'Action args must be a JSON object.'));
  }
  if (action.inputs !== undefined && !isRecord(action.inputs)) {
    issues.push(issue('error', 'invalid-action-inputs', `${path}/inputs`, 'Action inputs must be a JSON object.'));
  }
  const definition = catalog?.actions?.[id];
  if (catalog && !definition) {
    issues.push(issue('error', 'unknown-action', `${path}/action`, `Action "${id}" is not in the semantic catalog.`));
  }
  const supportedActions = renderer && actionSet(renderer);
  if (supportedActions && !supportedActions.has(id)) {
    issues.push(issue('error', 'renderer-action-unsupported', `${path}/action`, `Renderer does not support action "${id}".`));
  }
  if (definition) {
    const args = actionArgs(action);
    if (action.args !== undefined && action.inputs !== undefined) {
      issues.push(issue('error', 'duplicate-action-inputs', path, 'Use either `args` or `inputs`, not both.'));
    }
    const argsSchema = schemaForAction(definition);
    if (argsSchema) {
      issues.push(...validateSchema(args ?? {}, argsSchema, `${path}/args`));
    }
    validateCapabilities(definition.capabilities, renderer && capabilitySet(renderer), `${path}/action`, 'action', issues);
  }
}

function validateState(spec: UiSpec, issues: UiValidationIssue[]): void {
  for (const [name, definition] of Object.entries(spec.state ?? {})) {
    const path = pointer('/state', name);
    if (!isRecord(definition)) {
      issues.push(issue('error', 'invalid-state', path, 'State definition must be an object.'));
      continue;
    }
    for (const key of Object.keys(definition)) {
      if (key !== 'schema' && key !== 'initial') {
        issues.push(issue('error', 'unknown-state-property', `${path}/${key}`, `Unknown state property "${key}".`));
      }
    }
    if (definition.schema && definition.initial !== undefined) {
      issues.push(...validateSchema(definition.initial, definition.schema, `${path}/initial`));
    }
  }
}

function validateBindings(spec: UiSpec, issues: UiValidationIssue[]): void {
  for (const [name, binding] of Object.entries(spec.bindings ?? {})) {
    const path = pointer('/bindings', name);
    if (!isRecord(binding) || typeof binding.path !== 'string' || !STATE_PATH_PATTERN.test(binding.path)) {
      issues.push(issue('error', 'invalid-binding-path', `${path}/path`, 'Binding path must target state using `state.foo` or `/foo` notation.'));
      continue;
    }
    if (binding.mode && !['read', 'write', 'twoWay'].includes(binding.mode)) {
      issues.push(issue('error', 'invalid-binding-mode', `${path}/mode`, 'Binding mode must be `read`, `write` or `twoWay`.'));
    }
    const firstStateKey = binding.path.startsWith('state.')
      ? binding.path.slice('state.'.length).split('.')[0]
      : binding.path.slice(1).split('/')[0];
    if (spec.state && !spec.state[firstStateKey]) {
      issues.push(issue('error', 'unknown-binding-state', `${path}/path`, `Binding references unknown state key "${firstStateKey}".`));
    }
  }
}

function validateStructure(input: unknown, issues: UiValidationIssue[]): input is UiSpec {
  if (!isJsonSafe(input)) {
    issues.push(issue('error', 'unsafe-input', '/', 'UiSpec must contain JSON-compatible values only; functions, class instances, cycles and non-finite numbers are rejected.'));
    return false;
  }
  if (!isRecord(input)) {
    issues.push(issue('error', 'invalid-spec', '/', 'UiSpec must be a JSON object.'));
    return false;
  }
  const allowed = new Set(['version', 'root', 'elements', 'state', 'bindings', 'actions', 'metadata']);
  for (const key of Object.keys(input)) {
    if (!allowed.has(key)) {
      issues.push(issue('error', 'unknown-property', pointer('/', key), `Unknown UiSpec property "${key}".`));
    }
  }
  if (input.version !== '1.0') {
    issues.push(issue('error', 'unsupported-version', '/version', 'UiSpec version must be "1.0".', 'Upgrade or downgrade the spec before rendering.'));
  }
  if (typeof input.root !== 'string' || !ID_PATTERN.test(input.root)) {
    issues.push(issue('error', 'invalid-root', '/root', 'Root must be a valid element id.'));
  }
  if (!isRecord(input.elements) || Object.keys(input.elements).length === 0) {
    issues.push(issue('error', 'invalid-elements', '/elements', 'UiSpec must declare at least one element.'));
  } else {
    if (typeof input.root === 'string' && !input.elements[input.root]) {
      issues.push(issue('error', 'missing-root', '/root', `Root element "${input.root}" does not exist in elements.`));
    }
    for (const [id, element] of Object.entries(input.elements)) {
      if (!ID_PATTERN.test(id)) issues.push(issue('error', 'invalid-element-id', pointer('/elements', id), 'Element ids must start with a letter or underscore and contain only letters, numbers, `_` or `-`.'));
      if (!isRecord(element)) issues.push(issue('error', 'invalid-element', pointer('/elements', id), 'Element must be an object.'));
    }
  }
  return true;
}

function validateReachability(spec: UiSpec, errors: UiValidationIssue[], warnings: UiValidationIssue[]): void {
  const reachable = new Set<string>();
  const visiting = new Set<string>();
  const visit = (id: string): void => {
    if (visiting.has(id)) {
      errors.push(issue('error', 'cyclic-elements', pointer('/elements', id), `Element tree contains a cycle at "${id}".`));
      return;
    }
    if (reachable.has(id) || !spec.elements[id]) return;
    visiting.add(id);
    reachable.add(id);
    const element = spec.elements[id];
    const children = Array.isArray(element.children) ? element.children : [];
    const slots = isRecord(element.slots)
      ? Object.values(element.slots).filter(Array.isArray).flat()
      : [];
    for (const child of [...children, ...slots]) {
      if (typeof child === 'string') visit(child);
    }
    visiting.delete(id);
  };
  visit(spec.root);
  for (const id of Object.keys(spec.elements)) {
    if (!reachable.has(id)) warnings.push(issue('warning', 'unreachable-element', pointer('/elements', id), `Element "${id}" is not reachable from root.`));
  }
}

/** Validate a semantic UI spec without invoking any code from the input. */
export function validateUiSpec(input: unknown, options: UiValidationOptions = {}): UiValidationReport {
  const errors: UiValidationIssue[] = [];
  const warnings: UiValidationIssue[] = [];
  if (!validateStructure(input, errors)) return { valid: false, errors, warnings, issues: [...errors] };
  if (options.catalog) {
    const catalogReport = validateSemanticCatalog(options.catalog);
    errors.push(...catalogReport.errors);
    warnings.push(...catalogReport.warnings);
  }
  const spec = input as UiSpec;
  validateState(spec, errors);
  validateBindings(spec, errors);
  if (isRecord(spec.elements)) {
    for (const [id, element] of Object.entries(spec.elements)) {
      validateElement(element, id, spec, options.catalog, options.rendererCapabilities, errors);
    }
  }
  if (isRecord(spec.actions)) {
    for (const [name, action] of Object.entries(spec.actions)) {
      validateAction(action, name, spec, options.catalog, options.rendererCapabilities, errors);
    }
  }
  if (isRecord(spec.elements) && typeof spec.root === 'string') {
    validateReachability(spec, errors, warnings);
  }
  return { valid: errors.length === 0, errors, warnings, issues: [...errors, ...warnings] };
}

/** Validate the catalog itself before it is used to validate a UiSpec. */
export function validateSemanticCatalog(input: unknown): UiValidationReport {
  const errors: UiValidationIssue[] = [];
  const warnings: UiValidationIssue[] = [];
  if (!isJsonSafe(input) || !isRecord(input)) {
    errors.push(issue('error', 'invalid-catalog', '/', 'Semantic catalog must be a JSON object.'));
    return { valid: false, errors, warnings, issues: errors };
  }
  if (input.version !== undefined && typeof input.version !== 'string') {
    errors.push(issue('error', 'invalid-catalog-version', '/version', 'Catalog version must be a string.'));
  }
  if (!isRecord(input.components)) {
    errors.push(issue('error', 'invalid-catalog-components', '/components', 'Catalog components must be an object.'));
  } else {
    for (const [id, definition] of Object.entries(input.components)) {
      const path = pointer('/components', id);
      if (!ID_PATTERN.test(id)) errors.push(issue('error', 'invalid-component-id', path, 'Catalog component ids must be valid semantic ids.'));
      if (!isRecord(definition)) {
        errors.push(issue('error', 'invalid-component-definition', path, 'Component definition must be an object.'));
        continue;
      }
      const propsSchema = definition.propsSchema ?? definition.props;
      if (propsSchema !== undefined) errors.push(...validateSchemaDefinition(propsSchema, `${path}/props`));
      if (definition.capabilities !== undefined && (!Array.isArray(definition.capabilities) || !definition.capabilities.every((value) => typeof value === 'string'))) {
        errors.push(issue('error', 'invalid-component-capabilities', `${path}/capabilities`, 'Component capabilities must be an array of strings.'));
      }
      if (definition.bindings !== undefined && (!isRecord(definition.bindings) || !Object.values(definition.bindings).every((modes) => Array.isArray(modes) && modes.every((mode) => ['read', 'write', 'twoWay'].includes(String(mode)))))) {
        errors.push(issue('error', 'invalid-component-bindings', `${path}/bindings`, 'Component bindings must map properties to binding modes.'));
      }
      if (definition.slots !== undefined && !isRecord(definition.slots)) {
        errors.push(issue('error', 'invalid-component-slots', `${path}/slots`, 'Component slots must be an object.'));
      }
      if (isRecord(definition.slots)) {
        for (const [slotName, slot] of Object.entries(definition.slots)) {
          if (!isRecord(slot)) errors.push(issue('error', 'invalid-slot-definition', `${path}/slots/${slotName}`, 'Slot definition must be an object.'));
          else if (slot.allowedComponents !== undefined && (!Array.isArray(slot.allowedComponents) || !slot.allowedComponents.every((value) => typeof value === 'string'))) {
            errors.push(issue('error', 'invalid-slot-components', `${path}/slots/${slotName}/allowedComponents`, 'Allowed slot components must be an array of strings.'));
          }
        }
      }
    }
  }
  if (input.actions !== undefined && !isRecord(input.actions)) {
    errors.push(issue('error', 'invalid-catalog-actions', '/actions', 'Catalog actions must be an object.'));
  } else if (isRecord(input.actions)) {
    for (const [id, definition] of Object.entries(input.actions)) {
      const path = pointer('/actions', id);
      if (!ID_PATTERN.test(id)) errors.push(issue('error', 'invalid-action-id', path, 'Catalog action ids must be valid semantic ids.'));
      if (!isRecord(definition)) {
        errors.push(issue('error', 'invalid-action-definition', path, 'Action definition must be an object.'));
        continue;
      }
      const argsSchema = definition.argsSchema ?? definition.args;
      if (argsSchema !== undefined) errors.push(...validateSchemaDefinition(argsSchema, `${path}/args`));
      if (definition.capabilities !== undefined && (!Array.isArray(definition.capabilities) || !definition.capabilities.every((value) => typeof value === 'string'))) {
        errors.push(issue('error', 'invalid-action-capabilities', `${path}/capabilities`, 'Action capabilities must be an array of strings.'));
      }
    }
  }
  return { valid: errors.length === 0, errors, warnings, issues: [...errors, ...warnings] };
}

/** Short alias for callers that do not need the semantic qualifier. */
export const validateCatalog = validateSemanticCatalog;

/** Validate an arbitrary JSON input value against a catalog-provided schema. */
export function validateUiInputs(
  inputs: unknown,
  schema: JsonSchema,
  options: UiInputValidationOptions = {},
): UiValidationReport {
  const path = options.path ?? '/inputs';
  const errors = !isJsonSafe(inputs)
    ? [issue('error', 'unsafe-input', path, 'Inputs must contain JSON-compatible values only.')]
    : validateSchema(inputs, schema, path);
  return { valid: errors.length === 0, errors, warnings: [], issues: errors };
}
