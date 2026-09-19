import React from 'react';
import { useOptionalTabsContext } from '../context';

export interface DefaultTabPanelProps {
  /**
   * The panel component receives props for its own tab metadata. These come
   * straight from the schema via `x-component-props`. The panel uses them
   * only to match itself against the active tab in context.
   */
  label?: string;
  /** Plain text content (from `x-content`) */
  'x-content'?: string;
  children?: React.ReactNode;
  'data-test-id'?: string;
}

/**
 * Default panel body renderer.
 *
 * Only the currently-active panel is rendered in the DOM — the container
 * checks `TabsContext.activeKey` before composing each panel, but since
 * the factory renders all panels as part of the subtree cache, we render
 * only the active one here to avoid leaking content of inactive tabs.
 */
export function DefaultTabPanel({
  children,
  'x-content': xContent,
  'data-test-id': dataTestId,
}: DefaultTabPanelProps) {
  const ctx = useOptionalTabsContext();
  const panelKey = dataTestId ?? '';

  if (!ctx || ctx.activeKey !== panelKey) {
    return null;
  }

  const style: React.CSSProperties = {
    padding: '4px 0',
    color: 'inherit',
    minHeight: '40px',
  };

  return (
    <div
      data-schepta-tab-panel="true"
      data-panel-key={panelKey}
      data-test-id={`panel-${panelKey}`}
      style={style}
    >
      {xContent ? <p style={{ margin: 0 }}>{xContent}</p> : null}
      {children}
    </div>
  );
}
