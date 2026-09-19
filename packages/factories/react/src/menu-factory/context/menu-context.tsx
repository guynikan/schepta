import React, { createContext, useContext, type ReactNode } from 'react';

export interface MenuContextValue {
  activeItem: string | null;
}

const MenuContext = createContext<MenuContextValue | null>(null);

export function MenuProvider({
  value,
  children,
}: {
  value: MenuContextValue;
  children: ReactNode;
}) {
  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenuContext(): MenuContextValue {
  const ctx = useContext(MenuContext);
  if (!ctx) {
    throw new Error(
      'useMenuContext must be used inside a MenuProvider. This component is only rendered by MenuFactory.'
    );
  }
  return ctx;
}

export function useOptionalMenuContext(): MenuContextValue | null {
  return useContext(MenuContext);
}
