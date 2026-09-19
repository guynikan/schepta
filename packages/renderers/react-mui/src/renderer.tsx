import React, { useCallback, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import CheckboxControl from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import SelectControl from '@mui/material/Select';
import StackControl from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { JsonObject, JsonValue, UiAction, UiElement, UiSpec } from '@schepta/core';
import { reactMuiCatalog, validateUiInputs, validateUiSpec } from '@schepta/core';
import { REACT_MUI_COMPONENTS, type InputMessage, type ReactMuiComponent, type UiActionContext, type UiSpecRendererProps, type UiState } from './types';

const supportedComponents = new Set<string>(REACT_MUI_COMPONENTS);

export class UiSpecRenderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UiSpecRenderError';
  }
}

function cloneJson<T extends JsonValue>(value: T): T {
  if (value === null || typeof value !== 'object') return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

function pathParts(path: string): string[] {
  if (path.startsWith('state.')) return path.slice('state.'.length).split('.');
  return path.slice(1).split('/').filter(Boolean);
}

function readPath(state: UiState, path: string): JsonValue | undefined {
  return pathParts(path).reduce<JsonValue | undefined>((value, part) => {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return undefined;
    return (value as JsonObject)[part];
  }, state);
}

function writePath(state: UiState, path: string, value: JsonValue): UiState {
  const parts = pathParts(path);
  if (parts.length === 0) return state;
  const next = cloneJson(state);
  let cursor: JsonObject = next;
  parts.forEach((part, index) => {
    if (index === parts.length - 1) {
      cursor[part] = cloneJson(value);
      return;
    }
    const child = cursor[part];
    if (child === null || typeof child !== 'object' || Array.isArray(child)) cursor[part] = {};
    cursor = cursor[part] as JsonObject;
  });
  return next;
}

function stateFromSpec(spec: UiSpec, override?: UiState): UiState {
  const initial: UiState = {};
  for (const [name, definition] of Object.entries(spec.state ?? {})) {
    if (definition.initial !== undefined) initial[name] = cloneJson(definition.initial);
  }
  return { ...initial, ...(override ? cloneJson(override) : {}) };
}

function actionId(action: UiAction | undefined): string | undefined {
  if (!action) return undefined;
  return typeof action.action === 'string' ? action.action : typeof action.name === 'string' ? action.name : undefined;
}

function actionArgs(action: UiAction | undefined): JsonObject {
  if (!action) return {};
  const args = action.args ?? action.inputs;
  return args && typeof args === 'object' && !Array.isArray(args) ? args : {};
}

function textValue(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
}

function childIds(element: UiElement): string[] {
  const children = Array.isArray(element.children) ? element.children : [];
  const slots = Object.values(element.slots ?? {}).flat();
  return [...children, ...slots];
}

function messageFor(
  id: string,
  element: UiElement,
  inputMessages: Record<string, InputMessage> | undefined,
  bindingNames: string[],
  validationMessages?: Record<string, string>,
): { text?: string; severity?: 'error' | 'warning' | 'info' } {
  const candidates = [id, ...bindingNames, ...bindingNames.map((name) => element.bindings?.[name] ?? '')];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const message = inputMessages?.[candidate];
    if (typeof message === 'string') return { text: message, severity: 'error' };
    if (message && typeof message.message === 'string') return { text: message.message, severity: message.severity ?? 'error' };
  }
  if (validationMessages?.[id]) return { text: validationMessages[id], severity: 'error' };
  const props = element.props ?? {};
  if (typeof props.message === 'string') return { text: props.message, severity: props.messageSeverity === 'warning' ? 'warning' : 'error' };
  if (typeof props.helperText === 'string') return { text: props.helperText, severity: 'info' };
  return {};
}

