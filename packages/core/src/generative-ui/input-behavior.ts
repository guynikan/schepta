import { createDefaultResolver, processValue } from '../expressions';
import { DEFAULT_VALIDATION_MESSAGES, interpolateValidationMessage } from '../validation/messages';
import type { JsonObject, JsonValue, UiInputBehaviorResult, UiInputValidationOptions } from './types';

type InputProps = JsonObject;

function asRecord(value: JsonValue | undefined): JsonObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as JsonObject : {};
}

function valueFor(props: InputProps, name: string): JsonValue | undefined {
  const validation = asRecord(props.validation);
  return validation[name] ?? props[name];
}

function messageFor(props: InputProps, name: keyof typeof DEFAULT_VALIDATION_MESSAGES, data: Record<string, JsonValue | undefined>, aliases: string[] = []): string {
  const message = [name, ...aliases]
    .map((rule) => valueFor(props, `${rule}Message`))
    .find((candidate): candidate is string => typeof candidate === 'string');
  return interpolateValidationMessage(message ?? DEFAULT_VALIDATION_MESSAGES[name], data);
}

function isEmpty(value: JsonValue | undefined): boolean {
  return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
}

function numericRule(props: InputProps, names: string[]): number | undefined {
  for (const name of names) {
    const value = valueFor(props, name);
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return undefined;
}

/**
 * Resolve UiSpec prop templates with the same JEXL-backed expression pipeline
 * used by Schepta forms. A false `visible` value suppresses the element.
 */
export function resolveUiInputProps(props: InputProps | undefined, state: Record<string, JsonValue>): InputProps {
  const context = { formValues: state, externalContext: {} };
  return processValue(props ?? {}, createDefaultResolver(context), context) as InputProps;
}

export function isUiElementVisible(props: InputProps | undefined, state: Record<string, JsonValue>): boolean {
  return resolveUiInputProps(props, state).visible !== false;
}

/**
 * Apply the portable semantic input rules without depending on FormSchema.
 * Direct props and the optional `validation` object share the same rules so a
 * renderer cannot drift in required, length, pattern, or numeric behavior.
 */
export function validateUiInputBehavior(value: JsonValue | undefined, props: InputProps, options: UiInputValidationOptions = {}): UiInputBehaviorResult {
  const errors: string[] = [];
  const required = valueFor(props, 'required') === true;
  const label = typeof props.label === 'string' && props.label.length > 0 ? props.label : options.path ?? 'This field';
  const data = {
    label,
    field: options.path ?? label,
    minLength: numericRule(props, ['minLength']),
    maxLength: numericRule(props, ['maxLength']),
    min: numericRule(props, ['minimum', 'min']),
    max: numericRule(props, ['maximum', 'max']),
  };
  const checkboxIsUnchecked = options.component === 'Checkbox' && value !== true;
  if (required && (isEmpty(value) || checkboxIsUnchecked)) errors.push(messageFor(props, 'required', data));
  if (isEmpty(value)) return { valid: errors.length === 0, errors };

  const stringValue = String(value);
  const minLength = numericRule(props, ['minLength']);
  const maxLength = numericRule(props, ['maxLength']);
  if (minLength !== undefined && stringValue.length < minLength) errors.push(messageFor(props, 'minLength', data));
  if (maxLength !== undefined && stringValue.length > maxLength) errors.push(messageFor(props, 'maxLength', data));

  const pattern = valueFor(props, 'pattern');
  if (typeof pattern === 'string') {
    try {
      if (!new RegExp(pattern).test(stringValue)) errors.push(messageFor(props, 'pattern', data));
    } catch {
      errors.push(messageFor(props, 'pattern', data));
    }
  }

  if (typeof value === 'number') {
    const min = numericRule(props, ['minimum', 'min']);
    const max = numericRule(props, ['maximum', 'max']);
    if (min !== undefined && value < min) errors.push(messageFor(props, 'minimum', data, ['min']));
    if (max !== undefined && value > max) errors.push(messageFor(props, 'maximum', data, ['max']));
  }
  return { valid: errors.length === 0, errors };
}
