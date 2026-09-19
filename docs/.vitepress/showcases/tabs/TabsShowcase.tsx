import React, { useMemo, useRef, useState } from 'react';
import {
  TabsFactory,
  type TabsChangePayload,
  type TabsFactoryRef,
} from '@schepta/factory-react';
import simpleTabsSchema from '../../../../instances/tabs/simple-tabs.json';

interface TabsShowcaseProps {
  isDark?: boolean;
}

export function TabsShowcase({ isDark = false }: TabsShowcaseProps) {
  const tabsRef = useRef<TabsFactoryRef>(null);
  const [lastChange, setLastChange] = useState<TabsChangePayload | null>(null);
  const [tabsSnapshot, setTabsSnapshot] = useState<string[] | null>(null);

  const handleChange = (payload: TabsChangePayload) => {
    setLastChange(payload);
  };

  const handleGoToBilling = () => {
    tabsRef.current?.setActiveTab('billing');
  };

  const handleGoToOverview = () => {
    tabsRef.current?.setActiveTab('overview');
  };

  const handleClearSelection = () => {
    tabsRef.current?.setActiveTab(null);
  };

  const handleSnapshotTabs = () => {
    const tabs = tabsRef.current?.getTabs() ?? [];
    setTabsSnapshot(tabs.map((tab) => tab.key));
  };

  const layout: React.CSSProperties = useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '16px',
      padding: '24px',
      border: '1px solid var(--schepta-border, #cccccc)',
      borderRadius: '8px',
      background: 'var(--schepta-bg, transparent)',
      color: 'var(--schepta-text-1, inherit)',
    }),
    []
  );

  const panel: React.CSSProperties = useMemo(
    () => ({ display: 'flex', flexDirection: 'column', gap: '12px' }),
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
    <div data-test-id="tabs-showcase" data-theme={isDark ? 'dark' : 'light'} style={layout}>
      <TabsFactory
        ref={tabsRef}
        schema={simpleTabsSchema as any}
        onChange={handleChange}
      />

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          type="button"
          data-test-id="tabs-goto-overview"
          onClick={handleGoToOverview}
          style={button}
        >
          Go to Overview (ref)
        </button>
        <button
          type="button"
          data-test-id="tabs-goto-billing"
          onClick={handleGoToBilling}
          style={button}
        >
          Go to Billing (ref)
        </button>
        <button
          type="button"
          data-test-id="tabs-clear"
          onClick={handleClearSelection}
          style={button}
        >
          Clear active tab (ref)
        </button>
        <button
          type="button"
          data-test-id="tabs-snapshot"
          onClick={handleSnapshotTabs}
          style={button}
        >
          Snapshot tabs (ref)
        </button>
      </div>

      <section style={panel}>
        <div>
          <h4 style={{ margin: '0 0 4px' }}>Last onChange</h4>
          <pre data-test-id="tabs-last-change" style={box}>
            {lastChange ? JSON.stringify(lastChange) : 'No change yet'}
          </pre>
        </div>
        <div>
          <h4 style={{ margin: '0 0 4px' }}>Tabs snapshot (ref)</h4>
          <pre data-test-id="tabs-snapshot-out" style={box}>
            {tabsSnapshot ? JSON.stringify(tabsSnapshot) : 'No snapshot yet'}
          </pre>
        </div>
        <p style={{ fontSize: '13px', opacity: 0.7, margin: 0 }}>
          This showcase is powered by <code>TabsFactory</code> — a built-in
          Schepta factory built with <code>createReactFactory</code>. The schema
          lives in <code>instances/tabs/simple-tabs.json</code> and is rendered
          entirely from JSON, with active-tab state and the imperative ref API
          managed by the factory.
        </p>
      </section>
    </div>
  );
}
