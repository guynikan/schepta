import { Jexl } from '../utils/jexl-config';
import type { ResolverContext } from './variable-resolver';

export interface ExpressionReference {
  expression: string;
  root: string;
  path: string[];
  guarded: boolean;
}

interface CompiledExpression {
  compiled?: any;
  references: ExpressionReference[];
  error?: unknown;
}

const cache = new Map<string, CompiledExpression>();

export function convertToJexlOperators(expression: string): string {
  return expression.replace(/===/g, '==').replace(/!==/g, '!=');
}

function identifierChain(node: any): { root: string; path: string[] } | undefined {
  if (!node || node.type !== 'Identifier') return undefined;
  const path: string[] = [];
  let current = node;
  while (current?.type === 'Identifier') {
    path.unshift(current.value);
    current = current.from;
  }
  const root = path.shift();
  return root?.startsWith('$') ? { root, path } : undefined;
}

function collect(node: any, guarded: boolean, references: ExpressionReference[]): void {
  if (!node || typeof node !== 'object') return;
  const chain = identifierChain(node);
  if (chain) {
    references.push({ expression: [chain.root, ...chain.path].join('.'), ...chain, guarded });
    return;
  }
  if (node.type === 'BinaryExpression' && node.operator === '||') {
    collect(node.left, true, references);
    collect(node.right, guarded, references);
    return;
  }
  if (node.type === 'ConditionalExpression') {
    collect(node.test, true, references);
    collect(node.consequent, true, references);
    collect(node.alternate, true, references);
    return;
  }
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(child => collect(child, guarded, references));
    else collect(value, guarded, references);
  }
}

/** Compile once and extract references from JEXL's parsed AST. */
export function analyzeExpression(expression: string): CompiledExpression {
  const cached = cache.get(expression);
  if (cached) return cached;
  try {
    const compiled = Jexl.compile(convertToJexlOperators(expression));
    const references: ExpressionReference[] = [];
    collect((compiled as any)._ast, false, references);
    const result = { compiled, references };
    cache.set(expression, result);
    return result;
  } catch (error) {
    const result = { references: [], error };
    cache.set(expression, result);
    return result;
  }
}

function resolvePath(value: any, path: string[]): { found: boolean; value: any } {
  let current = value;
  for (const part of path) {
    if (current === null || current === undefined || !(part in Object(current))) return { found: false, value: undefined };
    // Always read the property: get-only Proxy contexts must preserve main's value semantics.
    current = current[part];
  }
  return { found: true, value: current };
}

function isDeclared(path: string, declared: ReadonlySet<string> | undefined): boolean {
  return [...(declared ?? [])].some(declaredPath => path === declaredPath || path.startsWith(`${declaredPath}.`));
}

/** Validate one parsed reference, returning undefined when it is valid or guarded. */
export function getReferenceProblem(reference: ExpressionReference, context: ResolverContext):
  | { code: 'UNKNOWN_EXPRESSION_VARIABLE'; strict: boolean }
  | { code: 'EXPRESSION_PATH_NOT_FOUND'; missingPath: string; strict: boolean }
  | undefined {
  if (reference.guarded) return undefined;
  if (reference.root !== '$formValues' && reference.root !== '$externalContext') {
    return { code: 'UNKNOWN_EXPRESSION_VARIABLE', strict: true };
  }
  if (reference.path.length === 0) return undefined;
  const source = reference.root === '$formValues' ? context.formValues : context.externalContext;
  if (reference.root === '$formValues') {
    if (!resolvePath(source, reference.path).found && !isDeclared(reference.path.join('.'), context.declaredFormPaths)) {
      return { code: 'EXPRESSION_PATH_NOT_FOUND', missingPath: reference.expression, strict: true };
    }
    return undefined;
  }
  const resolved = resolvePath(source, reference.path);
  if (resolved.found) return undefined;
  const rootPresent = reference.path[0] in Object(source ?? {});
  return { code: 'EXPRESSION_PATH_NOT_FOUND', missingPath: reference.expression, strict: !rootPresent };
}
