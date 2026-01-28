/**
 * Default FormSectionGroup Component
 *
 * Grid layout for a group of form fields. Can be overridden via createComponentSpec.
 */

import React from 'react';

/**
 * Props passed to the FormSectionGroup component.
 * Use this type when customizing FormSectionGroup via components.FormSectionGroup.
 */
export interface FormSectionGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Group children (FormField components) */
  children?: React.ReactNode;
  /** Test ID for the form section group */
  'data-test-id'?: string;
  externalContext?: Record<string, any>;
  [key: string]: any;
}

/**
 * Component type for custom FormSectionGroup. Use with createComponentSpec when
 * registering a custom FormSectionGroup in components.
 */
export type FormSectionGroupComponentType =
  React.ComponentType<FormSectionGroupProps>;

/**
 * Default form section group component (grid layout).
 */
export const DefaultFormSectionGroup: React.FC<FormSectionGroupProps> = ({
  children,
  externalContext,
  ...props
}) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', ...props.style }} {...props}>
      {children}
    </div>
  );
};
