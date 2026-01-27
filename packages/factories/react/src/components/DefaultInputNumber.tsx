/**
 * Default InputNumber Component
 *
 * Built-in number input for forms. Can be overridden via createComponentSpec.
 */

import React from 'react';

/**
 * Props passed to the InputNumber component.
 * Use this type when customizing InputNumber via components.InputNumber.
 */
export interface InputNumberProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange' | 'type'
  > {
  name: string;
  value?: number | string;
  onChange?: (value: number | string) => void;
  label?: string;
  min?: number;
  max?: number;
  step?: number | string;
}

/**
 * Component type for custom InputNumber. Use with createComponentSpec when
 * registering a custom InputNumber in components.
 */
export type InputNumberComponentType = React.ComponentType<InputNumberProps>;

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px',
  border: '1px solid #ccc',
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
  ({ label, name, value, onChange, placeholder, min, max, step, ...rest }, ref) => {
    return (
      <div style={wrapperStyle}>
        {label && (
          <label htmlFor={name} style={labelStyle}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          type="number"
          id={name}
          name={name}
          data-test-id={name}
          value={value ?? ''}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          onChange={(e) =>
            onChange?.(e.target.value ? Number(e.target.value) : '')
          }
          style={inputStyle}
          {...rest}
        />
      </div>
    );
  }
);

DefaultInputNumber.displayName = 'DefaultInputNumber';
