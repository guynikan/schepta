/**
 * Default FormSectionTitle Component
 *
 * Section title (x-content). Can be overridden via createComponentSpec.
 */

import React from 'react';

/**
 * Props passed to the FormSectionTitle component.
 * Use this type when customizing FormSectionTitle via components.FormSectionTitle.
 */
export interface FormSectionTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Title content (from schema x-content) */
  'x-content'?: string;
  /** Optional children (alternative to x-content) */
  children?: React.ReactNode;
  /** Test ID for the form section title */
  'data-test-id'?: string;
  externalContext?: Record<string, any>;
}

/**
 * Component type for custom FormSectionTitle. Use with createComponentSpec when
 * registering a custom FormSectionTitle in components.
 */
export type FormSectionTitleComponentType =
  React.ComponentType<FormSectionTitleProps>;

/**
 * Default form section title component.
 */
export const DefaultFormSectionTitle: React.FC<FormSectionTitleProps> = ({
  'x-content': content,
  children,
  externalContext,
  ...props
}) => {
  return (
    <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600', color: '#333', ...props.style }} {...props}>
      {content ?? children}
    </h2>
  );
};
