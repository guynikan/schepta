import type {
  SemanticActionDefinition,
  SemanticCatalog,
  SemanticComponentDefinition,
} from './types';

/** Create a catalog while keeping declarations independent from any renderer. */
export function createSemanticCatalog(config: {
  version?: string;
  components: Record<string, SemanticComponentDefinition>;
  actions?: Record<string, SemanticActionDefinition>;
}): SemanticCatalog {
  return {
    ...(config.version ? { version: config.version } : {}),
    components: { ...config.components },
    ...(config.actions ? { actions: { ...config.actions } } : {}),
  };
}