function validateElementValue(id: string, element: UiElement, spec: UiSpec, state: UiState): string | undefined {
  const props = element.props ?? {};
  const bindingName = element.bindings?.value ?? element.bindings?.checked;
  const declaration = bindingName ? spec.bindings?.[bindingName] : undefined;
  const value = declaration ? readPath(state, declaration.path) : undefined;
  if (props.required === true && (value === undefined || value === null || value === '')) return 'This field is required.';
  const stateKey = declaration ? pathParts(declaration.path)[0] : undefined;
  const stateSchema = stateKey ? spec.state?.[stateKey]?.schema : undefined;
  const schema = stateSchema && {
    ...stateSchema,
    ...(typeof props.minLength === 'number' ? { minLength: props.minLength } : {}),
    ...(typeof props.maxLength === 'number' ? { maxLength: props.maxLength } : {}),
    ...(typeof props.pattern === 'string' ? { pattern: props.pattern } : {}),
    ...(typeof props.minimum === 'number' ? { minimum: props.minimum } : {}),
    ...(typeof props.maximum === 'number' ? { maximum: props.maximum } : {}),
  };
  if (!schema || value === undefined) return undefined;
  const report = validateUiInputs(value, schema, { path: declaration?.path });
  return report.errors[0]?.message;
}

function semanticTextVariant(value: unknown): 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'caption' {
  switch (value) {
    case 'display': return 'h1';
    case 'title': return 'h2';
    case 'heading': return 'h3';
    case 'small': return 'caption';
    case 'muted': return 'body2';
    default: return 'body1';
  }
}

function semanticButtonProps(value: unknown): { variant: 'contained' | 'outlined' | 'text'; color: 'primary' | 'secondary' | 'error' } {
  switch (value) {
    case 'secondary': return { variant: 'outlined', color: 'secondary' };
    case 'quiet': return { variant: 'text', color: 'primary' };
    case 'danger': return { variant: 'contained', color: 'error' };
    default: return { variant: 'contained', color: 'primary' };
  }
}

function optionEntries(value: unknown): Array<{ value: string; label: string }> {
  if (!Array.isArray(value)) return [];
  return value.flatMap((option) => {
    if (typeof option === 'string' || typeof option === 'number') return [{ value: String(option), label: String(option) }];
    if (option && typeof option === 'object' && !Array.isArray(option)) {
      const record = option as Record<string, unknown>;
      const optionValue = record.value ?? record.id;
      const label = record.label ?? record.name ?? optionValue;
      if (typeof optionValue === 'string' || typeof optionValue === 'number') return [{ value: String(optionValue), label: textValue(label) }];
    }
    return [];
  });
}

function validateForRenderer(spec: UiSpec, catalog: UiSpecRendererProps['catalog'] = reactMuiCatalog): void {
  const report = validateUiSpec(spec, { catalog });
  if (!report.valid) throw new UiSpecRenderError(`UiSpec is invalid: ${report.errors.map((error) => `${error.path} ${error.message}`).join('; ')}`);
  for (const [id, element] of Object.entries(spec.elements)) {
    if (!supportedComponents.has(element.component)) {
      throw new UiSpecRenderError(`Unknown UiSpec component "${element.component}" at element "${id}".`);
    }
  }
}

interface TreeProps {
  id: string;
  element: UiElement;
  spec: UiSpec;
  state: UiState;
  disabled: boolean;
  loading: boolean;
  inputMessages?: Record<string, InputMessage>;
  validationMessages: Record<string, string>;
  updateBinding: (id: string, property: string, value: JsonValue) => void;
  invokeAction: (id: string, eventName: string, event: React.SyntheticEvent) => void;
  renderElement: (id: string) => React.ReactNode;
}

