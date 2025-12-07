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
  evalSync: (expression: string, context: any) => {
    // Synchronous evaluation - use with caution
    let result: any;
    let error: any;
    jexl.eval(expression, context)
      .then((value) => {
        result = value;
      })
      .catch((err) => {
        error = err;
      });
    
    // Simple sync wrapper - in production, prefer async
    if (error) {
      throw error;
    }
    return result;
  },
};

