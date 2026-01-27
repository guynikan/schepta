/**
 * Default InputDate Component
 *
 * Built-in date input for forms. Can be overridden via createComponentSpec.
 */

import React from 'react';

/**
 * Props passed to the InputDate component.
 * Use this type when customizing InputDate via components.InputDate.
 */
export interface InputDateProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange' | 'type'
  > {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
}

/**
 * Component type for custom InputDate. Use with createComponentSpec when
 * registering a custom InputDate in components.
 */
export type InputDateComponentType = React.ComponentType<InputDateProps>;

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
 * Default date input component.
 */
export const DefaultInputDate = React.forwardRef<HTMLInputElement, InputDateProps>(
  ({ label, name, value, onChange, ...rest }, ref) => {
    return (
      <div style={wrapperStyle}>
        {label && (
          <label htmlFor={name} style={labelStyle}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          type="date"
          id={name}
          name={name}
          data-test-id={name}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          style={inputStyle}
          {...rest}
        />
      </div>
    );
  }
);

DefaultInputDate.displayName = 'DefaultInputDate';
