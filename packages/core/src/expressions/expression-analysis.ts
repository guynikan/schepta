/**
 * Expression Analysis
 *
 * Static analysis of JEXL expressions for diagnostics. Nothing in this module
 * decides what an expression evaluates to, with one exception: an expression
 * that walks a forbidden segment is flagged so callers can refuse to run it.
 */

import { Jexl } from '../utils/jexl-config';
import { UNSAFE_PATH_SEGMENTS, type ResolverContext } from './variable-resolver';

export interface ExpressionReference {
  /** First identifier of the access chain, e.g. `$formValues`. */
  root: string;
  /** Statically known keys read from the root, in order. */
  path: string[];
  /** The chain continues through an array index or filter after `path`. */
  indexed: boolean;
  /** A missing value is expected here, so it is not worth reporting. */
  guarded: boolean;
}

export interface AnalyzedExpression {
  compiled?: any;
  error?: unknown;
  references: ExpressionReference[];
  /** Source text of the first access chain that walks a forbidden segment. */
  forbiddenPath?: string;
  /** Set when the whole expression is one access chain (`a.b`, `a['b'][0].c`): its dotted form. */
  chainText?: string;
  /** The whole expression is an access chain that uses an index or filter. */
  isIndexedAccess: boolean;
  /** Names of the functions the expression calls, as in `value.trim()` or `min(a, b)`. */
  functionCalls: string[];
  /** The expression calls a function or pipes a value through a transform. */
  hasCall: boolean;
}

/** An index JEXL could not read because the value it was written on is null or undefined. */
export interface EmptyIndex {
  /** First identifier of the empty value, when it is an access chain. */
  root?: string;
  /** Source text of the empty value (`$externalContext.list[0].tags`), when it is an access chain. */
  text?: string;
}

export interface ReferenceProblem {
  code: 'UNKNOWN_EXPRESSION_VARIABLE' | 'EXPRESSION_PATH_NOT_FOUND';
  missingPath?: string;
  /** False for soft problems, which warn but never throw. */
  strict: boolean;
}

/** Parsed expressions are static per expression text, so a small LRU is enough. */
const MAX_CACHED_EXPRESSIONS = 2000;
const cache = new Map<string, AnalyzedExpression>();

const NULLISH_IDENTIFIERS = new Set(['null', 'undefined']);

export function convertToJexlOperators(expression: string): string {
  return expression.replace(/===/g, '==').replace(/!==/g, '!=');
}

interface Chain {
  root: string;
  relative: boolean;
  path: string[];
  indexed: boolean;
  forbidden: boolean;
  text: string;
}

interface Collector {
  references: ExpressionReference[];
  forbiddenPath?: string;
  functionCalls: string[];
  hasCall: boolean;
}

function addKey(chain: Chain, key: string): Chain {
  return {
    ...chain,
    path: chain.indexed ? chain.path : [...chain.path, key],
    forbidden: chain.forbidden || UNSAFE_PATH_SEGMENTS.has(key),
    text: `${chain.text}.${key}`,
  };
}

/**
 * Read `a.b['c'][0].d` style access chains. Returns undefined when the node is
 * not a chain that starts at an identifier.
 */
function readChain(node: any, visitNested: (node: any) => void): Chain | undefined {
  if (node?.type === 'Identifier') {
    if (!node.from) {
      return {
        root: node.value,
        relative: Boolean(node.relative),
        path: [],
        indexed: false,
        forbidden: UNSAFE_PATH_SEGMENTS.has(node.value),
        text: `${node.relative ? '.' : ''}${node.value}`,
      };
    }
    const base = readChain(node.from, visitNested);
    return base && addKey(base, node.value);
  }
  if (node?.type === 'FilterExpression') {
    const base = readChain(node.subject, visitNested);
    if (!base) return undefined;
    const literal = !node.relative && node.expr?.type === 'Literal' ? node.expr.value : undefined;
    // `$formValues['email']` reads the same key as `$formValues.email`.
    if (typeof literal === 'string') return addKey(base, literal);
    if (literal === undefined) visitNested(node.expr);
    return { ...base, indexed: true, text: `${base.text}[${typeof literal === 'number' ? literal : '...'}]` };
  }
  return undefined;
}

function isNullishIdentifier(node: any): boolean {
  return node?.type === 'Identifier' && !node.from && !node.relative && NULLISH_IDENTIFIERS.has(node.value);
}

