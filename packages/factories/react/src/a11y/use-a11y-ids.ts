/**
 * useA11yIds Hook
 *
 * Produces a set of collision-free DOM ids derived from a single React 18
 * `useId()` value.
 *
 * Default components used to derive ids from the field `name` (`id={name}`,
 * `` `${name}-datalist` ``). That breaks as soon as two factory instances
 * render the same schema on one page: every `label[for]` and `aria-*`
 * reference then points at whichever element happens to come first in the
 * document. Deriving from `useId()` keeps the ids stable across renders and
 * unique per component instance.
 */

import { useId, useMemo } from 'react';

export interface A11yIds {
  /** id for the interactive control itself (input, select, ...) */
  controlId: string;
  /** id for the control's visible label */
  labelId: string;
  /** id for the error message, referenced by aria-describedby */
  errorId: string;
  /** id for the hint / description text, referenced by aria-describedby */
  hintId: string;
  /** id for an auxiliary list (e.g. `<datalist>`) */
  listId: string;
}

/**
 * Builds the standard set of a11y ids for a field-like component.
 *
 * @param providedId Optional explicit id (e.g. from `x-component-props.id`).
 *   When given it is used as the control id so authors keep full control.
 */
export function useA11yIds(providedId?: string): A11yIds {
  const generatedId = useId();

  return useMemo(() => {
    const base = providedId ?? generatedId;
    return {
      controlId: base,
      labelId: `${base}-label`,
      errorId: `${base}-error`,
      hintId: `${base}-hint`,
      listId: `${base}-list`,
    };
  }, [providedId, generatedId]);
}

/**
 * Joins `aria-describedby` candidates, dropping the empty ones.
 *
 * Returning `undefined` rather than an empty string matters: an
 * `aria-describedby=""` — or one pointing at an element that is not in the
 * DOM — is itself an accessibility violation, so the attribute has to be
 * omitted entirely when there is nothing to describe.
 */
export function composeDescribedBy(
  ...ids: (string | false | null | undefined)[]
): string | undefined {
  const present = ids.filter((id): id is string => typeof id === 'string' && id.length > 0);
  return present.length > 0 ? present.join(' ') : undefined;
}
