import React, { useMemo, useRef, useState } from 'react';
import {
  ModalFactory,
  type ModalFactoryRef,
} from '@schepta/factory-react';
import confirmDialogSchema from '../../../../instances/modal/confirm-dialog.json';

interface ModalShowcaseProps {
  isDark?: boolean;
}

export function ModalShowcase({ isDark = false }: ModalShowcaseProps) {
  const modalRef = useRef<ModalFactoryRef>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [lastChange, setLastChange] = useState<boolean | null>(null);
  const [refState, setRefState] = useState<boolean | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
    setLastChange(nextOpen);
  };

  const readState = () => {
    setRefState(modalRef.current?.isOpen() ?? false);
  };

  const layout: React.CSSProperties = useMemo(
    () => ({
      display: 'grid',
      gap: '16px',
      padding: '24px',
      border: '1px solid var(--schepta-border, #cccccc)',
      borderRadius: '8px',
      background: 'var(--schepta-bg, transparent)',
      color: 'var(--schepta-text-1, inherit)',
    }),
    []
  );

  const button: React.CSSProperties = useMemo(
    () => ({
      padding: '8px 12px',
      borderRadius: '4px',
      border: '1px solid var(--schepta-border, #cccccc)',
      background: 'transparent',
      color: 'inherit',
      cursor: 'pointer',
      fontSize: '13px',
    }),
    []
  );

  const box: React.CSSProperties = useMemo(
    () => ({
      padding: '12px',
      borderRadius: '4px',
      background: 'var(--vp-code-bg, rgba(0,0,0,0.05))',
      color: 'inherit',
      fontSize: '12px',
      whiteSpace: 'pre-wrap',
      minHeight: '40px',
    }),
    []
  );

  return (
    <div data-test-id="modal-showcase" data-theme={isDark ? 'dark' : 'light'} style={layout}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          type="button"
          data-test-id="modal-open"
          onClick={() => modalRef.current?.open()}
          style={button}
        >
          Open modal
        </button>
        <button
          type="button"
          data-test-id="modal-close-ref"
          onClick={() => modalRef.current?.close()}
          style={button}
        >
          Close modal (ref)
        </button>
        <button
          type="button"
          data-test-id="modal-toggle"
          onClick={() => modalRef.current?.toggle()}
          style={button}
        >
          Toggle modal (ref)
        </button>
        <button
          type="button"
          data-test-id="modal-read-state"
          onClick={readState}
          style={button}
        >
          Read state (ref)
        </button>
      </div>

      <p data-test-id="modal-open-state" style={{ margin: 0 }}>
        Open: <strong>{isOpen ? 'yes' : 'no'}</strong>
      </p>

      <section>
        <h4 style={{ margin: '0 0 4px' }}>Last onOpenChange</h4>
        <pre data-test-id="modal-last-change" style={box}>
          {lastChange === null ? 'No change yet' : JSON.stringify({ open: lastChange })}
        </pre>
      </section>

      <section>
        <h4 style={{ margin: '0 0 4px' }}>Imperative state</h4>
        <pre data-test-id="modal-ref-state" style={box}>
          {refState === null ? 'No ref read yet' : JSON.stringify({ open: refState })}
        </pre>
      </section>

      <p style={{ fontSize: '13px', opacity: 0.7, margin: 0 }}>
        This showcase is powered by <code>ModalFactory</code>. The schema lives in
        <code> instances/modal/confirm-dialog.json</code>; open state is controlled
        through callbacks and the imperative ref API.
      </p>

      <ModalFactory
        ref={modalRef}
        schema={confirmDialogSchema as any}
        onOpenChange={handleOpenChange}
      />
    </div>
  );
}
