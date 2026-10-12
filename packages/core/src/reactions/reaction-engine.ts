/**
 * Reaction Engine
 * 
 * Executes reactions (declarative via JEXL and imperative) based on form state changes.
 */

import type { RuntimeReactionContext, DefaultReaction } from './types';
import { getAllReactions } from './types';
import { Jexl } from '../utils/jexl-config';
import { createExpressionDiagnostics } from '../expressions/diagnostics';

/**
 * Clean JEXL expression - removes template syntax if needed
 */
function cleanJexlExpression(expression: string): string {
  // Accept raw JEXL plus both interpolation syntaxes used by schemas.
  return expression.trim().replace(/^\$\{|\}$|^\{\{\s*|\s*\}\}$/g, '');
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
  const diagnostics = context.expressionDiagnostics || createExpressionDiagnostics(context.expressions, context.debug);

  for (const [prop, rawExpression] of Object.entries(reactions)) {
    if (typeof rawExpression === 'string') {
      const cleanExpression = cleanJexlExpression(rawExpression);
      
      try {
        const value = Jexl.evalSync(cleanExpression, jexlContext);
        if (value === undefined) {
          diagnostics.report({
            code: 'EXPRESSION_EVALUATION_ERROR',
            expression: cleanExpression,
            path: `${context.fieldKey}.x-reactions.${prop}`,
          });
          continue;
        }
        dynamicProps[prop] = value;
        context.setFieldProps(context.fieldKey, dynamicProps);

        if (context.debug?.isEnabled) {
          context.debug.log('reaction', 'Declarative reaction executed', {
            type: 'declarative',
            expression: cleanExpression,
            context: { prop, formValues, schema },
            result: value,
          });
        }
      } catch (err) {
        diagnostics.report({
          code: 'EXPRESSION_EVALUATION_ERROR',
          expression: cleanExpression,
          path: `${context.fieldKey}.x-reactions.${prop}`,
          cause: err,
        });
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

