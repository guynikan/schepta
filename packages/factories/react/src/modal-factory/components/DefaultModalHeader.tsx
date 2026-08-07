import React from 'react';
import { useOptionalModalContext } from '../context';

export interface DefaultModalHeaderProps {
  title?: string;
  description?: string;
  showCloseButton?: boolean;
  children?: React.ReactNode;
  'x-content'?: string;
  'data-test-id'?: string;
}

export function DefaultModalHeader({
  title,
  description,
  showCloseButton = true,
  children,
  'x-content': xContent,
  'data-test-id': dataTestId,
}: DefaultModalHeaderProps) {
  const ctx = useOptionalModalContext();

  return (
    <header
      data-slot="header"
      data-schepta-modal-header="true"
      data-test-id={dataTestId}
      style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--schepta-border)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        {title ? (
          // id comes from ModalContext so the dialog can name itself from
          // this heading via aria-labelledby.
          <h2
            id={ctx?.titleId}
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--schepta-text-1)',
            }}
          >
            {title}
          </h2>
        ) : null}
        {description || xContent ? (
          <p
            id={ctx?.descriptionId}
            style={{
              margin: '4px 0 0',
              fontSize: '13px',
              color: 'var(--schepta-text-2)',
            }}
          >
            {description ?? xContent}
          </p>
        ) : null}
        {children}
      </div>
      {showCloseButton && ctx ? (
        <button
          type="button"
          aria-label="Close dialog"
          data-test-id="modal-close"
          onClick={() => ctx.close()}
          style={{
            border: 'none',
            background: 'transparent',
            color: 'var(--schepta-text-2)',
            fontSize: '20px',
            lineHeight: 1,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
          }}
        >
          ×
        </button>
      ) : null}
    </header>
  );
}