function referenceKey(reference: Pick<ExpressionReference, 'root' | 'path'>): string {
  return [reference.root, ...reference.path].join('.');
}

function collect(node: any, guarded: boolean, guardedPrefixes: readonly string[], out: Collector): void {
  if (!node || typeof node !== 'object') return;

  if (node.type === 'FunctionCall') {
    out.hasCall = true;
    if (node.pool === 'functions') out.functionCalls.push(node.name);
  }

  const chain = readChain(node, nested => collect(nested, false, guardedPrefixes, out));
  if (chain) {
    if (chain.forbidden) out.forbiddenPath ??= chain.text;
    if (chain.relative || (chain.path.length === 0 && !chain.indexed && NULLISH_IDENTIFIERS.has(chain.root))) return;
    const key = referenceKey(chain);
    out.references.push({
      root: chain.root,
      path: chain.path,
      indexed: chain.indexed,
      guarded: guarded || guardedPrefixes.some(prefix => key === prefix || key.startsWith(`${prefix}.`)),
    });
    return;
  }

  if (node.type === 'Identifier' && UNSAFE_PATH_SEGMENTS.has(node.value)) {
    out.forbiddenPath ??= node.value;
  }

  if (node.type === 'BinaryExpression' && (node.operator === '||' || node.operator === '&&')) {
    const start = out.references.length;
    collect(node.left, true, guardedPrefixes, out);
    // `a && a.b` reads `a.b` only when `a` is there.
    const prefixes = node.operator === '&&'
      ? [...guardedPrefixes, ...out.references.slice(start).map(referenceKey)]
      : guardedPrefixes;
    collect(node.right, guarded, prefixes, out);
    return;
  }
  if (node.type === 'BinaryExpression' && (node.operator === '==' || node.operator === '!=')
    && (isNullishIdentifier(node.left) || isNullishIdentifier(node.right))) {
    collect(node.left, true, guardedPrefixes, out);
    collect(node.right, true, guardedPrefixes, out);
    return;
  }
  if (node.type === 'ConditionalExpression') {
    const start = out.references.length;
    collect(node.test, guarded, guardedPrefixes, out);
    // The test itself is checked; what it tested is safe to read in the true branch.
    const prefixes = [...guardedPrefixes, ...out.references.slice(start).map(referenceKey)];
    collect(node.consequent, guarded, prefixes, out);
    collect(node.alternate, guarded, guardedPrefixes, out);
    return;
  }

  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(child => collect(child, guarded, guardedPrefixes, out));
    else collect(value, guarded, guardedPrefixes, out);
  }
}

const STRING_LITERAL = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g;
const FORBIDDEN_CHAIN = /(?:^|[^\w$.])((?:[\w$]+\.)*(?:__proto__|prototype|constructor))(?![\w$])/;

/**
 * JEXL cannot even tokenize `constructor`, so an expression that walks a
 * forbidden segment may never reach the AST. Find it in the source instead.
 */
function findForbiddenPath(expression: string): string | undefined {
  return FORBIDDEN_CHAIN.exec(expression.replace(STRING_LITERAL, "''"))?.[1];
}

