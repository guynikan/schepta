import React from 'react';

export interface DefaultLayoutSidebarProps {
  ariaLabel?: string;
  collapsible?: boolean;
  width?: string | number;
  children?: React.ReactNode;
  'x-content'?: string;
  'data-test-id'?: string;
}

export function DefaultLayoutSidebar({
  ariaLabel,
  collapsible,
  width,
  children,
  'x-content': xContent,
  'data-test-id': dataTestId,
}: DefaultLayoutSidebarProps) {
  return (
    <aside
      aria-label={ariaLabel || 'Sidebar'}
      data-slot="sidebar"
      data-collapsible={collapsible || undefined}
      data-test-id={dataTestId}
      style={{
        gridArea: 'sidebar',
        padding: '16px',
        borderRight: '1px solid var(--schepta-border)',
        background: 'var(--schepta-bg-subtle, transparent)',
        minHeight: 0,
        width,
      }}
    >
      {xContent ? <span>{xContent}</span> : null}
      {children}
    </aside>
  );
}
