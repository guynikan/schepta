import React from 'react';
import { useOptionalTabsContext, type TabMeta } from '../context';
import { useA11yIds, useRovingTabIndex } from '../../a11y';

export interface DefaultTabsContainerProps {
  ariaLabel?: string;
  children?: React.ReactNode;
  'data-test-id'?: string;
}

/**
 * Default container for TabsFactory.
 *
 * Renders:
 *  - a <div role="tablist"> populated with one <button role="tab"> per
 *    declared TabPanel (derived from TabsContext, not from `children`);
 *  - the active panel's children below the tab list. The active panel is
 *    rendered via `children` — the factory passes the already-composed
 *    element for every TabPanel, and we show only the active one.
 *
 * The tab triggers themselves are rendered here (not via a separate Tab
 * component) so that the container can compose them without requiring the
 * user to author them in the schema. Panels are userland / schema-driven.
 *
 * Keyboard support follows the ARIA Tabs pattern: the tab list is a single
 * tab stop and the arrow keys move between tabs (Home / End jump to the
 * ends), skipping disabled ones. Activation follows focus, which is the
 * recommended behaviour when panels are cheap to render.
 */
export function DefaultTabsContainer({
  ariaLabel,
  children,
  'data-test-id': dataTestId,
}: DefaultTabsContainerProps) {
  const ctx = useOptionalTabsContext();
  const ids = useA11yIds();

  // Hooks must run unconditionally, so derive safe defaults when the context
  // is missing and bail out on render below.
  const tabs = ctx?.tabs ?? [];
  const activeKey = ctx?.activeKey ?? null;
  const orientation = ctx?.orientation ?? 'horizontal';
  const variant = ctx?.variant ?? 'underline';
  const setActiveKey = ctx?.setActiveKey;

  const activeIndex = tabs.findIndex((tab) => tab.key === activeKey);

  const { getTabIndex, registerItem, onKeyDown, onItemFocus } = useRovingTabIndex({
    itemCount: tabs.length,
    orientation: orientation === 'vertical' ? 'vertical' : 'horizontal',
    activeIndex: activeIndex >= 0 ? activeIndex : 0,
    isDisabled: (index) => tabs[index]?.disabled === true,
    onNavigate: (index) => {
      const tab = tabs[index];
      if (tab && !tab.disabled) setActiveKey?.(tab.key);
    },
  });

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
        DefaultTabsContainer must be rendered by TabsFactory (missing TabsContext).
      </div>
    );
  }

  const isVertical = orientation === 'vertical';
  const tabId = (key: string) => `${ids.controlId}-tab-${key}`;

  const rootStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: isVertical ? 'row' : 'column',
    gap: '12px',
    color: 'var(--schepta-text-1)',
  };

  const listStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: isVertical ? 'column' : 'row',
    gap: variant === 'pills' ? '6px' : '0',
    borderBottom:
      !isVertical && variant === 'underline'
        ? '1px solid var(--schepta-border)'
        : undefined,
    borderRight:
      isVertical && variant === 'underline'
        ? '1px solid var(--schepta-border)'
        : undefined,
    flex: isVertical ? '0 0 200px' : undefined,
  };

  const panelStyle: React.CSSProperties = {
    flex: '1 1 auto',
    minWidth: 0,
    minHeight: 0,
    padding: '12px 0',
  };

  return (
    <div
      data-schepta-tabs="true"
      data-orientation={orientation}
      data-variant={variant}
      data-test-id={dataTestId}
      style={rootStyle}
    >
      <div
        role="tablist"
        aria-label={ariaLabel || 'Tabs'}
        aria-orientation={orientation}
        data-test-id="tabs-list"
        onKeyDown={onKeyDown}
        style={listStyle}
      >
        {tabs.map((tab, index) => (
          <TabTrigger
            key={tab.key}
            ref={registerItem(index)}
            tab={tab}
            id={tabId(tab.key)}
            panelId={ids.listId}
            isActive={activeKey === tab.key}
            tabIndex={getTabIndex(index)}
            variant={variant}
            orientation={orientation}
            onFocus={() => onItemFocus(index)}
            onActivate={() => setActiveKey?.(tab.key)}
          />
        ))}
      </div>

      {/*
        A single panel wrapper with a stable id, rather than one element per
        tab: DefaultTabPanel renders null for every inactive tab, so per-tab
        ids would leave the inactive triggers' aria-controls pointing at
        elements that are not in the document.

        tabIndex={0} makes the panel focusable so that tabbing out of the tab
        list lands on the content it controls, per the ARIA Tabs pattern.
      */}
      <div
        role="tabpanel"
        id={ids.listId}
        tabIndex={0}
        data-test-id="tabs-panel"
        data-active-tab={activeKey || undefined}
        aria-labelledby={activeKey ? tabId(activeKey) : undefined}
        style={panelStyle}
      >
        {children}
      </div>
    </div>
  );
}

