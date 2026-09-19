import { createDefaultResolver, processValue } from '../expressions';
import type { JsonObject, JsonValue, UiInputBehaviorResult } from './types';

type InputProps = JsonObject;

function asRecord(value: JsonValue | undefined): JsonObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as JsonObject : {};
}

function valueFor(props: InputProps, name: string): JsonValue | undefined {
  const validation = asRecord(props.validation);
  return validation[name] ?? props[name];
}

function messageFor(props: InputProps, name: string, fallback: string): string {
  const message = valueFor(props, `${name}Message`);
  return typeof message === 'string' ? message : fallback;
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
export function validateUiInputBehavior(value: JsonValue | undefined, props: InputProps): UiInputBehaviorResult {
  const errors: string[] = [];
  const required = valueFor(props, 'required') === true;
  if (required && isEmpty(value)) errors.push(messageFor(props, 'required', 'This field is required.'));
  if (isEmpty(value)) return { valid: errors.length === 0, errors };

  const stringValue = String(value);
  const minLength = numericRule(props, ['minLength']);
  const maxLength = numericRule(props, ['maxLength']);
  if (minLength !== undefined && stringValue.length < minLength) errors.push(messageFor(props, 'minLength', `Enter at least ${minLength} characters.`));
  if (maxLength !== undefined && stringValue.length > maxLength) errors.push(messageFor(props, 'maxLength', `Enter no more than ${maxLength} characters.`));

  const pattern = valueFor(props, 'pattern');
  if (typeof pattern === 'string') {
    try {
      if (!new RegExp(pattern).test(stringValue)) errors.push(messageFor(props, 'pattern', 'Enter a valid value.'));
    } catch {
      errors.push(messageFor(props, 'pattern', 'This field has an invalid validation pattern.'));
    }
  }

  if (typeof value === 'number') {
    const min = numericRule(props, ['minimum', 'min']);
    const max = numericRule(props, ['maximum', 'max']);
    if (min !== undefined && value < min) errors.push(messageFor(props, 'min', `Enter a value of at least ${min}.`));
    if (max !== undefined && value > max) errors.push(messageFor(props, 'max', `Enter a value of no more than ${max}.`));
  }
  return { valid: errors.length === 0, errors };
}
