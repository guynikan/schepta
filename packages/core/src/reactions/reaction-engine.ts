/**
 * Reaction Engine
 * 
 * Executes reactions (declarative via JEXL and imperative) based on form state changes.
 */

import jexl from 'jexl';
import type { RuntimeReactionContext, DefaultReaction } from './types';
import { getAllReactions } from './types';

/**
 * Clean JEXL expression - removes template syntax if needed
 */
function cleanJexlExpression(expression: string): string {
  // Remove any template syntax that might interfere
  return expression.trim().replace(/^\$\{|\}$/g, '');
}

/**
 * Execute default (imperative) reactions
 */
export function runDefaultReactions(context: RuntimeReactionContext): void {
  const reactions = getAllReactions();
  
  for (const [, reaction] of reactions) {
    try {
      reaction(context);
    } catch (error) {
      if (context.debug?.isEnabled) {
        context.debug.log('reaction', `Error in default reaction: ${error}`, { error, context });
      }
      console.warn('Reaction error:', error);
    }
  }
}

/**
 * Execute declarative reactions from schema
 */
export function executeDeclarativeReactions(
  schema: any,
  context: RuntimeReactionContext
): void {
  const reactions = schema['x-reactions'];
  
  if (!reactions || typeof reactions !== 'object') {
    return;
  }

  const formValues = context.formAdapter.getValues();
  const jexlContext = { $form: formValues };
  const dynamicProps: Record<string, any> = {};

  for (const [prop, rawExpression] of Object.entries(reactions)) {
    if (typeof rawExpression === 'string') {
      const cleanExpression = cleanJexlExpression(rawExpression);
      
      try {
        jexl.eval(cleanExpression, jexlContext).then((value) => {
          dynamicProps[prop] = value;
          context.setFieldProps(context.fieldKey, dynamicProps);
          
          if (context.debug?.isEnabled) {
            context.debug.log('reaction', 'Declarative reaction executed', {
              type: 'declarative',
              expression: cleanExpression,
              context: {
                prop,
                formValues,
                schema,
              },
              result: value,
            });
          }
        }).catch((err) => {
          console.warn(`Error evaluating reaction '${cleanExpression}' for '${prop}'`, err);
        });
      } catch (err) {
        console.warn(`Error evaluating reaction '${cleanExpression}' for '${prop}'`, err);
      }
    }
  }
}

/**
 * Execute all reactions for a field
 */
export function executeReactions(context: RuntimeReactionContext): void {
  // Run imperative reactions
  runDefaultReactions(context);
  
  // Run declarative reactions
  executeDeclarativeReactions(context.schema, context);
}

