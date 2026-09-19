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

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
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

interface FieldA11yRegistry {
  fields: Readonly<Record<string, string>>;
  register: (name: string, controlId: string) => void;
  unregister: (name: string, controlId: string) => void;
}

const FieldA11yRegistryContext = createContext<FieldA11yRegistry | null>(null);

/**
 * Registers the generated control ids used by the form error summary.
 * Custom fields that do not use this hook remain usable; their summary item
 * is rendered without a link because there is no safe target to reference.
 */
export const FieldA11yProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [fields, setFields] = useState<Record<string, string>>({});

  const register = useCallback((name: string, controlId: string) => {
    setFields((current) =>
      current[name] === controlId ? current : { ...current, [name]: controlId }
    );
  }, []);

  const unregister = useCallback((name: string, controlId: string) => {
    setFields((current) => {
      if (current[name] !== controlId) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ fields, register, unregister }),
    [fields, register, unregister]
  );

  return (
    <FieldA11yRegistryContext.Provider value={value}>
      {children}
    </FieldA11yRegistryContext.Provider>
  );
};

export function useOptionalFieldA11yRegistry(): FieldA11yRegistry | null {
  return useContext(FieldA11yRegistryContext);
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
  const registry = useOptionalFieldA11yRegistry();
  const register = registry?.register;
  const unregister = registry?.unregister;

  useEffect(() => {
    if (!register || !unregister) return undefined;
    register(name, ids.controlId);
    return () => unregister(name, ids.controlId);
  }, [register, unregister, name, ids.controlId]);

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
 * Error text is referenced by the control's `aria-describedby`. The form
 * summary owns submit-failure announcements and focus, avoiding one live
 * region per field when several fields fail together.
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
      <p id={ids.errorId} style={errorStyle}>
        {errorText}
      </p>
    ) : null}
  </>
);
