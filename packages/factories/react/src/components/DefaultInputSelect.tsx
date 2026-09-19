/**
 * Default InputSelect Component
 *
 * Built-in select input for forms. Can be overridden via createComponentSpec.
 */

import React from 'react';
import { useFieldA11y, FieldMessages } from './field-a11y';

export interface InputSelectOption {
  value: string;
  label: string;
}

/**
 * Props passed to the InputSelect component.
 * Use this type when customizing InputSelect via components.InputSelect.
 */
export interface InputSelectProps
  extends Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    'value' | 'onChange'
  > {
  /** Test ID for the input select */
  'data-test-id'?: string;
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  /** Helper text rendered below the select and linked via aria-describedby */
  description?: string;
  placeholder?: string;
  options?: InputSelectOption[];
  children?: React.ReactNode;
  externalContext?: Record<string, any>;
  "x-component-props"?: Record<string, any>;
  "x-ui"?: Record<string, any>;
}

/**
 * Component type for custom InputSelect. Use with createComponentSpec when
 * registering a custom InputSelect in components.
 */
export type InputSelectComponentType = React.ComponentType<InputSelectProps>;

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px',
  border: '1px solid var(--schepta-border)',
  borderRadius: '4px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '4px',
  fontWeight: '500',
};

const wrapperStyle: React.CSSProperties = { marginBottom: '16px' };

/**
 * Default select input component.
 */
export const DefaultInputSelect = React.forwardRef<HTMLSelectElement, InputSelectProps>(
  (
    {
      label,
      name,
      value,
      onChange,
      options = [],
      placeholder = 'Select...',
      description,
      required,
      id,
      'aria-describedby': ariaDescribedBy,
      children,
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
        <select
          ref={ref}
          name={name}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          style={inputStyle}
          {...controlProps}
          {...xComponentProps}
          {...rest}
        >
          {/*
            On a required select the placeholder must not be a selectable
            answer — `disabled` keeps it visible as the initial state while
            forcing a real choice.
          */}
          <option value="" disabled={required}>
            {placeholder}
          </option>
          {options.map((opt: InputSelectOption) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <FieldMessages ids={ids} description={description} errorText={errorText} />
        {children}
      </div>
    );
  }
);

DefaultInputSelect.displayName = 'DefaultInputSelect';
