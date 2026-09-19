import { semanticUiCatalog, type SemanticCatalog } from '@schepta/core';

/** Semantic component ids implemented by this renderer. */
export const VUE_VUETIFY_COMPONENTS = [
  'Page',
  'Form',
  'Stack',
  'Text',
  'TextInput',
  'Select',
  'ChoiceGroup',
  'Checkbox',
  'Button',
  'Alert',
] as const;

export type VueVuetifyComponent = typeof VUE_VUETIFY_COMPONENTS[number];

/**
 * Vue maps this shared semantic contract to Vuetify controls. It must not
 * introduce framework-specific components or props at the UiSpec boundary.
 */
export const vueVuetifyCatalog: SemanticCatalog = semanticUiCatalog;
