import React from 'react';

export interface DefaultMenuGroupProps {
  label: string;
  children?: React.ReactNode;
}

export function DefaultMenuGroup({ label, children }: DefaultMenuGroupProps) {
  return (
    <li data-schepta-menu-group="true" style={{ listStyle: 'none' }}>
      <div
        role="presentation"
        style={{
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--schepta-text-2)',
          padding: '8px 12px 4px',
        }}
      >
        {label}
      </div>
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
    </li>
  );
}
