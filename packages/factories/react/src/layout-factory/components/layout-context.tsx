/**
 * Layout Context
 *
 * Tells the layout's slot components whether this shell is the page root, so
 * they can decide between real landmark roles and plain sectioning elements.
 */

import React, { createContext, useContext } from 'react';

/**
 * Target of the skip link. Fixed rather than generated because it is also a
 * URL fragment: a stable `#main-content` survives a page reload and can be
 * linked to from outside the app.
 */
export const MAIN_CONTENT_ID = 'main-content';

export interface LayoutContextValue {
  /** Whether the layout is the page's top-level shell */
  isPageRoot: boolean;
}

const LayoutContext = createContext<LayoutContextValue>({ isPageRoot: false });

export const LayoutProvider: React.FC<{
  value: LayoutContextValue;
  children: React.ReactNode;
}> = ({ value, children }) => (
  <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
);

export function useLayoutContext(): LayoutContextValue {
  return useContext(LayoutContext);
}
