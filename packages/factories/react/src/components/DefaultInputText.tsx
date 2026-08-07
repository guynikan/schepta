/**
 * Default InputText Component
 *
 * Built-in text input for forms. Can be overridden via createComponentSpec.
 */

import React from 'react';
import { useFieldA11y, FieldMessages } from './field-a11y';

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
  /** Helper text rendered below the input and linked via aria-describedby */
  description?: string;
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

DefaultInputText.displayName = 'DefaultInputText';
