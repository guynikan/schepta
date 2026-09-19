/**
 * React Tabs Factory
 *
 * Renders tabbed content from a JSON schema. The schema lists the tabs as
 * named children of `TabsContainer`, each with `x-component: 'TabPanel'`
 * and `x-component-props.label` for the tab trigger.
 *
 * Active tab state is managed in the factory and shared with the default
 * components via `TabsContext` — the same pattern used by `TableFactory`
 * to bypass the orchestrator's static-subtree cache while keeping dynamic
 * state reactive.
 */

import React, { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { ComponentSpec, MiddlewareFn } from '@schepta/core';
import tabsSchemaDefinition from '@schepta/factories/schemas/tabs-schema.json';
import {
  createReactFactory,
  type FactoryBaseProps,
  type FactorySetupHook,
} from '../create-factory';
import { defaultTabsComponents } from './defaults';
import {
  TabsProvider,
  type TabMeta,
  type TabsContextValue,
  type TabsOrientation,
  type TabsVariant,
} from './context';

export type { TabMeta, TabsOrientation, TabsVariant };

export interface TabsChangePayload {
  key: string;
  label: string;
}

export interface TabsFactoryRef {
  /** Currently active tab key (or null before any activation) */
  getActiveTab: () => string | null;
  /** Programmatically activate a tab by its schema key */
  setActiveTab: (key: string | null) => void;
  /** Ordered list of tabs declared in the schema */
  getTabs: () => TabMeta[];
}

export interface TabsFactoryProps extends FactoryBaseProps {
  components?: Record<string, ComponentSpec>;
  customComponents?: Record<string, ComponentSpec>;
  renderers?: Partial<Record<string, any>>;
  externalContext?: Record<string, any>;
  middlewares?: MiddlewareFn[];
  /** Initially active tab. Falls back to the first enabled tab when omitted. */
  initialActiveTab?: string | null;
  /** Fired when the active tab changes (interaction or ref API). */
  onChange?: (payload: TabsChangePayload) => void;
  debug?: boolean;
}

function extractTabs(schema: any): TabMeta[] {
  const properties = (schema?.properties ?? {}) as Record<string, any>;
  const entries = Object.entries(properties);
  const sortedEntries = entries.sort(([, a], [, b]) => {
    const orderA = (a as any)?.['x-ui']?.order ?? Infinity;
    const orderB = (b as any)?.['x-ui']?.order ?? Infinity;
    return orderA - orderB;
  });

  const tabs: TabMeta[] = [];
  for (const [key, panelSchema] of sortedEntries) {
    if ((panelSchema as any)?.['x-component'] !== 'TabPanel') continue;
    const props = ((panelSchema as any)?.['x-component-props'] ?? {}) as Record<
      string,
      any
    >;
    tabs.push({
      key,
      label: String(props.label ?? key),
      icon: typeof props.icon === 'string' ? props.icon : undefined,
      disabled: props.disabled === true,
      badge:
        typeof props.badge === 'string' || typeof props.badge === 'number'
          ? props.badge
          : undefined,
    });
  }
  return tabs;
}

function pickInitialActive(
  tabs: TabMeta[],
  initial: string | null | undefined
): string | null {
  if (initial && tabs.some((tab) => tab.key === initial && !tab.disabled)) {
    return initial;
  }
  const firstEnabled = tabs.find((tab) => !tab.disabled);
  return firstEnabled ? firstEnabled.key : tabs[0]?.key ?? null;
}

const useTabsSetup: FactorySetupHook<TabsFactoryProps, TabsFactoryRef> = ({
  props,
}) => {
  const {
    schema,
    initialActiveTab,
    onChange,
  } = props;

  const orientation: TabsOrientation =
    (schema?.['x-component-props']?.orientation as TabsOrientation) ??
    'horizontal';
  const variant: TabsVariant =
    (schema?.['x-component-props']?.variant as TabsVariant) ?? 'underline';

  const tabs = useMemo(() => extractTabs(schema), [schema]);

  const [activeKey, setActiveKeyState] = useState<string | null>(() =>
    pickInitialActive(tabs, initialActiveTab ?? null)
  );

  const applyActive = useCallback(
    (nextKey: string | null) => {
      setActiveKeyState(nextKey);
      if (onChange && nextKey) {
        const tab = tabs.find((t) => t.key === nextKey);
        if (tab) onChange({ key: tab.key, label: tab.label });
      }
    },
    [tabs, onChange]
  );

  const setActiveKey = useCallback(
    (nextKey: string) => {
      const tab = tabs.find((t) => t.key === nextKey);
      if (!tab || tab.disabled) return;
      if (activeKey === nextKey) return;
      applyActive(nextKey);
    },
    [tabs, activeKey, applyActive]
  );

  const contextValue = useMemo<TabsContextValue>(
    () => ({
      tabs,
      activeKey,
      orientation,
      variant,
      setActiveKey,
    }),
    [tabs, activeKey, orientation, variant, setActiveKey]
  );

  const wrap = useCallback(
    (children: ReactNode) => (
      <TabsProvider value={contextValue}>{children}</TabsProvider>
    ),
    [contextValue]
  );

  const externalContext = useMemo(
    () => ({
      tabs: {
        active: activeKey,
        orientation,
        variant,
      },
    }),
    [activeKey, orientation, variant]
  );

  const refApi = useMemo<TabsFactoryRef>(
    () => ({
      getActiveTab: () => activeKey,
      setActiveTab: (key: string | null) => {
        if (key === null) {
          applyActive(null);
          return;
        }
        const tab = tabs.find((t) => t.key === key);
        if (!tab || tab.disabled) return;
        applyActive(key);
      },
      getTabs: () => tabs,
    }),
    [activeKey, tabs, applyActive]
  );

  return {
    refApi,
    externalContext,
    wrap,
  };
};

export const TabsFactory = createReactFactory<TabsFactoryProps, TabsFactoryRef>({
  displayName: 'TabsFactory',
  schemaDefinition: tabsSchemaDefinition,
  rootComponentKey: 'TabsContainer',
  defaultComponents: defaultTabsComponents,
  useSetup: useTabsSetup,
});
