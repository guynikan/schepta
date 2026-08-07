/**
 * Default InputTextarea Component
 *
 * Built-in textarea input for forms. Can be overridden via createComponentSpec.
 */

import React from 'react';
import { useFieldA11y, FieldMessages } from './field-a11y';

/**
 * Props passed to the InputTextarea component.
 * Use this type when customizing InputTextarea via components.InputTextarea.
 */
export interface InputTextareaProps
  extends Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    'value' | 'onChange'
  > {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  /** Helper text rendered below the textarea and linked via aria-describedby */
  description?: string;
  rows?: number;
  /** Test ID for the input textarea */
  'data-test-id'?: string;
  externalContext?: Record<string, any>;
  "x-component-props"?: Record<string, any>;
  "x-ui"?: Record<string, any>;
}

/**
 * Component type for custom InputTextarea. Use with createComponentSpec when
 * registering a custom InputTextarea in components.
 */
export type InputTextareaComponentType = React.ComponentType<InputTextareaProps>;

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px',
  border: '1px solid var(--schepta-border)',
  borderRadius: '4px',
  fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '4px',
  fontWeight: '500',
};

const wrapperStyle: React.CSSProperties = { marginBottom: '16px' };

/**
 * Default textarea input component.
 */
export const DefaultInputTextarea = React.forwardRef<
  HTMLTextAreaElement,
  InputTextareaProps
>(
  (
    {
      label,
      name,
      value,
      onChange,
      placeholder,
      description,
      required,
      id,
      rows = 4,
      'aria-describedby': ariaDescribedBy,
      externalContext,
      "x-component-props": xComponentProps,
      "x-ui": xUi,
      ...rest
    },
    ref
  ) => {
    const { ids, errorText, labelProps, controlProps } = useFieldA11y({
      name,
      id,
      description,
      required,
      ariaDescribedBy,
    });

    return (
      <div style={wrapperStyle}>
        {label && (
          <label {...labelProps} style={labelStyle}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          name={name}
          value={value ?? ''}
          placeholder={placeholder}
          rows={rows}
          onChange={(e) => onChange?.(e.target.value)}
          style={inputStyle}
          {...controlProps}
          {...xComponentProps}
          {...rest}
        />
        <FieldMessages ids={ids} description={description} errorText={errorText} />
      </div>
    );
  }
);

DefaultInputTextarea.displayName = 'DefaultInputTextarea';
