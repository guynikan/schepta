/**
 * Default InputAutocomplete Component
 *
 * Built-in autocomplete input for forms (uses native datalist).
 * Can be overridden via createComponentSpec.
 */

import React from 'react';
import { useFieldA11y, FieldMessages } from './field-a11y';

export interface InputAutocompleteOption {
  value: string;
  label?: string;
}

/**
 * Props passed to the InputAutocomplete component.
 * Use this type when customizing InputAutocomplete via components.InputAutocomplete.
 */
export interface InputAutocompleteProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange' | 'list'
  > {
  /** Test ID for the input autocomplete */
  'data-test-id'?: string;
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  /** Helper text rendered below the input and linked via aria-describedby */
  description?: string;
  /** List of options for autocomplete (value used for both value and label if label omitted) */
  options?: InputAutocompleteOption[] | string[];
  externalContext?: Record<string, any>;
  "x-component-props"?: Record<string, any>;
  "x-ui"?: Record<string, any>;
}

/**
 * Component type for custom InputAutocomplete. Use with createComponentSpec when
 * registering a custom InputAutocomplete in components.
 */
export type InputAutocompleteComponentType = React.ComponentType<InputAutocompleteProps>;

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

function normalizeOptions(
  options: InputAutocompleteOption[] | string[] = []
): { value: string; label: string }[] {
  return options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : { value: opt.value, label: opt.label ?? opt.value }
  );
}

/**
 * Default autocomplete input component (uses native datalist).
 */
export const DefaultInputAutocomplete = React.forwardRef<
  HTMLInputElement,
  InputAutocompleteProps
>(
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
      options = [],
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
    const normalizedOptions = normalizeOptions(options);

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
          list={ids.listId}
          value={value ?? ''}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          style={inputStyle}
          {...controlProps}
          {...xComponentProps}
          {...rest}
        />
        <datalist id={ids.listId}>
          {normalizedOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </datalist>
        <FieldMessages ids={ids} description={description} errorText={errorText} />
      </div>
    );
  }
);

DefaultInputAutocomplete.displayName = 'DefaultInputAutocomplete';
