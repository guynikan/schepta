import { defineComponent, h } from 'vue';
import { createComponentSpec } from '@schepta/core';
import {
  VTextField,
  VSelect,
  VCheckbox,
  VTextarea,
  VBtn,
  VContainer,
  VRow,
  VCol,
} from 'vuetify/components';

// Input Text Component using Vuetify
export const InputText = defineComponent({
  name: 'InputText',
  props: {
    label: String,
    name: String,
    value: [String, Number],
    placeholder: String,
    modelValue: [String, Number],
    onChange: Function,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h(VTextField, {
      label: props.label,
      name: props.name,
      'data-test-id': props.name,
      modelValue: props.modelValue !== undefined ? props.modelValue : (props.value || ''),
      placeholder: props.placeholder,
      'onUpdate:modelValue': (value: any) => {
        emit('update:modelValue', value);
        if (props.onChange) {
          props.onChange(value);
        }
      },
      density: 'default',
      variant: 'outlined',
    });
  }
});

// Input Select Component using Vuetify
export const InputSelect = defineComponent({
  name: 'InputSelect',
  props: {
    label: String,
    name: String,
    value: String,
    placeholder: String,
    options: Array,
    modelValue: String,
    onChange: Function,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const items = (props.options as any[]) || [];
    
    return () => h(VSelect, {
      label: props.label,
      name: props.name,
      'data-test-id': props.name,
      modelValue: props.modelValue !== undefined ? props.modelValue : (props.value || ''),
      items: items.map((opt: any) => ({ title: opt.label, value: opt.value })),
      placeholder: props.placeholder,
      'onUpdate:modelValue': (value: any) => {
        emit('update:modelValue', value);
        if (props.onChange) {
          props.onChange(value);
        }
      },
      density: 'default',
      variant: 'outlined',
    });
  }
});

// Input Checkbox Component using Vuetify
export const InputCheckbox = defineComponent({
  name: 'InputCheckbox',
  props: {
    label: String,
    name: String,
    checked: Boolean,
    modelValue: Boolean,
    onChange: Function,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h(VCheckbox, {
      name: props.name,
      'data-test-id': props.name,
      modelValue: props.modelValue !== undefined ? props.modelValue : (props.checked || false),
      label: props.label,
      'onUpdate:modelValue': (value: any) => {
        emit('update:modelValue', value);
        if (props.onChange) {
          props.onChange(value);
        }
      },
      density: 'default',
    });
  }
});

// Input Textarea Component using Vuetify
export const InputTextarea = defineComponent({
  name: 'InputTextarea',
  props: {
    label: String,
    name: String,
    value: String,
    placeholder: String,
    rows: Number,
    modelValue: String,
    onChange: Function,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h(VTextarea, {
      label: props.label,
      name: props.name,
      'data-test-id': props.name,
      modelValue: props.modelValue !== undefined ? props.modelValue : (props.value || ''),
      placeholder: props.placeholder,
      rows: props.rows || 4,
      'onUpdate:modelValue': (value: any) => {
        emit('update:modelValue', value);
        if (props.onChange) {
          props.onChange(value);
        }
      },
      density: 'default',
      variant: 'outlined',
    });
  }
});

// Input Number Component using Vuetify
export const InputNumber = defineComponent({
  name: 'InputNumber',
  props: {
    label: String,
    name: String,
    value: Number,
    placeholder: String,
    min: Number,
    max: Number,
    step: Number,
    modelValue: Number,
    onChange: Function,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h(VTextField, {
      label: props.label,
      name: props.name,
      'data-test-id': props.name,
      type: 'number',
      modelValue: props.modelValue !== undefined ? props.modelValue : (props.value || ''),
      placeholder: props.placeholder,
      min: props.min,
      max: props.max,
      step: props.step,
      'onUpdate:modelValue': (value: any) => {
        emit('update:modelValue', value ? Number(value) : '');
        if (props.onChange) {
          props.onChange(value ? Number(value) : '');
        }
      },
      density: 'default',
      variant: 'outlined',
    });
  }
});

// Input Date Component using Vuetify
export const InputDate = defineComponent({
  name: 'InputDate',
  props: {
    label: String,
    name: String,
    value: String,
    modelValue: String,
    onChange: Function,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h(VTextField, {
      label: props.label,
      name: props.name,
      'data-test-id': props.name,
      type: 'date',
      modelValue: props.modelValue !== undefined ? props.modelValue : (props.value || ''),
      'onUpdate:modelValue': (value: any) => {
        emit('update:modelValue', value);
        if (props.onChange) {
          props.onChange(value);
        }
      },
      density: 'default',
      variant: 'outlined',
    });
  }
});

// Input Phone Component
export const InputPhone = defineComponent({
  name: 'InputPhone',
  setup(props: any, { emit }) {
    return () => h(InputText, { ...props, type: 'tel' });
  }
});