interface TabTriggerProps {
  tab: TabMeta;
  id: string;
  panelId: string;
  isActive: boolean;
  tabIndex: 0 | -1;
  variant: 'underline' | 'pills' | 'boxed';
  orientation: 'horizontal' | 'vertical';
  onFocus: () => void;
  onActivate: () => void;
}

const TabTrigger = React.forwardRef<HTMLButtonElement, TabTriggerProps>(
  function TabTrigger(
    { tab, id, panelId, isActive, tabIndex, variant, orientation, onFocus, onActivate },
    ref
  ) {
    const baseStyle: React.CSSProperties = {
      padding: '8px 14px',
      border: 'none',
      background: 'transparent',
      color: tab.disabled
        ? 'var(--schepta-text-3)'
        : isActive
          ? 'var(--schepta-accent, #3b82f6)'
          : 'var(--schepta-text-1)',
      cursor: tab.disabled ? 'not-allowed' : 'pointer',
      font: 'inherit',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      borderRadius:
        variant === 'pills' ? '9999px' : variant === 'boxed' ? '6px 6px 0 0' : 0,
    };

    const variantStyle: React.CSSProperties =
      variant === 'underline'
        ? {
            borderBottom:
              orientation === 'horizontal'
                ? isActive
                  ? '2px solid var(--schepta-accent, #3b82f6)'
                  : '2px solid transparent'
                : undefined,
            borderRight:
              orientation === 'vertical'
                ? isActive
                  ? '2px solid var(--schepta-accent, #3b82f6)'
                  : '2px solid transparent'
                : undefined,
            marginBottom: orientation === 'horizontal' ? '-1px' : undefined,
            marginRight: orientation === 'vertical' ? '-1px' : undefined,
          }
        : variant === 'pills'
          ? {
              background: isActive
                ? 'var(--schepta-bg-selected, rgba(59,130,246,0.12))'
                : 'transparent',
            }
          : {
              border: '1px solid var(--schepta-border)',
              borderBottom: isActive ? 'none' : '1px solid var(--schepta-border)',
              background: isActive
                ? 'var(--schepta-bg)'
                : 'var(--schepta-bg-subtle, transparent)',
            };

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        id={id}
        aria-selected={isActive}
        aria-controls={panelId}
        aria-disabled={tab.disabled || undefined}
        // `disabled` would remove the tab from the accessibility tree, so a
        // screen reader user could not tell it exists. aria-disabled keeps it
        // discoverable and announced as unavailable; the click handler and the
        // roving navigation both skip it.
        tabIndex={tab.disabled ? -1 : tabIndex}
        data-test-id={`tab-${tab.key}`}
        data-active={isActive || undefined}
        onFocus={onFocus}
        onClick={tab.disabled ? undefined : onActivate}
        style={{ ...baseStyle, ...variantStyle }}
      >
        {tab.icon ? (
          <span aria-hidden="true" style={{ fontSize: '14px' }}>
            {tab.icon}
          </span>
        ) : null}
        <span>{tab.label}</span>
        {tab.badge !== undefined && tab.badge !== null && tab.badge !== '' ? (
          <span
            data-test-id={`tab-${tab.key}-badge`}
            style={{
              padding: '1px 6px',
              borderRadius: '9999px',
              fontSize: '11px',
              background: 'var(--schepta-bg-subtle, rgba(0,0,0,0.08))',
              color: 'var(--schepta-text-2)',
            }}
          >
            {tab.badge}
          </span>
        ) : null}
      </button>
    );
  }
);
