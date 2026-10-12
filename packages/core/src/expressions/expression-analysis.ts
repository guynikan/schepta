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
  /** The expression reads `subject[index]`, which JEXL cannot do on an empty subject. */
  hasIndexAccess: boolean;
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
  hasIndexAccess: boolean;
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

/** `subject[index]` anywhere in the tree; `subject[.key > 1]` filters and never throws. */
function readsByIndex(node: any): boolean {
  if (!node || typeof node !== 'object') return false;
  if (node.type === 'FilterExpression' && !node.relative) return true;
  return Object.values(node).some(value => (Array.isArray(value) ? value.some(readsByIndex) : readsByIndex(value)));
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
    const out: Collector = { references: [], functionCalls: [], hasCall: false, hasIndexAccess: readsByIndex(ast) };
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
      hasIndexAccess: out.hasIndexAccess,
    };
  } catch (error) {
    return {
      references: [],
      error,
      forbiddenPath: findForbiddenPath(expression),
      isIndexedAccess: false,
      functionCalls: [],
      hasCall: /[\w$]\s*\(/.test(expression.replace(STRING_LITERAL, "''")),
      hasIndexAccess: false,
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

/**
 * True when JEXL threw only because the expression indexes an empty value
 * (`items[0]` while `items` is null or undefined). That is data that is not
 * there yet, which the references describe, not a broken expression. JEXL
 * rethrows nested failures as a plain Error whose message starts with the
 * original error name.
 */
export function isEmptyIndexFailure(analysis: AnalyzedExpression, cause: unknown): boolean {
  if (!analysis.hasIndexAccess) return false;
  return cause instanceof TypeError || (cause instanceof Error && cause.message.startsWith('TypeError:'));
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
 * index. Form data stays quiet; external data may still be loading, so it warns.
 */
export function getEmptyIndexProblems(analysis: AnalyzedExpression): ReferenceProblem[] {
  return analysis.references
    .filter(reference => reference.indexed && reference.root === '$externalContext')
    .map(reference => ({
      code: 'EXPRESSION_PATH_NOT_FOUND' as const,
      missingPath: referenceKey(reference),
      strict: false,
    }));
}

/** True when every reference reads a value, so evaluating cannot surface a missing one. */
export function allReferencesResolve(analysis: AnalyzedExpression, context: ResolverContext): boolean {
  return analysis.references.length > 0 && analysis.references.every(reference =>
    isBuiltInRoot(reference.root)
    && readReference(rootSource(reference.root, context), reference.path) !== undefined);
}
