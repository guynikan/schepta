import type {
  JsonObject,
  JsonValue,
  RendererCapabilities,
  SemanticCatalog,
  UiSpec,
} from '@schepta/core';
import type React from 'react';

export const REACT_MUI_COMPONENTS = [
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

export type ReactMuiComponent = (typeof REACT_MUI_COMPONENTS)[number];
export const REACT_MUI_RENDERER_CAPABILITIES: RendererCapabilities = {
  components: REACT_MUI_COMPONENTS,
};
export type UiState = Record<string, JsonValue>;
export type InputMessage = string | { message: string; severity?: 'error' | 'warning' | 'info' };

export interface UiActionContext {
  action: string;
  args: JsonObject;
  elementId: string;
  eventName: string;
  event: React.SyntheticEvent;
  state: UiState;
}

export type UiActionHandler = (context: UiActionContext) => void | Promise<void>;

export interface UiSpecRendererProps {
  spec: UiSpec;
  /** Optional catalog used to validate the semantic spec before rendering. */
  catalog?: SemanticCatalog;
  /** Handlers keyed by either an action invocation id or semantic action id. */
  actions?: Record<string, UiActionHandler>;
  onAction?: UiActionHandler;
  initialState?: UiState;
  /** A controlled state value. State changes are still emitted via onStateChange. */
  state?: UiState;
  onStateChange?: (state: UiState) => void;
  loading?: boolean | string;
  error?: React.ReactNode;
  success?: React.ReactNode;
  /** Messages keyed by element id, binding id or state path. */
  inputMessages?: Record<string, InputMessage>;
  disabled?: boolean;
  className?: string;
  'data-testid'?: string;
}
