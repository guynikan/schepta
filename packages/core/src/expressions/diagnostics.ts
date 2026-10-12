import type { DebugContextValue } from '../runtime/types';
import { traverseFormSchema } from '../validation/schema-traversal';

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
  /** Internal: optional external-context paths are warnings even in strict mode. */
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
    super(`Invalid expression "${details.expression}" at "${details.path}": ${details.code}.${missing}`);
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

/** Return form-data paths using the same field-name rules as form adapters. */
export function collectDeclaredFormPaths(
  schema: any,
  isFieldComponent?: (node: any, key: string) => boolean,
): ReadonlySet<string> {
  const paths = new Set<string>();
  if (!isFieldComponent) {
    traverseFormSchema(schema, field => paths.add(field.path));
    return paths;
  }
  const visit = (node: any, key: string, parentName: string | undefined, isDirectRootProperty: boolean): void => {
    if (!node || typeof node !== 'object') return;
    const isField = isFieldComponent(node, key);
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

/**
 * Creates a per-form diagnostic sink. It de-duplicates identical errors so a
 * reactive render loop cannot repeatedly report the same schema mistake.
 */
export function createExpressionDiagnostics(
  config: ExpressionConfig | undefined,
  debug?: DebugContextValue,
): ExpressionDiagnostics {
  const reported = new Set<string>();

  return {
    report(details) {
      const key = `${details.code}\u0000${details.expression}\u0000${details.path}\u0000${details.missingPath ?? ''}`;
      const error = new ScheptaExpressionError(details);
      if (!reported.has(key)) {
        reported.add(key);
        config?.onExpressionError?.(error);
        if (debug?.isEnabled) {
          debug.log('expression', error.message, { error, ...details });
        }
        if (!isProduction()) {
          console.warn(error.message, details.cause);
        }
      }
      if (config?.onError === 'throw' && details.strict !== false) {
        throw error;
      }
    },
  };
}
