/**
 * Reaction Engine
 * 
 * Executes reactions (declarative via JEXL and imperative) based on form state changes.
 */

import type { RuntimeReactionContext, DefaultReaction } from './types';
import { getAllReactions } from './types';
import { createExpressionDiagnostics, type ExpressionDiagnostics } from '../expressions/diagnostics';
import {
  analyzeExpression,
  getCallHint,
  findEmptyIndex,
  getReferenceProblem,
} from '../expressions/expression-analysis';

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
 * Reactions run many times per form. Without a sink supplied by the caller,
 * keep one per form adapter so the same problem is reported once per form.
 */
const fallbackDiagnostics = new WeakMap<object, ExpressionDiagnostics>();

function getDiagnostics(context: RuntimeReactionContext): ExpressionDiagnostics {
  if (context.expressionDiagnostics) return context.expressionDiagnostics;
  const owner: object | undefined = context.formAdapter;
  let diagnostics = owner && fallbackDiagnostics.get(owner);
  if (!diagnostics) {
    diagnostics = createExpressionDiagnostics(context.expressions, context.debug);
    if (owner) fallbackDiagnostics.set(owner, diagnostics);
  }
  return diagnostics;
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
  const diagnostics = getDiagnostics(context);
  const analysisContext = {
    formValues,
    externalContext: {},
    declaredFormPaths: context.declaredFormPaths,
  };

  for (const [prop, rawExpression] of Object.entries(reactions)) {
    if (typeof rawExpression === 'string') {
      const cleanExpression = cleanJexlExpression(rawExpression);
      const path = `${context.fieldKey}.x-reactions.${prop}`;
      const analysis = analyzeExpression(cleanExpression);
      const hint = getCallHint(analysis);
      if (analysis.error) {
        diagnostics.report(analysis.forbiddenPath
          ? { code: 'EXPRESSION_PATH_NOT_FOUND', expression: cleanExpression, path, missingPath: analysis.forbiddenPath }
          : { code: 'EXPRESSION_EVALUATION_ERROR', expression: cleanExpression, path, cause: analysis.error, hint });
        continue;
      }

      let value: any;
      let failure: { cause: unknown } | undefined;
      if (!analysis.forbiddenPath) {
        try {
          value = analysis.compiled.evalSync(jexlContext);
        } catch (cause) {
          failure = { cause };
        }
      }
      if (!failure) {
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
      }

      // Diagnostics come after the prop update so they never change it.
      // Declarative reactions expose form values as $form; it is their only root.
      const references = analysis.references.map(reference => ({
        ...reference,
        root: reference.root === '$form' ? '$formValues' : `reaction:${reference.root}`,
      }));
      // JEXL throws when it indexes an empty value; that is a missing reference, reported below.
      // Anything else that throws is an evaluation error.
      if (failure && !findEmptyIndex(analysis, jexlContext)) {
        diagnostics.report({ code: 'EXPRESSION_EVALUATION_ERROR', expression: cleanExpression, path, cause: failure.cause, hint });
      }
      if (analysis.forbiddenPath) {
        diagnostics.report({ code: 'EXPRESSION_PATH_NOT_FOUND', expression: cleanExpression, path, missingPath: analysis.forbiddenPath });
      }
      for (const reference of references) {
        const problem = getReferenceProblem(reference, analysisContext);
        if (!problem) continue;
        diagnostics.report({
          ...problem,
          ...(problem.missingPath ? { missingPath: problem.missingPath.replace(/^\$formValues/, '$form') } : {}),
          // Without declared paths an empty field cannot be told from a typo, so only warn.
          strict: problem.code === 'UNKNOWN_EXPRESSION_VARIABLE' || Boolean(context.declaredFormPaths),
          expression: cleanExpression,
          path,
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

