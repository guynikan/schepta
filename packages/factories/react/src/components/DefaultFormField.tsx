/**
 * Default FormField Component
 *
 * Wrapper (grid cell) for a single form field. Can be overridden via createComponentSpec.
 */

import React from 'react';

/**
 * Props passed to the FormField component.
 * Use this type when customizing FormField via components.FormField.
 */
export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Form field children (typically the rendered input) */
  children?: React.ReactNode;
}

/**
 * Component type for custom FormField. Use with createComponentSpec when
 * registering a custom FormField in components.
 */
export type FormFieldComponentType = React.ComponentType<FormFieldProps>;

/**
 * Default form field wrapper component.
 */
export const DefaultFormField: React.FC<FormFieldProps> = ({
  children,
  ...props
}) => {
  return (
    <div data-test-id="FormField" {...props}>
      {children}
    </div>
  );
};
