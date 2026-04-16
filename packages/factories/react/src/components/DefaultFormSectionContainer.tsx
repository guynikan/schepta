/**
 * Default FormSectionContainer Component
 *
 * Container for a form section (title + groups). Can be overridden via createComponentSpec.
 * Supports lazy rendering via x-ui.lazy (opt-in): sections outside the viewport
 * render a placeholder until they scroll into view.
 */

import React, { useRef, useState, useEffect } from 'react';

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

const PLACEHOLDER_HEIGHT = 120;

/**
 * Default form section container component.
 */
export const DefaultFormSectionContainer: React.FC<FormSectionContainerProps> = React.memo(
  function DefaultFormSectionContainer({ children, externalContext, 'x-ui': xUi, "x-component-props": xComponentProps, ...props }) {
    const lazy = xUi?.lazy === true;
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(!lazy);

    useEffect(() => {
      if (!lazy || !ref.current) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { rootMargin: '200px' }
      );
      observer.observe(ref.current);
      return () => observer.disconnect();
    }, [lazy]);

    if (lazy && !isVisible) {
      return (
        <div
          ref={ref}
          style={{ minHeight: PLACEHOLDER_HEIGHT, marginBottom: '24px', ...props.style }}
          {...props}
        />
      );
    }

    return (
      <div ref={ref} style={{ marginBottom: '24px', ...props.style }} {...props}>
        {children}
      </div>
    );
  }
);
