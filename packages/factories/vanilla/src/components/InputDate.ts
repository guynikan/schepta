/**
 * Vanilla InputDate Component
 */

export interface InputDateProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  'data-test-id'?: string;
}

export function createInputDate(props: InputDateProps): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.marginBottom = '16px';
  
  if (props.label) {
    const label = document.createElement('label');
    label.textContent = props.label;
    label.htmlFor = props.name;
    label.style.display = 'block';
    label.style.marginBottom = '4px';
    label.style.fontWeight = '500';
    wrapper.appendChild(label);
  }
  
  const input = document.createElement('input');
  input.type = 'date';
  input.id = props.name;
  input.name = props.name;
  input.value = props.value || '';
  input.placeholder = props.placeholder || '';
  input.required = props.required || false;
  input.disabled = props.disabled || false;
  input.setAttribute('data-test-id', props['data-test-id'] || props.name);
  
  input.style.width = '100%';
  input.style.padding = '8px';
  input.style.border = '1px solid #ccc';
  input.style.borderRadius = '4px';
  input.style.fontSize = '14px';
  
  input.addEventListener('input', (e) => {
    props.onChange?.((e.target as HTMLInputElement).value);
  });
  
  wrapper.appendChild(input);
  return wrapper;
}