function TreeElement({ id, element, spec, state, disabled, loading, inputMessages, validationMessages, updateBinding, invokeAction, renderElement }: TreeProps) {
  const props = element.props ?? {};
  const ids = childIds(element);
  const children = ids.map((childId) => renderElement(childId));
  const bindingNames = Object.keys(element.bindings ?? {});
  const valueBinding = element.bindings?.value;
  const checkedBinding = element.bindings?.checked ?? element.bindings?.value;
  const binding = valueBinding ? spec.bindings?.[valueBinding] : undefined;
  const checked = checkedBinding ? spec.bindings?.[checkedBinding] : undefined;
  const value = binding ? readPath(state, binding.path) : undefined;
  const checkedValue = checked ? readPath(state, checked.path) : undefined;
  const message = messageFor(id, element, inputMessages, bindingNames, validationMessages);
  const onChange = (next: JsonValue, event: React.SyntheticEvent) => {
    if (valueBinding) updateBinding(id, 'value', next);
    invokeAction(id, 'change', event);
  };

  switch (element.component as ReactMuiComponent) {
    case 'Page':
      return <Container component="main" maxWidth="md"><StackControl spacing={3}>{typeof props.title === 'string' && <Typography variant="h4">{props.title}</Typography>}{typeof props.description === 'string' && <Typography color="text.secondary">{props.description}</Typography>}{children}</StackControl></Container>;
    case 'Form':
      return <Box component="form" noValidate onSubmit={(event) => { event.preventDefault(); invokeAction(id, 'submit', event); }}><StackControl spacing={2}>{children}</StackControl></Box>;
    case 'Stack': {
      const direction = props.orientation === 'horizontal' ? 'row' : 'column';
      return <StackControl direction={direction} spacing={typeof props.gap === 'number' ? props.gap : 2} alignItems={typeof props.align === 'string' ? props.align : undefined} justifyContent={typeof props.justify === 'string' ? props.justify : undefined}>{children}</StackControl>;
    }
    case 'Text':
      return <Typography variant={semanticTextVariant(props.variant)} color={props.muted === true ? 'text.secondary' : undefined}>{textValue(props.text ?? props.content ?? '')}</Typography>;
    case 'TextInput':
      return <TextField fullWidth label={textValue(props.label)} placeholder={textValue(props.placeholder) || undefined} type={textValue(props.inputType) || 'text'} required={props.required === true} disabled={disabled || props.disabled === true} multiline={props.multiline === true} rows={typeof props.rows === 'number' ? props.rows : undefined} value={value === undefined || value === null ? '' : textValue(value)} onChange={(event) => onChange(event.target.value, event)} error={message.severity === 'error'} helperText={message.text} name={typeof props.name === 'string' ? props.name : id} inputProps={{ readOnly: props.readOnly === true }} />;
    case 'Select': {
      const label = textValue(props.label);
      return <FormControl fullWidth error={message.severity === 'error'} disabled={disabled || props.disabled === true}><InputLabel>{label}</InputLabel><SelectControl label={label} value={value === undefined || value === null ? '' : textValue(value)} onChange={(event) => onChange(event.target.value as string, event as unknown as React.SyntheticEvent)}>{optionEntries(props.options).map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}</SelectControl>{message.text && <FormHelperText>{message.text}</FormHelperText>}</FormControl>;
    }
    case 'ChoiceGroup': {
      const options = optionEntries(props.options);
      return <FormControl error={message.severity === 'error'} disabled={disabled || props.disabled === true}><Typography component="legend">{textValue(props.label)}</Typography><RadioGroup value={value === undefined || value === null ? '' : textValue(value)} onChange={(event) => onChange(event.target.value, event)}>{options.map((option) => <FormControlLabel key={option.value} value={option.value} control={<Radio />} label={option.label} />)}</RadioGroup>{message.text && <FormHelperText>{message.text}</FormHelperText>}</FormControl>;
    }
    case 'Checkbox':
      return <FormControl error={message.severity === 'error'} disabled={disabled || props.disabled === true}><FormControlLabel control={<CheckboxControl checked={Boolean(checkedValue)} onChange={(event) => { if (checkedBinding) updateBinding(id, 'checked', event.target.checked); invokeAction(id, 'change', event); }} />} label={textValue(props.label)} />{message.text && <FormHelperText>{message.text}</FormHelperText>}</FormControl>;
    case 'Button': {
      const button = semanticButtonProps(props.kind);
      return <Button type={props.submit === true ? 'submit' : 'button'} variant={button.variant} color={button.color} disabled={disabled || loading || props.disabled === true} onClick={(event) => invokeAction(id, 'press', event)}>{loading || props.loading === true ? <CircularProgress size={20} aria-label="Loading" /> : textValue(props.label ?? props.text)}</Button>;
    }
    case 'Alert': {
      const severity = props.severity === 'success' || props.severity === 'warning' || props.severity === 'error' ? props.severity : 'info';
      return <Alert severity={severity}>{typeof props.title === 'string' && <AlertTitle>{props.title}</AlertTitle>}{textValue(props.message ?? props.text)}</Alert>;
    }
    default:
      throw new UiSpecRenderError(`Unknown UiSpec component "${element.component}" at element "${id}".`);
  }
}

