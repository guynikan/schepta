/**
 * Default Form Container Component
 *
 * Built-in form container that wraps children in a <form> tag
 * and renders a submit button. Can be overridden via createComponentSpec.
 */

import React, { useEffect, useId, useRef, useState } from 'react';
import { useScheptaFormAdapter, useScheptaFormErrors } from '../context/schepta-form-context';
import { DefaultSubmitButton, SubmitButtonComponentType } from './DefaultSubmitButton';
import {
  FieldA11yProvider,
  useOptionalFieldA11yRegistry,
} from './field-a11y';

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
const ErrorSummary: React.FC<{
  errors: Record<string, any>;
  submitAttempt: number;
}> = ({ errors, submitAttempt }) => {
  const ref = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const registry = useOptionalFieldA11yRegistry();
  const entries = Object.entries(errors);
  const errorCount = entries.length;

  useEffect(() => {
    if (errorCount > 0 && submitAttempt > 0) {
      ref.current?.focus();
    }
  }, [errorCount, submitAttempt]);

  if (errorCount === 0) return null;

  return (
    <div
      ref={ref}
      tabIndex={-1}
      aria-labelledby={headingId}
      data-test-id="form-error-summary"
      style={summaryStyle}
    >
      <h2 id={headingId} style={{ margin: '0 0 8px', fontSize: '1rem' }}>
        {errorCount === 1
          ? '1 field needs your attention'
          : `${errorCount} fields need your attention`}
      </h2>
      <ul style={{ margin: 0, paddingLeft: '20px' }}>
        {entries.map(([field, message]) => {
          const controlId = registry?.fields[field];
          const fieldName = field === '_form' ? 'Form' : field;
          const text = typeof message === 'string' ? message : String(message);
          return (
            <li key={field}>
              {controlId ? <a href={`#${controlId}`}>{fieldName}</a> : fieldName}: {text}
            </li>
          );
        })}
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
  const [submitAttempt, setSubmitAttempt] = useState(0);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;
    setIsSubmitting(true);
    try {
      await adapter.handleSubmit(onSubmit)();
      if (Object.keys(adapter.getErrors()).length > 0) {
        setSubmitAttempt((attempt) => attempt + 1);
      }
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
      <FieldA11yProvider>
        <ErrorSummary errors={errors} submitAttempt={submitAttempt} />
        {children}
        {onSubmit && <DefaultSubmitButton disabled={isSubmitting} />}
      </FieldA11yProvider>
    </form>
  );
};
