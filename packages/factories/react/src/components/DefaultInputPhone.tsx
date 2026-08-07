/**
 * Default InputPhone Component
 *
 * Built-in phone input for forms (text input with type="tel").
 * Can be overridden via createComponentSpec.
 */

import React from 'react';
import { useFieldA11y, FieldMessages } from './field-a11y';

/**
 * Props passed to the InputPhone component.
 * Use this type when customizing InputPhone via components.InputPhone.
 */
export interface InputPhoneProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange' | 'type'
  > {
  /** Test ID for the input phone */
  'data-test-id'?: string;
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  /** Helper text rendered below the input and linked via aria-describedby */
  description?: string;
  externalContext?: Record<string, any>;
  "x-component-props"?: Record<string, any>;
  "x-ui"?: Record<string, any>;
}

/**
 * Component type for custom InputPhone. Use with createComponentSpec when
 * registering a custom InputPhone in components.
 */
export type InputPhoneComponentType = React.ComponentType<InputPhoneProps>;

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
 * Default phone input component (uses type="tel").
 */
export const DefaultInputPhone = React.forwardRef<HTMLInputElement, InputPhoneProps>(
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
          type="tel"
          name={name}
          value={value ?? ''}
          placeholder={placeholder}
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

DefaultInputPhone.displayName = 'DefaultInputPhone';
