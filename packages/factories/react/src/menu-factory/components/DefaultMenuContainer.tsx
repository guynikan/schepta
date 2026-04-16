import React from 'react';

export interface DefaultMenuContainerProps {
  ariaLabel?: string;
  children?: React.ReactNode;
}

export function DefaultMenuContainer({
  ariaLabel,
  children,
}: DefaultMenuContainerProps) {
  return (
    <nav
      aria-label={ariaLabel || 'Menu'}
      className="schepta-menu"
      data-schepta-menu="true"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        padding: '8px',
        background: 'var(--schepta-bg)',
        border: '1px solid var(--schepta-border)',
        borderRadius: '6px',
        minWidth: '220px',
      }}
    >
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}
      >
        {children}
      </ul>
    </nav>
  );
}
