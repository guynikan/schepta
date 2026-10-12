import type { DebugContextValue } from '../runtime/types';

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

/** Return every form-data path declared by a JSON-schema `properties` tree. */
export function collectDeclaredFormPaths(schema: any): ReadonlySet<string> {
  const paths = new Set<string>();
  const visit = (node: any, prefix = '') => {
    if (!node || typeof node !== 'object' || !node.properties || typeof node.properties !== 'object') return;
    for (const [key, child] of Object.entries(node.properties)) {
      const path = prefix ? `${prefix}.${key}` : key;
      paths.add(path);
      visit(child, path);
    }
  };
  visit(schema);
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
      if (reported.has(key)) return;
      reported.add(key);

      const error = new ScheptaExpressionError(details);
      config?.onExpressionError?.(error);
      if (debug?.isEnabled) {
        debug.log('expression', error.message, { error, ...details });
      }
      if (!isProduction()) {
        console.warn(error.message, details.cause);
      }
      if (config?.onError === 'throw') {
        throw error;
      }
    },
  };
}
