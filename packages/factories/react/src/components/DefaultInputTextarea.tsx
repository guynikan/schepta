/**
 * Default InputTextarea Component
 *
 * Built-in textarea input for forms. Can be overridden via createComponentSpec.
 */

import React from 'react';

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
  rows?: number;
}

/**
 * Component type for custom InputTextarea. Use with createComponentSpec when
 * registering a custom InputTextarea in components.
 */
export type InputTextareaComponentType = React.ComponentType<InputTextareaProps>;

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px',
  border: '1px solid #ccc',
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
>(({ label, name, value, onChange, placeholder, rows = 4, ...rest }, ref) => {
  return (
    <div style={wrapperStyle}>
      {label && (
        <label htmlFor={name} style={labelStyle}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={name}
        name={name}
        data-test-id={name}
        value={value ?? ''}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange?.(e.target.value)}
        style={inputStyle}
        {...rest}
      />
    </div>
  );
});

DefaultInputTextarea.displayName = 'DefaultInputTextarea';
