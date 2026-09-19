import React from 'react';
import { LayoutProvider, MAIN_CONTENT_ID } from './layout-context';

export type LayoutVariant = 'default' | 'with-sidebar' | 'stacked';
export type SidebarPosition = 'left' | 'right';

export interface DefaultLayoutContainerProps {
  ariaLabel?: string;
  variant?: LayoutVariant;
  sidebarPosition?: SidebarPosition;
  /**
   * Renders a "skip to main content" link as the first focusable element.
   * Defaults to true.
   *
   * Required by WCAG 2.4.1: without it, a keyboard user has to tab through
   * the whole header and sidebar on every single page before reaching the
   * content.
   */
  skipLink?: boolean;
  /** Label for the skip link. Defaults to "Skip to main content". */
  skipLinkLabel?: string;
  /**
   * Whether this layout is the page's top-level shell. When true the header
   * and footer are exposed as `banner` / `contentinfo` landmarks.
   *
   * Defaults to false: `<header>`/`<footer>` nested inside another element
   * are NOT landmarks per the HTML-AAM spec, and claiming a second banner on
   * a page that already has one is worse than claiming none.
   */
  isPageRoot?: boolean;
  children?: React.ReactNode;
  'data-test-id'?: string;
}

const skipLinkStyle: React.CSSProperties = {
  position: 'absolute',
  left: '8px',
  top: '-64px',
  zIndex: 1100,
  padding: '10px 16px',
  background: 'var(--schepta-bg)',
  color: 'var(--schepta-text-1)',
  border: '1px solid var(--schepta-border)',
  borderRadius: '4px',
  textDecoration: 'none',
  // Moved into view on focus rather than hidden outright, so it stays
  // reachable by keyboard while invisible to everyone else.
  transition: 'top 120ms ease',
};

function SkipLink({ label }: { label: string }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      data-schepta-skip-link="true"
      data-test-id="layout-skip-link"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...skipLinkStyle, top: focused ? '8px' : '-64px' }}
    >
      {label}
    </a>
  );
}

/**
 * Default application shell container.
 *
 * Uses CSS grid so that slot children (Header / Sidebar / Main / Footer) can
 * be placed without the factory caring about child order. Each slot component
 * tags itself with `data-slot`, which the container maps to a grid area.
 */
export function DefaultLayoutContainer({
  ariaLabel,
  variant = 'default',
  sidebarPosition = 'left',
  skipLink = true,
  skipLinkLabel = 'Skip to main content',
  isPageRoot = false,
  children,
  'data-test-id': dataTestId,
}: DefaultLayoutContainerProps) {
  const hasSidebar = variant === 'with-sidebar';
  const sidebarOnLeft = hasSidebar && sidebarPosition !== 'right';

  const gridTemplateColumns = hasSidebar
    ? sidebarOnLeft
      ? 'minmax(200px, 260px) 1fr'
      : '1fr minmax(200px, 260px)'
    : '1fr';

  const gridTemplateAreas = hasSidebar
    ? sidebarOnLeft
      ? '"header header" "sidebar main" "footer footer"'
      : '"header header" "main sidebar" "footer footer"'
    : '"header" "main" "footer"';

  const containerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns,
    gridTemplateRows: 'auto 1fr auto',
    gridTemplateAreas,
    minHeight: '100%',
    width: '100%',
    background: 'var(--schepta-bg)',
    color: 'var(--schepta-text-1)',
  };

  return (
    // No role on the wrapper: the landmarks are the slots inside it. A
    // `role="group"` here only adds a level of noise to the a11y tree that a
    // screen reader user has to step through.
    <div
      aria-label={ariaLabel || undefined}
      data-schepta-layout="true"
      data-layout-variant={variant}
      data-sidebar-position={hasSidebar ? sidebarPosition : undefined}
      data-test-id={dataTestId}
      style={{ ...containerStyle, position: 'relative' }}
    >
      {skipLink ? <SkipLink label={skipLinkLabel} /> : null}
      <LayoutProvider value={{ isPageRoot }}>{children}</LayoutProvider>
    </div>
  );
}
