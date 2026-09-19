import React, { createContext, useContext, type ReactNode } from 'react';

export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsVariant = 'underline' | 'pills' | 'boxed';

export interface TabMeta {
  /** Schema property key (stable identifier) */
  key: string;
  /** Display label */
  label: string;
  /** Optional icon */
  icon?: string;
  /** Disabled flag */
  disabled?: boolean;
  /** Optional badge value */
  badge?: string | number;
}

export interface TabsContextValue {
  tabs: TabMeta[];
  activeKey: string | null;
  orientation: TabsOrientation;
  variant: TabsVariant;
  setActiveKey: (key: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export function TabsProvider({
  value,
  children,
}: {
  value: TabsContextValue;
  children: ReactNode;
}) {
  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
}

export function useTabsContext(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error(
      'useTabsContext must be used inside a TabsProvider. This component is only rendered by TabsFactory.'
    );
  }
  return ctx;
}

export function useOptionalTabsContext(): TabsContextValue | null {
  return useContext(TabsContext);
}
