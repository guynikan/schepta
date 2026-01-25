import { defineComponent, h } from 'vue';
import { createComponentSpec } from '@schepta/core';

// Input Text Component
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
    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const value = target.value;
      emit('update:modelValue', value);
      if (props.onChange) {
        props.onChange(value);
      }
    };
    
    return () => h('div', { style: { marginBottom: '16px' } }, [
      props.label ? h('label', { 
        for: props.name,
        style: { display: 'block', marginBottom: '4px', fontWeight: '500' }
      }, props.label) : null,
      h('input', {
        id: props.name,
        name: props.name,
        'data-test-id': props.name,
        value: props.modelValue !== undefined ? props.modelValue : (props.value || ''),
        placeholder: props.placeholder,
        onInput: handleInput,
        style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }
      })
    ]);
  }
});

// Input Select Component
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
    const handleChange = (e: Event) => {
      const target = e.target as HTMLSelectElement;
      const value = target.value;
      emit('update:modelValue', value);
      if (props.onChange) {
        props.onChange(value);
      }
    };
    
    return () => h('div', { style: { marginBottom: '16px' } }, [
      props.label ? h('label', { 
        for: props.name,
        style: { display: 'block', marginBottom: '4px', fontWeight: '500' }
      }, props.label) : null,
      h('select', {
        id: props.name,
        name: props.name,
        'data-test-id': props.name,
        value: props.modelValue !== undefined ? props.modelValue : (props.value || ''),
        onChange: handleChange,
        style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }
      }, [
        h('option', { value: '' }, props.placeholder || 'Select...'),
        ...((props.options as any[]) || []).map((opt: any) => 
          h('option', { key: opt.value, value: opt.value }, opt.label)
        )
      ])
    ]);
  }
});

// Input Checkbox Component
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
    const handleChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const value = target.checked;
      emit('update:modelValue', value);
      if (props.onChange) {
        props.onChange(value);
      }
    };
    
    return () => h('div', { style: { marginBottom: '16px' } }, [
      h('label', { 
        style: { display: 'flex', alignItems: 'center', gap: '8px' }
      }, [
        h('input', {
          type: 'checkbox',
          name: props.name,
          'data-test-id': props.name,
          checked: props.modelValue !== undefined ? props.modelValue : (props.checked || false),
          onChange: handleChange
        }),
        props.label
      ])
    ]);
  }
});

// Input Textarea Component
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
    const handleInput = (e: Event) => {
      const target = e.target as HTMLTextAreaElement;
      const value = target.value;
      emit('update:modelValue', value);
      if (props.onChange) {
        props.onChange(value);
      }
    };
    
    return () => h('div', { style: { marginBottom: '16px' } }, [
      props.label ? h('label', { 
        for: props.name,
        style: { display: 'block', marginBottom: '4px', fontWeight: '500' }
      }, props.label) : null,
      h('textarea', {
        id: props.name,
        name: props.name,
        'data-test-id': props.name,
        value: props.modelValue !== undefined ? props.modelValue : (props.value || ''),
        placeholder: props.placeholder,
        rows: props.rows || 4,
        onInput: handleInput,
        style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'inherit' }
      })
    ]);
  }
});

// Input Number Component
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
    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const value = target.value ? Number(target.value) : '';
      emit('update:modelValue', value);
      if (props.onChange) {
        props.onChange(value);
      }
    };
    
    return () => h('div', { style: { marginBottom: '16px' } }, [
      props.label ? h('label', { 
        for: props.name,
        style: { display: 'block', marginBottom: '4px', fontWeight: '500' }
      }, props.label) : null,
      h('input', {
        type: 'number',
        id: props.name,
        name: props.name,
        'data-test-id': props.name,
        value: props.modelValue !== undefined ? props.modelValue : (props.value || ''),
        placeholder: props.placeholder,
        min: props.min,
        max: props.max,
        step: props.step,
        onInput: handleInput,
        style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }
      })
    ]);
  }
});

// Input Date Component
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
    const handleChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const value = target.value;
      emit('update:modelValue', value);
      if (props.onChange) {
        props.onChange(value);
      }
    };
    
    return () => h('div', { style: { marginBottom: '16px' } }, [
      props.label ? h('label', { 
        for: props.name,
        style: { display: 'block', marginBottom: '4px', fontWeight: '500' }
      }, props.label) : null,
      h('input', {
        type: 'date',
        id: props.name,
        name: props.name,
        'data-test-id': props.name,
        value: props.modelValue !== undefined ? props.modelValue : (props.value || ''),
        onChange: handleChange,
        style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }
      })
    ]);
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
      style: { marginBottom: '16px', fontSize: '20px', fontWeight: '600', color: '#333' }
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
  },
  setup(props, { slots }) {
    // Get columns from x-component-props or direct prop
    const columns = props.columns || (props['x-component-props'] as any)?.columns || '1fr 1fr';
    return () => h('div', { 
      style: { 
        display: 'grid', 
        gridTemplateColumns: columns, 
        gap: '16px' 
      } 
    }, slots.default?.());
  }
});

export const FormContainer = defineComponent({
  name: 'FormContainer',
  props: {
    externalContext: Object,
    children: Array,
  },
  setup(props, { slots }) {
    const onSubmit = (props.externalContext as any)?.onSubmit;
    
    return () => {
      // Use children prop if provided, otherwise use slots
      const children = props.children || slots.default?.();
      
      return h('form', {
        onSubmit: (e: Event) => {
          e.preventDefault();
          if (onSubmit) {
            onSubmit();
          }
        }
      }, children);
    };
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
      style: { marginTop: '24px', textAlign: 'right' }
    }, [
      h('button', {
        type: 'button',
        onClick: handleClick,
        style: {
          padding: '12px 24px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500',
        }
      }, props['x-content'] || slots.default?.() || 'Submit')
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
