import {
  computed,
  defineComponent,
  h,
  reactive,
  ref,
  type Component,
  type PropType,
  type VNodeChild,
} from 'vue';
import {
  VAlert,
  VBtn,
  VCheckbox,
  VContainer,
  VForm,
  VRadio,
  VRadioGroup,
  VSelect,
  VTextField,
} from 'vuetify/components';
import {
  isUiElementVisible,
  resolveUiInputProps,
  validateUiInputBehavior,
  validateUiSpec,
  type JsonValue,
  type UiAction,
  type UiElement,
  type UiSpec,
  type UiValidationReport,
} from '@schepta/core';
import { VUE_VUETIFY_COMPONENTS, type VueVuetifyComponent } from './catalog';

export type UiStatusMessage = string | string[] | null | undefined;

export interface UiActionContext {
  action: string;
  invocation: UiAction;
  elementId: string;
  event: string;
  payload?: unknown;
  state: Record<string, unknown>;
}

export type UiActionHandler = (
  context: UiActionContext,
) => unknown | Promise<unknown>;

export interface VueVuetifyRendererProps {
  spec: UiSpec;
  actionHandlers?: Record<string, UiActionHandler>;
  loading?: boolean | Record<string, boolean>;
  error?: UiStatusMessage;
  success?: UiStatusMessage;
  inputMessages?: Record<string, UiStatusMessage>;
  onStateChange?: (path: string, value: unknown, state: Record<string, unknown>) => void;
}

export interface VueVuetifyRendererExposed {
  state: Record<string, unknown>;
  validate: () => boolean;
  getValue: (path: string) => unknown;
}

const inputComponents = new Set([
  'TextInput',
  'Select',
  'ChoiceGroup',
  'Checkbox',
]);

const supportedComponents = new Set<string>(VUE_VUETIFY_COMPONENTS);

function cloneValue(value: JsonValue | undefined): unknown {
  if (Array.isArray(value)) return value.map((child) => cloneValue(child));
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, cloneValue(child)]));
  }
  return value;
}

function pathParts(path: string): string[] {
  if (path.startsWith('state.')) return path.slice('state.'.length).split('.');
  if (path.startsWith('/')) return path.slice(1).split('/').filter(Boolean).map((part) => part.replace(/~1/g, '/').replace(/~0/g, '~'));
  return path.split('.');
}

function readPath(target: Record<string, unknown>, path: string): unknown {
  return pathParts(path).reduce<unknown>((value, part) => {
    if (value === null || value === undefined || typeof value !== 'object') return undefined;
    return (value as Record<string, unknown>)[part];
  }, target);
}

function writePath(target: Record<string, unknown>, path: string, nextValue: unknown): void {
  const parts = pathParts(path);
  if (parts.length === 0) return;
  let current = target;
  for (const part of parts.slice(0, -1)) {
    const existing = current[part];
    if (existing === null || typeof existing !== 'object' || Array.isArray(existing)) current[part] = {};
    current = current[part] as Record<string, unknown>;
  }
  current[parts[parts.length - 1]] = nextValue;
}

function messageArray(value: UiStatusMessage): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
  return typeof value === 'string' && value.length > 0 ? [value] : [];
}

function asOptions(value: unknown): Array<{ title: string; value: unknown }> {
  if (!Array.isArray(value)) return [];
  return value.map((option) => {
    if (option !== null && typeof option === 'object') {
      const record = option as Record<string, unknown>;
      const optionValue = record.value ?? record.id ?? record.key;
      return { title: String(record.label ?? record.title ?? optionValue ?? ''), value: optionValue };
    }
    return { title: String(option), value: option };
  });
}

function dataProps(id: string, props: Record<string, any>): Record<string, any> {
  return {
    'data-ui-component': props.component,
    'data-ui-id': id,
    'data-testid': id,
    'data-test-id': id,
  };
}

export class UiSpecRenderError extends Error {
  constructor(message: string, public readonly report?: UiValidationReport) {
    super(message);
    this.name = 'UiSpecRenderError';
  }
}

/** Reject malformed specs and component ids that this renderer cannot own. */
export function assertRenderableUiSpec(spec: UiSpec): void {
  for (const [id, element] of Object.entries(spec.elements ?? {})) {
    if (!supportedComponents.has(element.component)) {
      throw new UiSpecRenderError(`Unknown semantic component "${element.component}" at element "${id}".`);
    }
  }
  const report = validateUiSpec(spec, {
    rendererCapabilities: { components: VUE_VUETIFY_COMPONENTS },
  });
  if (!report.valid) {
    throw new UiSpecRenderError(
      `UiSpec rejected with ${report.errors.length} validation error(s).`,
      report,
    );
  }
}

