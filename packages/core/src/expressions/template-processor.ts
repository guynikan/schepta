/**
 * Template Processor
 * 
 * Framework-agnostic processing of template expressions
 * Recursively processes values (strings, objects, arrays) and replaces templates
 * Uses JEXL for complex expressions with operators (===, !==, &&, ||, etc.)
 */

import { detectTemplateExpressions, hasTemplateExpressions } from './template-detector';
import type { VariableResolver, ResolverContext } from './variable-resolver';
import { UNSAFE_PATH_SEGMENTS } from './variable-resolver';
import {
  allReferencesResolve,
  analyzeExpression,
  getCallHint,
  getEmptyIndexProblems,
  getMissingPathProblem,
  getReferenceProblem,
  isEmptyIndexFailure,
  type AnalyzedExpression,
  type ReferenceProblem,
} from './expression-analysis';

/**
 * Check if an expression contains operators (is a complex expression)
 * Complex expressions need JEXL evaluation instead of simple variable resolution
 *
 * This is the historical classification and decides which path produces the
 * value. Do not widen it: expressions it does not match go to the resolver
 * first, which is what keeps keys such as `api-url` or `a/b` resolving.
 * 
 * @param expr Expression to check
 * @returns true if expression contains operators
 */
function isComplexExpression(expr: string): boolean {
  // Contains comparison or logical operators
  return /===|!==|==|!=|>=|<=|>|<|&&|\|\|/.test(expr);
}

/** `$root.key.key` with no whitespace: the shape the resolver reads as a path. */
const PATH_LIKE = /^(\$[\w$]*)((?:\.[^\s.]+)*)$/;

