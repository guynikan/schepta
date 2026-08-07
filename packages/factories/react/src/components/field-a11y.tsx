/**
 * Field accessibility helper
 *
 * Shared by every default input so they all expose the same contract:
 * a programmatically associated label, an announced error, and an
 * `aria-describedby` that never dangles.
 *
 * Exported publicly (via the package root) so custom input components can
 * meet the same contract without reimplementing it.
 */

import React from 'react';
import { useA11yIds, composeDescribedBy, type A11yIds } from '../a11y';
import { useOptionalScheptaFieldError } from '../context/schepta-form-context';

export interface UseFieldA11yOptions {
  /** Field path, used to look up the validation error */
  name: string;
  /** Explicit id from the author (`x-component-props.id`), if any */
  id?: string;
  /** Hint / helper text rendered below the control */
  description?: string;
  /** Whether the field is required (from `x-component-props.required`) */
  required?: boolean;
  /** Author-supplied `aria-describedby`, appended to the generated ones */
  ariaDescribedBy?: string;
}

export interface UseFieldA11yResult {
  ids: A11yIds;
  /** Normalized error message, or undefined when the field is valid */
  errorText?: string;
  /** Props for the `<label>` */
  labelProps: { htmlFor: string; id: string };
  /** Props for the interactive control */
  controlProps: {
    id: string;
    required?: boolean;
    'aria-required'?: true;
    'aria-invalid'?: true;
    'aria-describedby'?: string;
  };
}

/**
 * Normalizes whatever the adapter stores as an error into display text.
 * Validators may produce a string, or an object with a `message`.
 */
function toErrorText(error: unknown): string | undefined {
  if (!error) return undefined;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && 'message' in (error as any)) {
    const message = (error as any).message;
    return typeof message === 'string' ? message : String(message);
  }
  return String(error);
}

export function useFieldA11y({
  name,
  id,
  description,
  required,
  ariaDescribedBy,
}: UseFieldA11yOptions): UseFieldA11yResult {
  const ids = useA11yIds(id);
  const errorText = toErrorText(useOptionalScheptaFieldError(name));

  return {
    ids,
    errorText,
    labelProps: { htmlFor: ids.controlId, id: ids.labelId },
    controlProps: {
      id: ids.controlId,
      // `required` drives native constraint validation; `aria-required`
      // covers controls where the native attribute does not apply and is
      // what most screen readers actually announce.
      ...(required ? { required: true, 'aria-required': true as const } : {}),
      ...(errorText ? { 'aria-invalid': true as const } : {}),
      'aria-describedby': composeDescribedBy(
        description && ids.hintId,
        errorText && ids.errorId,
        ariaDescribedBy
      ),
    },
  };
}

export interface FieldMessagesProps {
  ids: A11yIds;
  description?: string;
  errorText?: string;
}

const hintStyle: React.CSSProperties = {
  margin: '4px 0 0',
  fontSize: '12px',
  color: 'var(--schepta-text-2)',
};

const errorStyle: React.CSSProperties = {
  margin: '4px 0 0',
  fontSize: '12px',
  color: 'var(--schepta-error-text)',
};

/**
 * Renders the hint and error text a control's `aria-describedby` points at.
 *
 * The error carries `role="alert"` so it is announced the moment it appears —
 * a validation message that only renders visually is invisible to a screen
 * reader user, who has no reason to go re-read the field.
 */
export const FieldMessages: React.FC<FieldMessagesProps> = ({
  ids,
  description,
  errorText,
}) => (
  <>
    {description ? (
      <p id={ids.hintId} style={hintStyle}>
        {description}
      </p>
    ) : null}
    {errorText ? (
      <p id={ids.errorId} role="alert" style={errorStyle}>
        {errorText}
      </p>
    ) : null}
  </>
);
