/**
 * Form Section Context
 *
 * Carries the generated id from a `FormSectionContainer` down to its
 * `FormSectionTitle`, so the section can name itself via `aria-labelledby`.
 *
 * The two components are never rendered as direct siblings in JSX — the
 * orchestrator composes them from the schema tree — so a context is the only
 * way to share the id without inventing a name-derived one that would collide
 * between factory instances.
 */

import React, { createContext, useContext } from 'react';

export interface FormSectionContextValue {
  /** id the section's heading must carry */
  titleId: string;
}

const FormSectionContext = createContext<FormSectionContextValue | null>(null);

export const FormSectionProvider: React.FC<{
  value: FormSectionContextValue;
  children: React.ReactNode;
}> = ({ value, children }) => (
  <FormSectionContext.Provider value={value}>{children}</FormSectionContext.Provider>
);

/**
 * @returns The section context, or null when the title is rendered outside a
 *   `FormSectionContainer`.
 */
export function useOptionalFormSectionContext(): FormSectionContextValue | null {
  return useContext(FormSectionContext);
}