/** Characters that make a path segment read as an expression rather than a key. */
const NOT_A_KEY = /[()[\]{}!=<>&|?:,'"`*/+%^~;\\]/;

type Report = (
  problem: ReferenceProblem | { code: 'EXPRESSION_EVALUATION_ERROR'; cause: unknown; hint?: string },
) => void;

function reportEvaluationError(
  expression: string,
  analysis: AnalyzedExpression,
  context: ResolverContext,
  report: Report,
  cause: unknown,
): void {
  if (context.diagnostics) {
    report({ code: 'EXPRESSION_EVALUATION_ERROR', cause, hint: getCallHint(analysis) });
  } else {
    console.warn(`Error evaluating expression "${expression}":`, cause);
  }
}

/** A syntax error, unless the text walks a forbidden segment JEXL cannot tokenize. */
function reportUnparsable(expression: string, analysis: AnalyzedExpression, context: ResolverContext, report: Report): void {
  if (analysis.forbiddenPath && context.diagnostics) {
    report({ code: 'EXPRESSION_PATH_NOT_FOUND', missingPath: analysis.forbiddenPath, strict: true });
  } else {
    reportEvaluationError(expression, analysis, context, report, analysis.error);
  }
}

/**
 * Evaluate a parsed expression with JEXL and report what its references say.
 * The value is computed first and is never replaced because of a diagnostic;
 * the only exception is an expression that walks a forbidden segment.
 */
function evaluateParsed(
  expression: string,
  analysis: AnalyzedExpression,
  context: ResolverContext,
  resolver: VariableResolver,
  report: Report,
  evaluate = true,
): any {
  if (analysis.forbiddenPath) {
    report({ code: 'EXPRESSION_PATH_NOT_FOUND', missingPath: analysis.forbiddenPath, strict: true });
    return undefined;
  }

  let value: any;
  let failure: { cause: unknown } | undefined;
  if (evaluate) {
    try {
      value = analysis.compiled.evalSync({
        $formValues: context.formValues,
        $externalContext: context.externalContext,
      });
    } catch (cause) {
      failure = { cause };
    }
  }

  // JEXL throws when it indexes an empty value (`items[0]` with no `items`).
  // That is a missing reference, reported below, not a broken expression.
  const emptyIndex = failure !== undefined && isEmptyIndexFailure(analysis, failure.cause);
  if (failure && !emptyIndex) {
    reportEvaluationError(expression, analysis, context, report, failure.cause);
  }
  if (context.diagnostics) {
    const problems = analysis.references
      .map(reference => getReferenceProblem(reference, context, resolver.handles))
      .filter((problem): problem is ReferenceProblem => problem !== undefined);
    if (emptyIndex && problems.length === 0) problems.push(...getEmptyIndexProblems(analysis));
    problems.forEach(report);
  }
  return value;
}

/**
 * Resolve one expression.
 *
 * The value comes from the same path as before diagnostics existed: JEXL for
 * expressions with comparison/logical operators, the resolver for everything
 * else. Analysis runs afterwards and only decides what to report. Expressions
 * the resolver cannot read (`price * 2`, `!flag`, `a ? b : c`, `items[0].name`)
 * used to resolve to undefined and are now evaluated with JEXL.
 * 
 * @param expression Expression to evaluate
 * @param context Resolver context with formValues and externalContext
 * @returns Evaluated result (boolean, number, string, etc.)
 */
function evaluateExpression(expression: string, context: ResolverContext, resolver: VariableResolver): any {
  const report: Report = problem => context.diagnostics?.report({
    ...problem,
    expression,
    path: context.expressionPath || '<unknown>',
  });

  if (isComplexExpression(expression)) {
    const analysis = analyzeExpression(expression);
    if (analysis.error) {
      reportUnparsable(expression, analysis, context, report);
      return undefined;
    }
    return evaluateParsed(expression, analysis, context, resolver, report);
  }

  const resolved = resolver(expression);
  if (resolved !== undefined || resolver.handles?.(expression)) {
    return resolved;
  }

  const analysis = analyzeExpression(expression);
  const pathLike = PATH_LIKE.exec(expression);
  if (!pathLike) {
    if (analysis.error) {
      reportUnparsable(expression, analysis, context, report);
      return undefined;
    }
    return evaluateParsed(expression, analysis, context, resolver, report);
  }

  // The resolver read this as a path and found nothing.
  const root = pathLike[1];
  const path = pathLike[2] ? pathLike[2].substring(1).split('.') : [];
  if (root !== '$formValues' && root !== '$externalContext') {
    report({ code: 'UNKNOWN_EXPRESSION_VARIABLE', strict: true });
    return undefined;
  }
  if (path.some(part => UNSAFE_PATH_SEGMENTS.has(part))) {
    report({ code: 'EXPRESSION_PATH_NOT_FOUND', missingPath: expression, strict: true });
    return undefined;
  }

  // A field declared under exactly this name is an empty field, whatever its name looks like.
  const isDeclaredField = root === '$formValues' && Boolean(context.declaredFormPaths?.has(path.join('.')));
  // Text JEXL cannot parse is still a key (`名前`, `2fa`) unless it is written like an expression.
  const isPlainPath = analysis.error !== undefined
    ? isDeclaredField || !path.some(part => NOT_A_KEY.test(part))
    : analysis.chainText === expression && !analysis.isIndexedAccess;
  if (isPlainPath) {
    const problem = getMissingPathProblem(root, path, context);
    if (problem) report(problem);
    return undefined;
  }
  if (analysis.error !== undefined) {
    // `$formValues.email.!!!`, `$formValues.name.trim(`: not a key, not JEXL.
    reportEvaluationError(expression, analysis, context, report, analysis.error);
    return undefined;
  }
  // Not a plain path after all (`items[0].name`, `price*2`, `name.trim()`). A
  // declared field whose name contains operator characters stays a quiet, empty
  // field; a call is never a field below a declared one.
  if (isDeclaredField || (!analysis.hasCall && root === '$formValues' && !getMissingPathProblem(root, path, context))) {
    return undefined;
  }
  // Keep the value only when that cannot turn a missing key into NaN or a wrong
  // value. A call is still run, so that the error JEXL raises for it is reported.
  const resolves = allReferencesResolve(analysis, context);
  const value = evaluateParsed(expression, analysis, context, resolver, report, resolves || analysis.hasCall);
  return resolves ? value : undefined;
}

/**
 * Process a single template expression in a string
 * Replaces all {{ }} expressions with resolved values
 * Uses JEXL for complex expressions with operators
 * 
 * @param str String containing template expressions
 * @param resolver Variable resolver function
 * @param context Resolver context (required for JEXL evaluation)
 * @returns Processed value - preserves type for single expressions (boolean, number), string for interpolated
 * 
 * @example Simple variable
 * processTemplateString("Hello {{ $externalContext.user.name }}", resolver, context)
 * // Returns: "Hello John"
 * 
 * @example Boolean expression (returns boolean, not string)
 * processTemplateString("{{ $formValues.status === 'active' }}", resolver, context)
 * // Returns: true (boolean)
 */
export function processTemplateString(
  str: string,
  resolver: VariableResolver,
  context: ResolverContext
): any {
  if (typeof str !== 'string') {
    return str;
  }

  // Find all template expressions
  const expressions = detectTemplateExpressions(str);
  
  if (expressions.length === 0) {
    return str;
  }

  // Check if string is EXACTLY a single template (no surrounding text)
  // This allows preserving the type (boolean, number) instead of converting to string
  const singleTemplateMatch = str.match(/^\{\{\s*([^}]+)\s*\}\}$/);
  if (singleTemplateMatch) {
    const expr = singleTemplateMatch[1].trim();

    return evaluateExpression(expr, context, resolver);
  }

  // Multiple templates or text around them: concatenate as string
  let result = str;

  for (const expression of expressions) {
    const template = `{{ ${expression} }}`;
    const resolved = evaluateExpression(expression, context, resolver);


    // Convert to string for concatenation
    const replacement = resolved !== undefined && resolved !== null 
      ? String(resolved) 
      : '';
    
    result = result.replace(template, replacement);
  }

  return result;
}

