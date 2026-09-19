import React, { useRef, useState } from 'react';
import { MenuFactory, type MenuFactoryRef, type MenuSelectionPayload } from '@schepta/factory-react';
import simpleMenuSchema from '../../../../instances/menu/simple-menu.json';

interface MenuShowcaseProps {
  isDark?: boolean;
}

export function MenuShowcase({ isDark = false }: MenuShowcaseProps) {
  const menuRef = useRef<MenuFactoryRef>(null);
  const [lastSelection, setLastSelection] = useState<MenuSelectionPayload | null>(null);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const handleSelect = (payload: MenuSelectionPayload) => {
    setLastSelection(payload);
    setActiveItem(payload.key);
  };

  const handleReset = () => {
    menuRef.current?.setActiveItem(null);
    setActiveItem(null);
    setLastSelection(null);
  };

  const handleReadActive = () => {
    const current = menuRef.current?.getActiveItem() ?? null;
    setActiveItem(current);
  };

  const handleSelectSettingsViaRef = () => {
    menuRef.current?.setActiveItem('settings');
    setActiveItem('settings');
  };

  const layout: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    gap: '24px',
    padding: '24px',
    border: '1px solid var(--schepta-border, #cccccc)',
    borderRadius: '8px',
    background: 'var(--schepta-bg, transparent)',
    color: 'var(--schepta-text-1, inherit)',
  };

  const sidebar: React.CSSProperties = {
    borderRight: '1px solid var(--schepta-border, #cccccc)',
    paddingRight: '16px',
  };

  const panel: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const button: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid var(--schepta-border, #cccccc)',
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    fontSize: '14px',
  };

  const payloadBox: React.CSSProperties = {
    padding: '12px',
    borderRadius: '4px',
    background: 'var(--vp-code-bg, rgba(0,0,0,0.05))',
    color: 'inherit',
    fontSize: '13px',
    whiteSpace: 'pre-wrap',
    minHeight: '80px',
  };

  return (
    <div data-test-id="menu-showcase" data-theme={isDark ? 'dark' : 'light'} style={layout}>
      <div data-test-id="menu-sidebar" style={sidebar}>
        <MenuFactory
          ref={menuRef}
          schema={simpleMenuSchema as any}
          initialActiveItem={null}
          onSelect={handleSelect}
        />
      </div>

      <section style={panel}>
        <h3 data-test-id="menu-active-item" style={{ margin: 0 }}>
          Active item: <strong>{activeItem ?? 'none'}</strong>
        </h3>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            data-test-id="menu-read-active"
            onClick={handleReadActive}
            style={button}
          >
            Read active (ref)
          </button>
          <button
            type="button"
            data-test-id="menu-clear-active"
            onClick={handleReset}
            style={button}
          >
            Clear selection
          </button>
          <button
            type="button"
            data-test-id="menu-select-settings"
            onClick={handleSelectSettingsViaRef}
            style={button}
          >
            Select "settings" via ref
          </button>
        </div>

        <div>
          <h4 style={{ margin: '8px 0 4px' }}>Last onSelect payload</h4>
          <pre data-test-id="menu-last-payload" style={payloadBox}>
            {lastSelection ? JSON.stringify(lastSelection, null, 2) : 'No selection yet'}
          </pre>
        </div>

        <p style={{ fontSize: '13px', opacity: 0.7, margin: 0 }}>
          This showcase is powered by <code>MenuFactory</code> — a reference
          implementation of a second built-in factory built on top of
          <code> createReactFactory</code>. The schema lives in
          <code> instances/menu/simple-menu.json</code>.
        </p>
      </section>
    </div>
  );
}