function analyze(expression: string): AnalyzedExpression {
  try {
    const compiled = Jexl.compile(convertToJexlOperators(expression));
    const ast = (compiled as any)._ast;
    const out: Collector = { references: [], functionCalls: [], hasCall: false };
    collect(ast, false, [], out);
    const chain = readChain(ast, () => undefined);
    return {
      compiled,
      references: out.references,
      forbiddenPath: out.forbiddenPath,
      chainText: chain?.text,
      isIndexedAccess: Boolean(chain?.indexed),
      functionCalls: out.functionCalls,
      hasCall: out.hasCall,
    };
  } catch (error) {
    return {
      references: [],
      error,
      forbiddenPath: findForbiddenPath(expression),
      isIndexedAccess: false,
      functionCalls: [],
      hasCall: /[\w$]\s*\(/.test(expression.replace(STRING_LITERAL, "''")),
    };
  }
}

/**
 * JEXL has no method calls: `value.trim()` is parsed as a call to a function
 * named `trim`, and the value it was written on is dropped.
 */
export const CALL_HINT = 'JEXL does not support calling JavaScript methods or functions (`value.method()`). '
  + 'Use a JEXL transform instead (`value|transform`).';

/** Explain an evaluation or syntax error when the expression tries to call something. */
export function getCallHint(analysis: AnalyzedExpression): string | undefined {
  return analysis.functionCalls.length > 0 || (analysis.error !== undefined && analysis.hasCall) ? CALL_HINT : undefined;
}

type EvaluateNode = (node: any) => { value?: any; threw: boolean };

/** Operands of a node, in the order JEXL evaluates them. */
function operandsOf(node: any): any[] {
  switch (node.type) {
    case 'Identifier': return node.from ? [node.from] : [];
    case 'UnaryExpression': return [node.right];
    case 'BinaryExpression': return [node.left, node.right];
    case 'FunctionCall': return node.args ?? [];
    case 'ArrayLiteral': return node.value;
    case 'ObjectLiteral': return Object.values(node.value);
    default: return [];
  }
}

/**
 * Replace the relative identifiers of a filter (`.price` in `items[.price > 3]`)
 * with the values they read from one item, so the filter can be evaluated for
 * that item alone. A nested filter binds its own identifiers.
 */
function bindRelative(node: any, scope: any): any {
  if (Array.isArray(node)) return node.map(item => bindRelative(item, scope));
  if (!node || typeof node !== 'object') return node;
  if (node.type === 'Identifier' && node.relative && !node.from) return { type: 'Literal', value: scope[node.value] };
  if (node.type === 'FilterExpression' && node.relative) return { ...node, subject: bindRelative(node.subject, scope) };
  return Object.fromEntries(Object.entries(node).map(([key, value]) => [key, bindRelative(value, scope)]));
}

/**
 * Walk down a node that throws to the operation that actually fails, and
 * describe it when it is an index read from null or undefined.
 */
function findFailedIndex(node: any, evaluate: EvaluateNode, scope: object): EmptyIndex | undefined {
  if (node.type === 'ConditionalExpression') {
    const test = evaluate(node.test);
    if (test.threw) return findFailedIndex(node.test, evaluate, scope);
    const branch = test.value ? node.consequent : node.alternate;
    return branch ? findFailedIndex(branch, evaluate, scope) : undefined;
  }
  if (node.type === 'FilterExpression') {
    const subject = evaluate(node.subject);
    if (subject.threw) return findFailedIndex(node.subject, evaluate, scope);
    if (node.relative) {
      const items = Array.isArray(subject.value) ? subject.value : subject.value === undefined ? [] : [subject.value];
      for (const item of items) {
        // JEXL reads relative identifiers from the context when the item is empty.
        const bound = bindRelative(node.expr, item || scope);
        if (evaluate(bound).threw) return findFailedIndex(bound, evaluate, scope);
      }
      return undefined;
    }
    if (evaluate(node.expr).threw) return findFailedIndex(node.expr, evaluate, scope);
    if (subject.value !== null && subject.value !== undefined) return undefined;
    const chain = readChain(node.subject, () => undefined);
    return chain && !chain.relative ? { root: chain.root, text: chain.text } : {};
  }
  // `&&` and `||` skip their right side; when it was skipped it is not what threw.
  const failed = operandsOf(node).find(operand => evaluate(operand).threw);
  return failed ? findFailedIndex(failed, evaluate, scope) : undefined;
}

/**
 * Find out whether JEXL threw only because the expression indexes an empty
 * value (`items[0]` while `items` is null or undefined). That is data that is
 * not there yet, not a broken expression. The answer comes from what failed:
 * the parts of the expression are evaluated again, one by one, down to the
 * operation that throws. Any other failure, such as a transform that throws,
 * returns undefined. Only call this after the expression has thrown.
 */
export function findEmptyIndex(analysis: AnalyzedExpression, jexlContext: object): EmptyIndex | undefined {
  const { compiled } = analysis;
  const evaluate: EvaluateNode = node => {
    // Run one node with JEXL itself, so every operator behaves as in the real evaluation.
    const partial = Object.create(Object.getPrototypeOf(compiled));
    partial._grammar = compiled._grammar;
    partial._ast = node;
    try {
      return { value: partial.evalSync(jexlContext), threw: false };
    } catch {
      return { threw: true };
    }
  };
  return findFailedIndex(compiled._ast, evaluate, jexlContext);
}

/** Compile once and extract references from JEXL's parsed AST. */
export function analyzeExpression(expression: string): AnalyzedExpression {
  const cached = cache.get(expression);
  if (cached) {
    // Refresh recency: Map iteration order is insertion order.
    cache.delete(expression);
    cache.set(expression, cached);
    return cached;
  }
  const result = analyze(expression);
  if (cache.size >= MAX_CACHED_EXPRESSIONS) {
    cache.delete(cache.keys().next().value as string);
  }
  cache.set(expression, result);
  return result;
}

/** Exposed for tests. */
export function getExpressionCacheSize(): number {
  return cache.size;
}

const declaredIndexes = new WeakMap<ReadonlySet<string>, Set<string>>();

/** A path is declared when it is a declared field, below one, or a group containing one. */
export function isDeclaredFormPath(path: string, declared: ReadonlySet<string> | undefined): boolean {
  if (!declared) return false;
  const parts = path.split('.');
  for (let length = parts.length; length > 0; length--) {
    if (declared.has(parts.slice(0, length).join('.'))) return true;
  }
  let groups = declaredIndexes.get(declared);
  if (!groups) {
    groups = new Set<string>();
    for (const declaredPath of declared) {
      const declaredParts = declaredPath.split('.');
      for (let length = 1; length < declaredParts.length; length++) {
        groups.add(declaredParts.slice(0, length).join('.'));
      }
    }
    declaredIndexes.set(declared, groups);
  }
  return groups.has(path);
}

/** Read a reference the way JEXL does: identifiers on an array read its first item. */
function readReference(source: any, path: readonly string[]): any {
  let current = source;
  for (const part of path) {
    if (Array.isArray(current)) current = current[0];
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}

function rootSource(root: string, context: ResolverContext): any {
  return root === '$formValues' ? context.formValues : context.externalContext;
}

function isBuiltInRoot(root: string): boolean {
  return root === '$formValues' || root === '$externalContext';
}

/**
 * Describe a path that reads undefined. A `$formValues` path is a problem when
 * the schema does not declare it; a `$externalContext` path is only a warning
 * while its first-level key exists, because that data may still be loading.
 */
export function getMissingPathProblem(
  root: string,
  path: readonly string[],
  context: ResolverContext,
): ReferenceProblem | undefined {
  if (path.length === 0) return undefined;
  const missingPath = [root, ...path].join('.');
  if (root === '$formValues') {
    return isDeclaredFormPath(path.join('.'), context.declaredFormPaths)
      ? undefined
      : { code: 'EXPRESSION_PATH_NOT_FOUND', missingPath, strict: true };
  }
  const firstLevel = readReference(context.externalContext, path.slice(0, 1));
  return { code: 'EXPRESSION_PATH_NOT_FOUND', missingPath, strict: firstLevel === undefined };
}

/** Validate one parsed reference, returning undefined when there is nothing to report. */
export function getReferenceProblem(
  reference: ExpressionReference,
  context: ResolverContext,
  isCustomRoot?: (root: string) => boolean,
): ReferenceProblem | undefined {
  if (!isBuiltInRoot(reference.root)) {
    // An unknown root can never be valid, so a guard does not excuse it.
    return isCustomRoot?.(reference.root) ? undefined : { code: 'UNKNOWN_EXPRESSION_VARIABLE', strict: true };
  }
  if (reference.guarded) return undefined;
  const value = readReference(rootSource(reference.root, context), reference.path);
  // Null is a value, except for an index: `items[0]` reads nothing from null or undefined alike.
  if (value !== undefined && !(value === null && reference.indexed)) return undefined;
  return getMissingPathProblem(reference.root, reference.path, context);
}

/**
 * Describe an index that failed below a value the references could read
 * (`list[0].tags[1]` with no `tags`), or behind a guard that cannot protect an
 * index. Form data stays quiet; external data may still be loading, so it
 * warns about the value that is empty.
 */
export function getEmptyIndexProblem(emptyIndex: EmptyIndex): ReferenceProblem | undefined {
  return emptyIndex.root === '$externalContext'
    ? { code: 'EXPRESSION_PATH_NOT_FOUND', missingPath: emptyIndex.text, strict: false }
    : undefined;
}

/** True when every reference reads a value, so evaluating cannot surface a missing one. */
export function allReferencesResolve(analysis: AnalyzedExpression, context: ResolverContext): boolean {
  return analysis.references.length > 0 && analysis.references.every(reference =>
    isBuiltInRoot(reference.root)
    && readReference(rootSource(reference.root, context), reference.path) !== undefined);
}