/**
 * Process a single template expression (returns the resolved value directly)
 * 
 * @param expression Template expression (e.g., "$externalContext.user.name")
 * @param resolver Variable resolver function
 * @param context Resolver context
 * @returns Resolved value
 * 
 * @example
 * processTemplateExpression("$externalContext.user.name", resolver, context)
 * // Returns: "John"
 */
export function processTemplateExpression(
  expression: string,
  resolver: VariableResolver,
): any {
  return resolver(expression);
}

/**
 * Process a value recursively, replacing all template expressions
 * Handles strings, objects, arrays, and nested structures
 * Uses JEXL for complex expressions with operators
 * 
 * @param value Value to process (can be any type)
 * @param resolver Variable resolver function
 * @param context Resolver context (required for JEXL evaluation)
 * @returns Processed value with templates replaced
 * 
 * @example
 * processValue({
 *   label: "{{ $externalContext.user.name }}",
 *   nested: {
 *     placeholder: "Enter {{ $formValues.email }}"
 *   },
 *   disabled: "{{ $formValues.status === 'inactive' }}"
 * }, resolver, context)
 * // Returns: {
 * //   label: "John",
 * //   nested: {
 * //     placeholder: "Enter john@example.com"
 * //   },
 * //   disabled: true (boolean, not string)
 * // }
 */
export function processValue(
  value: any,
  resolver: VariableResolver,
  context: ResolverContext,
  path = ''
): any {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return processTemplateString(value, resolver, { ...context, expressionPath: path || context.expressionPath });
  }

  // Short-circuit: if value contains no {{ }} templates, return as-is
  if (!hasTemplateExpressions(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item, index) => processValue(item, resolver, context, `${path}[${index}]`));
  }

  if (typeof value === 'object') {
    const processed: Record<string, any> = {};
    
    for (const [key, val] of Object.entries(value)) {
      processed[key] = processValue(val, resolver, context, path ? `${path}.${key}` : key);
    }
    
    return processed;
  }

  return value;
}

/**
 * Check if processing is needed (optimization)
 * 
 * @param value Value to check
 * @returns true if value contains templates that need processing
 */
export function needsProcessing(value: any): boolean {
  return hasTemplateExpressions(value);
}

