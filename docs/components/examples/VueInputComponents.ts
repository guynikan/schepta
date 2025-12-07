import { defineComponent, h } from 'vue';
import { createComponentSpec } from '@spectra/core';

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
    modelValue: String,
    placeholder: String,
    options: Array,
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
      const checked = target.checked;
      emit('update:modelValue', checked);
      if (props.onChange) {
        props.onChange(checked);
      }
    };
    
    return () => h('div', { style: { marginBottom: '16px' } }, [
      h('label', { 
        style: { display: 'flex', alignItems: 'center', gap: '8px' }
      }, [
        h('input', {
          type: 'checkbox',
          id: props.name,
          name: props.name,
          'data-test-id': props.name,
          checked: props.modelValue !== undefined ? props.modelValue : (props.checked || false),
          onChange: handleChange,
        }),
        props.label ? h('span', props.label) : null
      ])
    ]);
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
      const children = props.children || slots.default?.();
      
      return h('form', {
        onSubmit: (e: Event) => {
          e.preventDefault();
          if (onSubmit) {
            onSubmit();
          }
        },
        style: { maxWidth: '600px', margin: '0 auto' }
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
  'form-container': createComponentSpec({
    id: 'form-container',
    type: 'form-container',
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

