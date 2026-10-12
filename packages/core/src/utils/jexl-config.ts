/**
 * JEXL Configuration
 * 
 * Shared JEXL instance with custom configuration.
 */

import jexl from 'jexl';

/**
 * Configured JEXL instance
 */
export const Jexl = {
  eval: jexl.eval.bind(jexl),
  evalSync: jexl.evalSync.bind(jexl),
};

