/**
 * Default InputCheckbox Component
 *
 * Built-in checkbox input for forms. Can be overridden via createComponentSpec.
 */

import React from 'react';

/**
 * Props passed to the InputCheckbox component.
 * Use this type when customizing InputCheckbox via components.InputCheckbox.
 */
export interface InputCheckboxProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange' | 'checked' | 'type'
  > {
  name: string;
  value?: boolean;
  onChange?: (value: boolean) => void;
  label?: string;
  children?: React.ReactNode;
}

/**
 * Component type for custom InputCheckbox. Use with createComponentSpec when
 * registering a custom InputCheckbox in components.
 */
export type InputCheckboxComponentType = React.ComponentType<InputCheckboxProps>;

const wrapperStyle: React.CSSProperties = { marginBottom: '16px' };

const labelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

/**
 * Default checkbox input component.
 */
export const DefaultInputCheckbox = React.forwardRef<HTMLInputElement, InputCheckboxProps>(
  ({ label, name, value, onChange, children, ...rest }, ref) => {
    return (
      <div style={wrapperStyle}>
        <label style={labelStyle}>
          <input
            ref={ref}
            type="checkbox"
            name={name}
            data-test-id={name}
            checked={value ?? false}
            onChange={(e) => onChange?.(e.target.checked)}
            {...rest}
          />
          {label}
        </label>
        {children}
      </div>
    );
  }
);

DefaultInputCheckbox.displayName = 'DefaultInputCheckbox';
