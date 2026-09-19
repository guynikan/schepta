import React, { useMemo, useRef, useState } from 'react';
import {
  LayoutFactory,
  type LayoutFactoryRef,
} from '@schepta/factory-react';
import appShellSchema from '../../../../instances/layout/app-shell.json';

interface LayoutShowcaseProps {
  isDark?: boolean;
}

export function LayoutShowcase({ isDark = false }: LayoutShowcaseProps) {
  const layoutRef = useRef<LayoutFactoryRef>(null);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [hasSidebar, setHasSidebar] = useState<boolean | null>(null);

  const readSlots = () => {
    setSlots(layoutRef.current?.getSlots() ?? []);
  };

  const readSidebar = () => {
    setHasSidebar(layoutRef.current?.hasSlot('sidebar') ?? false);
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
    <div data-test-id="layout-showcase" data-theme={isDark ? 'dark' : 'light'} style={layout}>
      <LayoutFactory ref={layoutRef} schema={appShellSchema as any} />

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button type="button" data-test-id="layout-read-slots" onClick={readSlots} style={button}>
          Read slots (ref)
        </button>
        <button
          type="button"
          data-test-id="layout-read-sidebar"
          onClick={readSidebar}
          style={button}
        >
          Check sidebar (ref)
        </button>
      </div>

      <section>
        <h4 style={{ margin: '0 0 4px' }}>Declared slots</h4>
        <pre data-test-id="layout-slots" style={box}>
          {slots ? JSON.stringify(slots) : 'No ref read yet'}
        </pre>
      </section>

      <section>
        <h4 style={{ margin: '0 0 4px' }}>Sidebar slot</h4>
        <pre data-test-id="layout-sidebar-state" style={box}>
          {hasSidebar === null ? 'No ref read yet' : JSON.stringify({ present: hasSidebar })}
        </pre>
      </section>

      <p style={{ fontSize: '13px', opacity: 0.7, margin: 0 }}>
        This showcase is powered by <code>LayoutFactory</code>. The schema composes
        header, sidebar, main and footer slots from
        <code> instances/layout/app-shell.json</code>.
      </p>
    </div>
  );
}
