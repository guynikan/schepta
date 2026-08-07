/**
 * Default Form Container Component
 *
 * Built-in form container that wraps children in a <form> tag
 * and renders a submit button. Can be overridden via createComponentSpec.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useScheptaFormAdapter, useScheptaFormErrors } from '../context/schepta-form-context';
import { DefaultSubmitButton, SubmitButtonComponentType } from './DefaultSubmitButton';

/**
 * Props for FormContainer component.
 * Use this type when creating a custom FormContainer.
 */
export interface FormContainerProps {
  /** Form field children */
  children?: React.ReactNode;
  /** Submit handler - when provided, renders a submit button */
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  /** Accessible name for the form */
  ariaLabel?: string;
  /** Test ID for the form container */
  'data-test-id'?: string;
  /** External context passed from FormFactory */
  externalContext?: Record<string, any>;
  /**
   * Custom SubmitButton component - resolved by FormFactory from registry.
   * If not provided, uses DefaultSubmitButton.
   */
  SubmitButtonComponent?: SubmitButtonComponentType;
}

const summaryStyle: React.CSSProperties = {
  padding: '12px 16px',
  marginBottom: '16px',
  background: 'var(--schepta-error-bg)',
  border: '1px solid var(--schepta-error-border)',
  borderRadius: '4px',
  color: 'var(--schepta-error-text)',
};

/**
 * Summary of every validation error, rendered above the form after a failed
 * submit.
 *
 * Required by WCAG 3.3.1: an error the user cannot find is an error they
 * cannot fix. Moving focus here on failure is also what tells a screen reader
 * user that the submit did not go through — without it the page appears
 * unchanged and silent.
 */
const ErrorSummary: React.FC<{ errors: Record<string, any> }> = ({ errors }) => {
  const ref = useRef<HTMLDivElement>(null);
  const entries = Object.entries(errors);
  const errorCount = entries.length;
  // Focus only on the transition from valid to invalid. Re-focusing on every
  // render would yank focus away while the user is fixing the fields.
  const hadErrorsRef = useRef(false);

  useEffect(() => {
    if (errorCount > 0 && !hadErrorsRef.current) {
      ref.current?.focus();
    }
    hadErrorsRef.current = errorCount > 0;
  }, [errorCount]);

  if (errorCount === 0) return null;

  return (
    <div
      ref={ref}
      role="alert"
      tabIndex={-1}
      data-test-id="form-error-summary"
      style={summaryStyle}
    >
      <p style={{ margin: '0 0 8px', fontWeight: 600 }}>
        {errorCount === 1
          ? '1 field needs your attention'
          : `${errorCount} fields need your attention`}
      </p>
      <ul style={{ margin: 0, paddingLeft: '20px' }}>
        {entries.map(([field, message]) => (
          <li key={field}>{typeof message === 'string' ? message : String(message)}</li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Default form container component.
 *
 * Renders children inside a <form> tag with an optional submit button.
 *
 * - When `onSubmit` is provided: renders submit button inside the form
 * - When `onSubmit` is NOT provided: no submit button (for external submit via formRef)
 *
 * @example Using with FormFactory (automatic)
 * ```tsx
 * <FormFactory schema={schema} onSubmit={handleSubmit} />
 * ```
 *
 * @example External submit (no internal button)
 * ```tsx
 * const formRef = useRef<FormFactoryRef>(null);
 * <FormFactory ref={formRef} schema={schema} />
 * <button onClick={() => formRef.current?.submit(handleSubmit)}>Submit</button>
 * ```
 */
export const DefaultFormContainer: React.FC<FormContainerProps> = ({
  children,
  onSubmit,
  ariaLabel,
  externalContext,
  ...props
}) => {
  const adapter = useScheptaFormAdapter();
  const errors = useScheptaFormErrors();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;
    setIsSubmitting(true);
    try {
      await adapter.handleSubmit(onSubmit)();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      // Validation and its messages are owned by Schepta. Native constraint
      // validation would short-circuit them with browser bubbles that differ
      // per engine and are not reliably announced.
      noValidate
      aria-label={ariaLabel}
      aria-busy={isSubmitting || undefined}
      data-schepta-form="true"
      {...props}
    >
      <ErrorSummary errors={errors} />
      {children}
      {onSubmit && <DefaultSubmitButton disabled={isSubmitting} />}
    </form>
  );
};