export function createVueVuetifyRenderer(): Component {
  return defineComponent({
    name: 'VueVuetifyUiSpecRenderer',
    props: {
      spec: { type: Object as PropType<UiSpec>, required: true },
      actionHandlers: { type: Object as PropType<Record<string, UiActionHandler>>, default: () => ({}) },
      loading: { type: [Boolean, Object] as PropType<boolean | Record<string, boolean>>, default: false },
      error: { type: [String, Array] as PropType<UiStatusMessage>, default: undefined },
      success: { type: [String, Array] as PropType<UiStatusMessage>, default: undefined },
      inputMessages: { type: Object as PropType<Record<string, UiStatusMessage>>, default: () => ({}) },
      onStateChange: { type: Function as PropType<VueVuetifyRendererProps['onStateChange']>, default: undefined },
    },
    emits: ['action'],
    setup(props, { emit, expose }) {
      assertRenderableUiSpec(props.spec);

      const state = reactive<Record<string, unknown>>({});
      const localValues = reactive<Record<string, unknown>>({});
      const inputErrors = reactive<Record<string, string[]>>({});
      const touched = reactive<Record<string, boolean>>({});
      const pendingActions = reactive<Record<string, boolean>>({});
      const dismissedAlerts = reactive<Record<string, boolean>>({});
      const runtimeError = ref<string | null>(null);

      function elementProps(element: UiElement): Record<string, any> {
        return resolveUiInputProps(element.props, state as Record<string, JsonValue>) as Record<string, any>;
      }

      function initializeState(spec: UiSpec): void {
        for (const key of Object.keys(state)) delete state[key];
        for (const [key, definition] of Object.entries(spec.state ?? {})) {
          state[key] = cloneValue(definition.initial);
        }
        for (const [id, element] of Object.entries(spec.elements)) {
          if (inputComponents.has(element.component)) {
            touched[id] = false;
            inputErrors[id] = [];
          }
          if (element.component === 'Alert') dismissedAlerts[id] = false;
        }
      }
      initializeState(props.spec);

      function bindingFor(element: UiElement, property: string): string | undefined {
        const bindings = element.bindings ?? {};
        return bindings[property] ?? (property === 'modelValue' ? bindings.value : undefined);
      }

      function valueFor(elementId: string, element: UiElement, property = 'value'): unknown {
        const bindingName = bindingFor(element, property);
        if (bindingName) {
          const binding = props.spec.bindings?.[bindingName];
          if (binding) return readPath(state, binding.path);
        }
        const values = elementProps(element);
        if (values[property] !== undefined) return values[property];
        if (property === 'value' && values.defaultValue !== undefined) return values.defaultValue;
        return localValues[elementId] ?? (property === 'checked' ? false : undefined);
      }

      function updateValue(elementId: string, element: UiElement, value: unknown, property = 'value'): void {
        const bindingName = bindingFor(element, property);
        const binding = bindingName ? props.spec.bindings?.[bindingName] : undefined;
        if (!binding || binding.mode !== 'read') {
          localValues[elementId] = value;
        }
        if (binding && binding.mode !== 'read') {
          writePath(state, binding.path, value);
          props.onStateChange?.(binding.path, value, state);
        }
        validateInput(elementId, element, value);
      }

      function validateInput(elementId: string, element: UiElement, value = valueFor(elementId, element)): boolean {
        if (!inputComponents.has(element.component)) return true;
        const values = elementProps(element);
        if (!isUiElementVisible(element.props, state as Record<string, JsonValue>)) return true;
        const messages = validateUiInputBehavior(value as JsonValue | undefined, values, {
          component: element.component,
          path: elementId,
        }).errors;
        inputErrors[elementId] = messages;
        return messages.length === 0;
      }

      function validateAll(): boolean {
        let valid = true;
        for (const [id, element] of Object.entries(props.spec.elements)) {
          if (!inputComponents.has(element.component)) continue;
          touched[id] = true;
          valid = validateInput(id, element) && valid;
        }
        return valid;
      }

      function inputMessagesFor(id: string, element: UiElement): string[] {
        const values = elementProps(element);
        const external = props.inputMessages[id];
        const bindingName = bindingFor(element, 'value');
        const bindingExternal = bindingName ? props.inputMessages[bindingName] : undefined;
        const own = values.messages as UiStatusMessage;
        const messages = [
          ...messageArray(external ?? bindingExternal ?? own),
          ...(touched[id] ? (inputErrors[id] ?? []) : []),
        ];
        if (values.errorMessage && messages.length === 0) messages.push(String(values.errorMessage));
        return messages;
      }

      function isLoading(id: string, element: UiElement): boolean {
        const values = elementProps(element);
        if (values.loading === true) return true;
        if (typeof props.loading === 'boolean') return props.loading;
        return Boolean(props.loading[id] || pendingActions[id]);
      }

      function actionFor(element: UiElement, event: string): string | undefined {
        const actions = element.actions ?? {};
        if (actions[event]) return actions[event];
        if (event === 'click') return actions.press;
        if (event === 'press') return actions.click;
        return undefined;
      }

      function invokeAction(elementId: string, element: UiElement, event: string, payload?: unknown): void {
        const invocationName = actionFor(element, event);
        if (!invocationName) return;
        const invocation = props.spec.actions?.[invocationName];
        if (!invocation) return;
        const action = invocation.action ?? invocation.name;
        if (!action) return;
        if ((event === 'press' || event === 'submit') && !validateAll()) return;
        const context: UiActionContext = {
          action,
          invocation,
          elementId,
          event,
          payload,
          state,
        };
        emit('action', context);
        const handler = props.actionHandlers[action];
        if (!handler) return;
        try {
          const result = handler(context);
          if (result && typeof (result as Promise<unknown>).then === 'function') {
            pendingActions[action] = true;
            Promise.resolve(result).catch((error: unknown) => {
              runtimeError.value = error instanceof Error ? error.message : String(error);
            }).finally(() => {
              pendingActions[action] = false;
            });
          }
        } catch (error) {
          runtimeError.value = error instanceof Error ? error.message : String(error);
        }
      }

      function inputEvents(id: string, element: UiElement, property = 'value'): Record<string, any> {
        return {
          [`onUpdate:modelValue`]: (value: unknown) => {
            updateValue(id, element, value, property);
            invokeAction(id, element, 'change', value);
          },
          onBlur: () => {
            touched[id] = true;
            validateInput(id, element);
            invokeAction(id, element, 'blur');
          },
        };
      }

      function childIds(element: UiElement): string[] {
        return [
          ...(element.children ?? []),
          ...Object.values(element.slots ?? {}).flat(),
        ];
      }

      function renderMessages(messages: string[], tone: 'error' | 'success' | 'info' = 'error', key: string): VNodeChild {
        if (messages.length === 0) return null;
        return h(VAlert, {
          ...dataProps(key, { component: 'Alert' }),
          type: tone,
          variant: 'tonal',
          role: tone === 'error' ? 'alert' : 'status',
          text: messages.join(' '),
        });
      }

      function renderElement(id: string, stack = new Set<string>()): VNodeChild {
        const element = props.spec.elements[id];
        if (!element) return null;
        if (stack.has(id)) throw new UiSpecRenderError(`Cyclic semantic element tree at "${id}".`);
        if (!isUiElementVisible(element.props, state as Record<string, JsonValue>)) return null;
        const nextStack = new Set(stack).add(id);
        const values = elementProps(element);
        const children = childIds(element).map((childId) => renderElement(childId, nextStack));
        const attrs = dataProps(id, { component: element.component });

        switch (element.component as VueVuetifyComponent) {
          case 'Page': {
            const title = values.title ? h('h1', { class: 'ui-page__title' }, String(values.title)) : null;
            const subtitle = values.subtitle ? h('p', { class: 'ui-page__subtitle' }, String(values.subtitle)) : null;
            return h(VContainer, { ...attrs, class: 'ui-page', fluid: values.fluid === true }, {
              default: () => [title, subtitle, ...children],
            });
          }
          case 'Form': {
            const formError = messageArray(values.error ?? props.error ?? runtimeError.value);
            const formSuccess = messageArray(values.success ?? props.success);
            const status = [
              values.title ? h('h2', { class: 'ui-form__title' }, String(values.title)) : null,
              values.description ? h('p', { class: 'ui-form__description' }, String(values.description)) : null,
              renderMessages(formError, 'error', `${id}-error`),
              renderMessages(formSuccess, 'success', `${id}-success`),
            ];
            return h(VForm, {
              ...attrs,
              onSubmit: (event: Event) => {
                event.preventDefault();
                invokeAction(id, element, 'submit', event);
              },
              disabled: isLoading(id, element),
            }, { default: () => [...status, ...children] });
          }
          case 'Stack': {
            const direction = values.direction === 'horizontal' ? 'row' : 'column';
            return h(VContainer, {
              ...attrs,
              class: ['ui-stack', `ui-stack--${direction}`],
              fluid: true,
              style: {
                display: 'flex',
                flexDirection: direction,
                gap: `${typeof values.gap === 'number' ? values.gap : 16}px`,
                alignItems: values.align ?? undefined,
                justifyContent: values.justify ?? undefined,
              },
            }, { default: () => children });
          }
          case 'Text': {
            const tone = values.tone ? `text-${String(values.tone)}` : undefined;
            return h('p', { ...attrs, class: ['ui-text', tone], 'aria-live': values.ariaLive }, String(values.content ?? values.text ?? ''));
          }
          case 'TextInput': {
            const messages = inputMessagesFor(id, element);
            return h(VTextField, {
              ...attrs,
              name: values.name ?? id,
              label: values.label,
              placeholder: values.placeholder,
              type: values.type ?? 'text',
              modelValue: valueFor(id, element),
              disabled: values.disabled === true,
              readonly: values.readonly === true,
              required: values.required === true,
              hint: values.helpText,
              persistentHint: Boolean(values.helpText),
              errorMessages: messages,
              variant: 'outlined',
              density: 'comfortable',
              ...inputEvents(id, element),
            });
          }
          case 'Select': {
            const options = asOptions(values.options ?? values.items);
            return h(VSelect, {
              ...attrs,
              name: values.name ?? id,
              label: values.label,
              placeholder: values.placeholder,
              items: options,
              modelValue: valueFor(id, element),
              disabled: values.disabled === true,
              readonly: values.readonly === true,
              required: values.required === true,
              hint: values.helpText,
              persistentHint: Boolean(values.helpText),
              errorMessages: inputMessagesFor(id, element),
              variant: 'outlined',
              density: 'comfortable',
              ...inputEvents(id, element),
            });
          }
          case 'ChoiceGroup': {
            const options = asOptions(values.options ?? values.items);
            const radios = options.map((option) => h(VRadio, {
              label: option.title,
              value: option.value,
              key: String(option.value),
            }));
            return h(VRadioGroup, {
              ...attrs,
              name: values.name ?? id,
              label: values.label,
              modelValue: valueFor(id, element),
              disabled: values.disabled === true,
              readonly: values.readonly === true,
              errorMessages: inputMessagesFor(id, element),
              hint: values.helpText,
              persistentHint: Boolean(values.helpText),
              inline: values.direction === 'horizontal',
              ...inputEvents(id, element),
            }, { default: () => radios });
          }
          case 'Checkbox': {
            const messages = inputMessagesFor(id, element);
            return h(VCheckbox, {
              ...attrs,
              name: values.name ?? id,
              label: values.label,
              modelValue: valueFor(id, element, 'checked'),
              disabled: values.disabled === true,
              readonly: values.readonly === true,
              required: values.required === true,
              errorMessages: messages,
              hint: values.helpText,
              persistentHint: Boolean(values.helpText),
              ...inputEvents(id, element, 'checked'),
            });
          }
          case 'Button': {
            const variant = values.variant === 'primary' || values.variant === undefined ? 'elevated' : values.variant === 'danger' ? 'flat' : values.variant;
            return h(VBtn, {
              ...attrs,
              type: values.type ?? 'button',
              color: values.variant === 'danger' ? 'error' : values.variant === 'primary' ? 'primary' : undefined,
              variant,
              disabled: values.disabled === true,
              loading: isLoading(id, element),
              onClick: (event: MouseEvent) => invokeAction(id, element, 'press', event),
            }, { default: () => String(values.label ?? values.text ?? '') });
          }
          case 'Alert': {
            if (dismissedAlerts[id]) return null;
            const tone = ['info', 'success', 'warning', 'error'].includes(String(values.tone)) ? String(values.tone) : 'info';
            return h(VAlert as any, {
              ...attrs,
              type: tone,
              title: values.title,
              text: String(values.message ?? values.text ?? ''),
              closable: values.dismissible === true,
              variant: 'tonal',
              onClickClose: () => { dismissedAlerts[id] = true; },
            });
          }
          default:
            throw new UiSpecRenderError(`Unknown semantic component "${element.component}" at element "${id}".`);
        }
      }

      const root = computed(() => renderElement(props.spec.root));
      expose({ state, validate: validateAll, getValue: (path: string) => readPath(state, path) } satisfies VueVuetifyRendererExposed);
      return () => root.value;
    },
  });
}

export const VueVuetifyUiSpecRenderer = createVueVuetifyRenderer();
export const VueVuetifyRenderer = VueVuetifyUiSpecRenderer;
export const UiSpecRenderer = VueVuetifyUiSpecRenderer;
