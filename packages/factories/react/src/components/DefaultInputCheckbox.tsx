/**
 * Default InputCheckbox Component
 *
 * Built-in checkbox input for forms. Can be overridden via createComponentSpec.
 */

import React from 'react';
import { useFieldA11y, FieldMessages } from './field-a11y';

/**
 * Props passed to the InputCheckbox component.
 * Use this type when customizing InputCheckbox via components.InputCheckbox.
 */
export interface InputCheckboxProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange' | 'checked' | 'type'
  > {
  /** Test ID for the input checkbox */
  'data-test-id'?: string;
  name: string;
  value?: boolean;
  onChange?: (value: boolean) => void;
  label?: string;
  /** Helper text rendered below the checkbox and linked via aria-describedby */
  description?: string;
  children?: React.ReactNode;
  externalContext?: Record<string, any>;
  "x-component-props"?: Record<string, any>;
  "x-ui"?: Record<string, any>;
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
  (
    {
      label,
      name,
      value,
      onChange,
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
        {/*
          Explicit htmlFor/id association rather than relying on the label
          wrapping the input: the implicit form breaks as soon as a consumer
          restyles this component and moves the input out of the label.
        */}
        <label {...labelProps} style={labelStyle}>
          <input
            ref={ref}
            type="checkbox"
            name={name}
            checked={value ?? false}
            onChange={(e) => onChange?.(e.target.checked)}
            {...controlProps}
            {...xComponentProps}
            {...rest}
          />
          {label}
        </label>
        <FieldMessages ids={ids} description={description} errorText={errorText} />
        {children}
      </div>
    );
  }
);

DefaultInputCheckbox.displayName = 'DefaultInputCheckbox';
