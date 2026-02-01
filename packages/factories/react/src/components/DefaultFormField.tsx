/**
 * Default FormField Component
 *
 * Wrapper (grid cell) for a single form field. Can be overridden via createComponentSpec.
 */

import React from "react";

/**
 * Props passed to the FormField component.
 * Use this type when customizing FormField via components.FormField.
 */
export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Form field children (typically the rendered input) */
  children?: React.ReactNode;
  /** Test ID for the form field */
  "data-test-id"?: string;
  externalContext?: Record<string, any>;
  "x-component-props"?: Record<string, any>;
  "x-ui"?: Record<string, any>;
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
  externalContext,
  "x-component-props": xComponentProps,
  "x-ui": xUi,
  ...props
}) => {
  return (
    <div
      {...xComponentProps}
      {...props}
    >
      {children}
    </div>
  );
};
