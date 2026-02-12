/**
 * Default InputText Component
 *
 * Built-in text input for forms. Can be overridden via createComponentSpec.
 */

import React from 'react';

/**
 * Props passed to the InputText component.
 * Use this type when customizing InputText via components.InputText.
 */
export interface InputTextProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange' | 'type'
  > {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  /** Test ID for the input text */
  'data-test-id'?: string;
  externalContext?: Record<string, any>;
  "x-component-props"?: Record<string, any>;
  "x-ui"?: Record<string, any>;
}

/**
 * Component type for custom InputText. Use with createComponentSpec when
 * registering a custom InputText in components.
 */
export type InputTextComponentType = React.ComponentType<InputTextProps>;

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
 * Default text input component.
 */
export const DefaultInputText = React.forwardRef<HTMLInputElement, InputTextProps>(
  ({ label, name, value, onChange, placeholder, externalContext, "x-component-props": xComponentProps, "x-ui": xUi, ...rest }, ref) => {
    return (
      <div style={wrapperStyle}>
        {label && (
          <label htmlFor={name} style={labelStyle}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={name}
          name={name}
          value={value ?? ''}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          style={inputStyle}
          {...xComponentProps}
          {...rest}
        />
      </div>
    );
  }
);

DefaultInputText.displayName = 'DefaultInputText';