// Container Components
export const FormField = defineComponent({
  name: 'FormField',
  setup(props, { slots }) {
    return () => h('div', props, slots.default?.());
  }
});

export const FormSectionContainer = defineComponent({
  name: 'FormSectionContainer',
  setup(props, { slots }) {
    return () => h('div', { ...props, style: { marginBottom: '24px', ...props.style } }, slots.default?.());
  }
});

export const FormSectionTitle = defineComponent({
  name: 'FormSectionTitle',
  props: {
    'x-content': String,
  },
  setup(props, { slots }) {
    return () => h('h2', { 
      class: 'text-h5 mb-4',
      style: { fontWeight: '600' }
    }, props['x-content'] || slots.default?.());
  }
});

export const FormSectionGroupContainer = defineComponent({
  name: 'FormSectionGroupContainer',
  setup(props, { slots }) {
    return () => h('div', props, slots.default?.());
  }
});

export const FormSectionGroup = defineComponent({
  name: 'FormSectionGroup',
  props: {
    'x-component-props': Object,
    columns: String,
    children: Array,
  },
  setup(props, { slots }) {
    const columns = props.columns || (props['x-component-props'] as any)?.columns || '1fr 1fr';
    const gridColumns = columns === '1fr' ? 12 : 6;
    
    return () => {
      // Get children from props or slots
      const children = props.children || slots.default?.();
      
      // VRow and VCol need children as function for slots
      return h(VRow, { 
        props: { dense: false }
      }, () => 
        (Array.isArray(children) ? children : [children]).map((child: any, index: number) => 
          h(VCol, { key: index, cols: 12, sm: gridColumns }, () => [child])
        )
      );
    };
  }
});

export const FormContainer = defineComponent({
  name: 'FormContainer',
  props: {
    externalContext: Object,
  },
  setup(props, { slots }) {
    const onSubmit = (props.externalContext as any)?.onSubmit;
    
    return () => h('form', {
      onSubmit: (e: Event) => {
        e.preventDefault();
        if (onSubmit) {
          onSubmit();
        }
      }
    }, slots.default?.());
  }
});

export const SubmitButton = defineComponent({
  name: 'SubmitButton',
  props: {
    'x-content': String,
    externalContext: Object,
  },
  setup(props, { slots }) {
    const onSubmit = (props.externalContext as any)?.onSubmit;
    
    const handleClick = () => {
      if (onSubmit) {
        onSubmit();
      }
    };
    
    return () => h('div', { 
      class: 'mt-6 d-flex justify-end'
    }, [
      h(VBtn, {
        color: 'primary',
        size: 'large',
        onClick: handleClick,
      }, () => props['x-content'] || slots.default?.() || 'Submit')
    ]);
  }
});

// Create component specs
export const components = {
  'FormContainer': createComponentSpec({
    id: 'FormContainer',
    type: 'FormContainer',
    factory: () => FormContainer,
  }),
  InputText: createComponentSpec({
    id: 'InputText',
    type: 'field',
    factory: () => InputText,
  }),
  InputSelect: createComponentSpec({
    id: 'InputSelect',
    type: 'field',
    factory: () => InputSelect,
  }),
  InputCheckbox: createComponentSpec({
    id: 'InputCheckbox',
    type: 'field',
    factory: () => InputCheckbox,
  }),
  InputPhone: createComponentSpec({
    id: 'InputPhone',
    type: 'field',
    factory: () => InputPhone,
  }),
  InputTextarea: createComponentSpec({
    id: 'InputTextarea',
    type: 'field',
    factory: () => InputTextarea,
  }),
  InputNumber: createComponentSpec({
    id: 'InputNumber',
    type: 'field',
    factory: () => InputNumber,
  }),
  InputDate: createComponentSpec({
    id: 'InputDate',
    type: 'field',
    factory: () => InputDate,
  }),
  SubmitButton: createComponentSpec({
    id: 'SubmitButton',
    type: 'content',
    factory: () => SubmitButton,
  }),
  FormField: createComponentSpec({
    id: 'FormField',
    type: 'container',
    factory: () => FormField,
  }),
  FormSectionContainer: createComponentSpec({
    id: 'FormSectionContainer',
    type: 'container',
    factory: () => FormSectionContainer,
  }),
  FormSectionTitle: createComponentSpec({
    id: 'FormSectionTitle',
    type: 'content',
    factory: () => FormSectionTitle,
  }),
  FormSectionGroupContainer: createComponentSpec({
    id: 'FormSectionGroupContainer',
    type: 'container',
    factory: () => FormSectionGroupContainer,
  }),
  FormSectionGroup: createComponentSpec({
    id: 'FormSectionGroup',
    type: 'container',
    factory: () => FormSectionGroup,
  }),
};

