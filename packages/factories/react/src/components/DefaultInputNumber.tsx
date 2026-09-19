/**
 * Default InputNumber Component
 *
 * Built-in number input for forms. Can be overridden via createComponentSpec.
 */

import React from 'react';
import { useFieldA11y, FieldMessages } from './field-a11y';

/**
 * Props passed to the InputNumber component.
 * Use this type when customizing InputNumber via components.InputNumber.
 */
export interface InputNumberProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange' | 'type'
  > {
  /** Test ID for the input number */
  'data-test-id'?: string;
  name: string;
  value?: number | string;
  onChange?: (value: number | string) => void;
  label?: string;
  /** Helper text rendered below the input and linked via aria-describedby */
  description?: string;
  min?: number;
  max?: number;
  step?: number | string;
  externalContext?: Record<string, any>;
  "x-component-props"?: Record<string, any>;
  "x-ui"?: Record<string, any>;
}

/**
 * Component type for custom InputNumber. Use with createComponentSpec when
 * registering a custom InputNumber in components.
 */
export type InputNumberComponentType = React.ComponentType<InputNumberProps>;

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
 * Default number input component.
 */
export const DefaultInputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(
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
      min,
      max,
      step,
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
        <input
          ref={ref}
          type="number"
          name={name}
          value={value ?? ''}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          onChange={(e) =>
            onChange?.(e.target.value ? Number(e.target.value) : '')
          }
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

DefaultInputNumber.displayName = 'DefaultInputNumber';