/** Render a validated semantic UiSpec using Material UI primitives. */
export function UiSpecRenderer({ spec, catalog, actions, onAction, initialState, state: controlledState, onStateChange, loading = false, error, success, inputMessages, disabled = false, className, 'data-testid': dataTestId }: UiSpecRendererProps) {
  validateForRenderer(spec, catalog);
  const [localState, setLocalState] = useState<UiState>(() => stateFromSpec(spec, initialState));
  const [validationMessages, setValidationMessages] = useState<Record<string, string>>({});
  const state = controlledState ?? localState;
  const isLoading = loading !== false;

  const setState = useCallback((next: UiState) => {
    if (controlledState === undefined) setLocalState(next);
    onStateChange?.(next);
  }, [controlledState, onStateChange]);

  const updateBinding = useCallback((id: string, property: string, value: JsonValue) => {
    const element = spec.elements[id];
    const bindingName = element.bindings?.[property];
    const declaration = bindingName ? spec.bindings?.[bindingName] : undefined;
    if (!declaration || declaration.mode === 'read') return;
    const nextState = writePath(state, declaration.path, value);
    const nextMessage = validateElementValue(id, element, spec, nextState);
    setValidationMessages((current) => {
      if (nextMessage) return { ...current, [id]: nextMessage };
      const next = { ...current };
      delete next[id];
      return next;
    });
    setState(nextState);
  }, [setState, spec, state]);

  const validateAll = useCallback(() => {
    const nextMessages: Record<string, string> = {};
    for (const [id, element] of Object.entries(spec.elements)) {
      const message = validateElementValue(id, element, spec, state);
      if (message) nextMessages[id] = message;
    }
    setValidationMessages(nextMessages);
    return Object.keys(nextMessages).length === 0;
  }, [spec, state]);

  const invokeAction = useCallback((id: string, eventName: string, event: React.SyntheticEvent) => {
    const element = spec.elements[id];
    const invocationName = element.actions?.[eventName] ?? (eventName === 'press' ? element.actions?.click : undefined);
    const invocation = invocationName ? spec.actions?.[invocationName] : undefined;
    const action = actionId(invocation);
    if (!action) return;
    if ((eventName === 'press' || eventName === 'submit') && !validateAll()) {
      event.preventDefault();
      return;
    }
    const context: UiActionContext = { action, args: actionArgs(invocation), elementId: id, eventName, event, state };
    const invocationHandler = invocationName ? actions?.[invocationName] : undefined;
    const handler = invocationHandler ?? actions?.[action] ?? onAction;
    void handler?.(context);
  }, [actions, onAction, spec.actions, spec.elements, state, validateAll]);

  const renderElement = useMemo(() => {
    const render = (id: string): React.ReactNode => {
      const element = spec.elements[id];
      if (!element) throw new UiSpecRenderError(`Unknown child element "${id}".`);
      return <TreeElement key={id} id={id} element={element} spec={spec} state={state} disabled={disabled} loading={isLoading} inputMessages={inputMessages} validationMessages={validationMessages} updateBinding={updateBinding} invokeAction={invokeAction} renderElement={render} />;
    };
    return render;
  }, [disabled, inputMessages, invokeAction, isLoading, spec, state, updateBinding, validationMessages]);

  return <Box className={className} data-testid={dataTestId} sx={{ width: '100%' }}>
    {isLoading && <Alert severity="info">{typeof loading === 'string' ? loading : 'Loading'}</Alert>}
    {error && <Alert severity="error">{error}</Alert>}
    {success && <Alert severity="success">{success}</Alert>}
    {renderElement(spec.root)}
  </Box>;
}

export const ReactMuiRenderer = UiSpecRenderer;

/** Create a renderer component with shared boundary options for an application. */
export function createReactMuiRenderer(defaultProps: Omit<UiSpecRendererProps, 'spec'> = {}) {
  return function ConfiguredUiSpecRenderer(props: UiSpecRendererProps) {
    return <UiSpecRenderer {...defaultProps} {...props} />;
  };
}
