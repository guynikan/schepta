/**
 * Default FormSectionGroupContainer Component
 *
 * Container for FormSectionGroup(s). Can be overridden via createComponentSpec.
 */

import React from 'react';

/**
 * Props passed to the FormSectionGroupContainer component.
 * Use this type when customizing FormSectionGroupContainer via components.FormSectionGroupContainer.
 */
export interface FormSectionGroupContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Container children (FormSectionGroup components) */
  children?: React.ReactNode;
  /** Test ID for the form section group container */
  'data-test-id'?: string;
  externalContext?: Record<string, any>;
  "x-component-props"?: Record<string, any>;
  "x-ui"?: Record<string, any>;
}

/**
 * Component type for custom FormSectionGroupContainer. Use with createComponentSpec when
 * registering a custom FormSectionGroupContainer in components.
 */
export type FormSectionGroupContainerComponentType =
  React.ComponentType<FormSectionGroupContainerProps>;

/**
 * Default form section group container component.
 */
export const DefaultFormSectionGroupContainer: React.FC<FormSectionGroupContainerProps> = ({
  children,
  externalContext,
  ...props
}) => {
  return (
    <div {...props}>
      {children}
    </div>
  );
};
