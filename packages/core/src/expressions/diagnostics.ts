import type { DebugContextValue } from '../runtime/types';
import { isInputComponent, traverseFormSchema } from '../validation/schema-traversal';

export type ExpressionErrorCode =
  | 'EXPRESSION_EVALUATION_ERROR'
  | 'UNKNOWN_EXPRESSION_VARIABLE'
  | 'EXPRESSION_PATH_NOT_FOUND';

export type ExpressionErrorMode = 'warn' | 'throw';

export interface ExpressionConfig {
  /** Controls how invalid expressions are handled. Defaults to `warn`. */
  onError?: ExpressionErrorMode;
  /** Receives every unique expression diagnostic before warn/throw handling. */
  onExpressionError?: (error: ScheptaExpressionError) => void;
}

export interface ExpressionDiagnosticDetails {
  code: ExpressionErrorCode;
  expression: string;
  path: string;
  missingPath?: string;
  cause?: unknown;
  /** Extra guidance appended to the error message. */
  hint?: string;
  /** Internal: false marks a soft problem, which warns but never throws. */
  strict?: boolean;
}

/** Error raised for invalid schema expressions when strict mode is enabled. */
export class ScheptaExpressionError extends Error {
  readonly code: ExpressionErrorCode;
  readonly expression: string;
  readonly path: string;
  readonly missingPath?: string;

  constructor(details: ExpressionDiagnosticDetails) {
    const missing = details.missingPath ? ` Missing path: "${details.missingPath}".` : '';
    const hint = details.hint ? ` ${details.hint}` : '';
    super(`Invalid expression "${details.expression}" at "${details.path}": ${details.code}.${missing}${hint}`);
    this.name = 'ScheptaExpressionError';
    this.code = details.code;
    this.expression = details.expression;
    this.path = details.path;
    this.missingPath = details.missingPath;
  }
}

export interface ExpressionDiagnostics {
  report(details: ExpressionDiagnosticDetails): void;
}

/**
 * Return form-data paths using the same field-name rules as form adapters.
 *
 * `isFieldComponent` lets the caller answer from its component registry. It
 * returns undefined when the component does not resolve; the schema itself
 * then decides, because a field the schema declares is declared whether or
 * not something is registered to render it.
 */
export function collectDeclaredFormPaths(
  schema: any,
  isFieldComponent?: (node: any, key: string) => boolean | undefined,
): ReadonlySet<string> {
  const paths = new Set<string>();
  traverseFormSchema(schema, field => paths.add(field.path));
  if (!isFieldComponent) return paths;

  const declaresField = (node: any): boolean => {
    const component = node['x-component'];
    if (typeof component === 'string' && isInputComponent(component)) return true;
    return typeof node.type === 'string' && node.type !== 'object' && !node.properties;
  };
  const visit = (node: any, key: string, parentName: string | undefined, isDirectRootProperty: boolean): void => {
    if (!node || typeof node !== 'object') return;
    const isField = isFieldComponent(node, key) ?? declaresField(node);
    const currentName = isField || isDirectRootProperty
      ? (parentName ? `${parentName}.${key}` : key)
      : parentName;
    if (isField && currentName) paths.add(currentName);
    for (const [childKey, child] of Object.entries(node.properties ?? {})) {
      visit(child, childKey, currentName, !parentName && key === 'FormContainer');
    }
  };
  visit(schema, 'FormContainer', undefined, false);
  return paths;
}

function isProduction(): boolean {
  return typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';
}

type Lazy<T> = T | (() => T);

function read<T>(value: Lazy<T>): T {
  return typeof value === 'function' ? (value as () => T)() : value;
}

/**
 * Creates a per-form diagnostic sink. It de-duplicates identical errors so a
 * reactive render loop cannot repeatedly report the same schema mistake.
 *
 * Create it once per form and keep it. Pass getters when the configuration can
 * change between renders (an inline `onExpressionError` closure, for example):
 * the sink then always calls the latest handler without losing what it has
 * already reported.
 */
export function createExpressionDiagnostics(
  config?: Lazy<ExpressionConfig | undefined>,
  debug?: Lazy<DebugContextValue | undefined>,
): ExpressionDiagnostics {
  const reported = new Set<string>();

  return {
    report(details) {
      const currentConfig = read(config);
      const key = `${details.code}\u0000${details.expression}\u0000${details.path}\u0000${details.missingPath ?? ''}`;
      const error = new ScheptaExpressionError(details);
      if (!reported.has(key)) {
        reported.add(key);
        currentConfig?.onExpressionError?.(error);
        const currentDebug = read(debug);
        if (currentDebug?.isEnabled) {
          currentDebug.log('expression', error.message, { error, ...details });
        }
        if (!isProduction()) {
          console.warn(error.message, details.cause);
        }
      }
      if (currentConfig?.onError === 'throw' && details.strict !== false) {
        throw error;
      }
    },
  };
}
