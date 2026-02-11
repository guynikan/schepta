/**
 * Default FormSectionContainer Component
 *
 * Container for a form section (title + groups). Can be overridden via createComponentSpec.
 */

import React from 'react';

/**
 * Props passed to the FormSectionContainer component.
 * Use this type when customizing FormSectionContainer via components.FormSectionContainer.
 */
export interface FormSectionContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Section children (FormSectionTitle, FormSectionGroupContainer) */
  children?: React.ReactNode;
  /** Test ID for the form section container */
  'data-test-id'?: string;
  externalContext?: Record<string, any>;
  "x-component-props"?: Record<string, any>;
  'x-ui'?: Record<string, any>;
}

/**
 * Component type for custom FormSectionContainer. Use with createComponentSpec when
 * registering a custom FormSectionContainer in components.
 */
export type FormSectionContainerComponentType =
  React.ComponentType<FormSectionContainerProps>;

/**
 * Default form section container component.
 */
export const DefaultFormSectionContainer: React.FC<FormSectionContainerProps> = ({
  children,
  externalContext,
  'x-ui': xUi,
  "x-component-props": xComponentProps,
  ...props
}) => {
  return (
    <div style={{ marginBottom: '24px', ...props.style }} {...props}>
      {children}
    </div>
  );
};
