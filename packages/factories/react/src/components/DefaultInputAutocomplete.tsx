/**
 * Default InputAutocomplete Component
 *
 * Built-in autocomplete input for forms (uses native datalist).
 * Can be overridden via createComponentSpec.
 */

import React from 'react';

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
>(({ label, name, value, onChange, placeholder, options = [], externalContext, "x-component-props": xComponentProps, "x-ui": xUi, ...rest }, ref) => {
  const listId = `${name}-datalist`;
  const normalizedOptions = normalizeOptions(options);

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
        list={listId}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        style={inputStyle}
        {...xComponentProps}
        {...rest}
      />
      <datalist id={listId}>
        {normalizedOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </datalist>
    </div>
  );
});

DefaultInputAutocomplete.displayName = 'DefaultInputAutocomplete';
