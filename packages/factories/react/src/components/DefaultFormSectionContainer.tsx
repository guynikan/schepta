/**
 * Default FormSectionContainer Component
 *
 * Container for a form section (title + groups). Can be overridden via createComponentSpec.
 * Supports lazy rendering via x-ui.lazy (opt-in): sections outside the viewport
 * render a placeholder until they scroll into view.
 */

import React, { useRef, useState, useEffect, useId } from 'react';
import { FormSectionProvider } from './form-section-context';

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
  /** Schema node for this section, injected by the orchestrator */
  schema?: Record<string, any>;
  externalContext?: Record<string, any>;
  "x-component-props"?: Record<string, any>;
  'x-ui'?: Record<string, any>;
}

/**
 * Whether this section declares a `FormSectionTitle` child.
 *
 * Checked against the schema rather than the rendered children because
 * `aria-labelledby` pointing at an element that never renders is itself a
 * violation — the attribute has to be omitted when there is no heading.
 */
function hasSectionTitle(schema?: Record<string, any>): boolean {
  const properties = schema?.properties;
  if (!properties || typeof properties !== 'object') return false;
  return Object.values(properties).some(
    (child: any) => child?.['x-component'] === 'FormSectionTitle'
  );
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
  function DefaultFormSectionContainer({ children, schema, externalContext, 'x-ui': xUi, "x-component-props": xComponentProps, ...props }) {
    const lazy = xUi?.lazy === true;
    const ref = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(!lazy);
    const titleId = useId();
    const labelled = hasSectionTitle(schema);

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
        <section
          ref={ref}
          style={{ minHeight: PLACEHOLDER_HEIGHT, marginBottom: '24px', ...props.style }}
          {...props}
        />
      );
    }

    return (
      // <section> rather than <div>: a titled group of fields is a real
      // landmark, and giving it an accessible name lets screen reader users
      // jump between sections instead of walking every field.
      <section
        ref={ref}
        aria-labelledby={labelled ? titleId : undefined}
        style={{ marginBottom: '24px', ...props.style }}
        {...props}
      >
        <FormSectionProvider value={{ titleId }}>{children}</FormSectionProvider>
      </section>
    );
  }
);
