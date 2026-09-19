/**
 * Default FormSectionTitle Component
 *
 * Section title (x-content). Can be overridden via createComponentSpec.
 */

import React from "react";
import { useOptionalFormSectionContext } from "./form-section-context";

/** Heading levels a section title may render as. */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Props passed to the FormSectionTitle component.
 * Use this type when customizing FormSectionTitle via components.FormSectionTitle.
 */
export interface FormSectionTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Title content (from schema x-content) */
  "x-content"?: string;
  /** Optional children (alternative to x-content) */
  children?: React.ReactNode;
  /**
   * Heading level to render (1-6). Defaults to 2.
   *
   * A form rarely owns the whole page, so a hardcoded `<h2>` can skip a level
   * or compete with the host's own headings. Authors set this from
   * `x-component-props.headingLevel` to fit the surrounding outline.
   */
  headingLevel?: HeadingLevel;
  /** Test ID for the form section title */
  "data-test-id"?: string;
  externalContext?: Record<string, any>;
  "x-component-props"?: Record<string, any>;
  "x-ui"?: Record<string, any>;
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
  "x-content": content,
  children,
  headingLevel = 2,
  id,
  externalContext,
  "x-component-props": xComponentProps,
  "x-ui": xUi,
  ...props
}) => {
  const section = useOptionalFormSectionContext();
  const Heading = `h${headingLevel}` as const;

  return (
    <Heading
      // The id the parent section points its aria-labelledby at, so the
      // section inherits this heading as its accessible name.
      id={id ?? section?.titleId}
      style={{
        marginBottom: "16px",
        fontSize: "20px",
        fontWeight: "600",
        color: "var(--schepta-text-1)",
        ...props.style,
      }}
      {...xComponentProps}
      {...props}
    >
      {content ?? children}
    </Heading>
  );
};
