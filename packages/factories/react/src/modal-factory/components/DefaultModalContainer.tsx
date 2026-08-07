import React from 'react';
import { createPortal } from 'react-dom';
import { useOptionalModalContext, type ModalSize } from '../context';
import { useFocusTrap } from '../../a11y';

export interface DefaultModalContainerProps {
  ariaLabel?: string;
  size?: ModalSize;
  dismissible?: boolean;
  children?: React.ReactNode;
  /** Schema node for the dialog, injected by the orchestrator */
  schema?: Record<string, any>;
  'data-test-id'?: string;
}

const SIZE_MAP: Record<ModalSize, string | number> = {
  sm: '360px',
  md: '520px',
  lg: '720px',
  xl: '960px',
  full: '100%',
};

/**
 * Reads what the schema's ModalHeader declares, so the dialog only points
 * `aria-labelledby` / `aria-describedby` at text that will actually render.
 * A reference to a missing element is itself an accessibility violation.
 */
function readHeaderContent(schema?: Record<string, any>): {
  hasTitle: boolean;
  hasDescription: boolean;
} {
  const properties = schema?.properties;
  if (!properties || typeof properties !== 'object') {
    return { hasTitle: false, hasDescription: false };
  }

  for (const child of Object.values(properties) as any[]) {
    if (child?.['x-component'] !== 'ModalHeader') continue;
    const headerProps = child['x-component-props'] ?? {};
    return {
      hasTitle: Boolean(headerProps.title),
      hasDescription: Boolean(headerProps.description || child['x-content']),
    };
  }
  return { hasTitle: false, hasDescription: false };
}

/**
 * Default modal container.
 *
 * Renders a full-screen backdrop + a centered dialog when the factory's
 * `isOpen` state (via `ModalContext`) is true. When closed it renders
 * nothing at all — the modal is removed from the DOM so keyboard focus
 * can safely move back to the opener.
 *
 * Accessibility:
 *  - Focus is trapped inside the dialog while open and restored to the
 *    element that opened it on close (`useFocusTrap`).
 *  - The dialog is portalled to `document.body` so it is never nested inside
 *    an ancestor that is `aria-hidden`, transformed, or clipped.
 *  - It names itself from the header's title when the schema declares one,
 *    falling back to `ariaLabel`.
 *
 * Dismissal:
 *  - Clicking the backdrop (when `dismissible`) calls `close`.
 *  - `Escape` is handled globally by ModalFactory.
 */
export function DefaultModalContainer({
  ariaLabel,
  children,
  schema,
  'data-test-id': dataTestId,
}: DefaultModalContainerProps) {
  const ctx = useOptionalModalContext();
  const isOpen = ctx?.isOpen ?? false;

  // Hooks run unconditionally; the trap is inert while `active` is false.
  const dialogRef = useFocusTrap<HTMLDivElement>({ active: isOpen });

  if (!ctx) {
    return (
      <div
        role="alert"
        style={{
          padding: '12px',
          border: '1px solid var(--schepta-error-border)',
          color: 'var(--schepta-error-text)',
          borderRadius: '4px',
        }}
      >
        DefaultModalContainer must be rendered by ModalFactory (missing ModalContext).
      </div>
    );
  }

  const { dismissible, size, close, titleId, descriptionId } = ctx;

  if (!isOpen) return null;

  const { hasTitle, hasDescription } = readHeaderContent(schema);

  const handleBackdropMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!dismissible) return;
    if (event.target === event.currentTarget) {
      close();
    }
  };

  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
  };

  const dialogStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: SIZE_MAP[size],
    background: 'var(--schepta-bg, white)',
    color: 'var(--schepta-text-1)',
    borderRadius: '8px',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
    border: '1px solid var(--schepta-border)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    maxHeight: size === 'full' ? '100%' : '90vh',
  };

  const dialog = (
    <div
      role="presentation"
      data-schepta-modal-backdrop="true"
      data-test-id={dataTestId ? `${dataTestId}-backdrop` : 'modal-backdrop'}
      onMouseDown={handleBackdropMouseDown}
      style={backdropStyle}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        // Prefer the real heading as the accessible name; `ariaLabel` is the
        // fallback for dialogs whose schema declares no header title.
        aria-labelledby={hasTitle ? titleId : undefined}
        aria-label={hasTitle ? undefined : ariaLabel || 'Dialog'}
        aria-describedby={hasDescription ? descriptionId : undefined}
        data-schepta-modal="true"
        data-modal-size={size}
        data-test-id={dataTestId}
        // Focusable so the trap has somewhere to put focus in a dialog with
        // no focusable children.
        tabIndex={-1}
        style={dialogStyle}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  // Portalling keeps the dialog out of any ancestor stacking or aria-hidden
  // context. Guarded for SSR, where there is no document to portal into.
  return typeof document !== 'undefined'
    ? createPortal(dialog, document.body)
    : dialog;
}
