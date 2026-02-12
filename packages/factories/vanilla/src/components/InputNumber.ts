/**
 * Vanilla InputNumber Component
 */

export interface InputNumberProps {
  name: string;
  value?: string | number;
  onChange?: (value: number | string) => void;
  label?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number | string;
  required?: boolean;
  disabled?: boolean;
  'data-test-id'?: string;
}

export function createInputNumber(props: InputNumberProps): HTMLElement {
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
  input.type = 'number';
  input.id = props.name;
  input.name = props.name;
  input.value = props.value?.toString() || '';
  input.placeholder = props.placeholder || '';
  input.required = props.required || false;
  input.disabled = props.disabled || false;
  input.setAttribute('data-test-id', props['data-test-id'] || props.name);
  
  if (props.min !== undefined) input.min = props.min.toString();
  if (props.max !== undefined) input.max = props.max.toString();
  if (props.step !== undefined) input.step = props.step.toString();
  
  input.style.width = '100%';
  input.style.padding = '8px';
  input.style.border = '1px solid var(--schepta-border)';
  input.style.borderRadius = '4px';
  input.style.fontSize = '14px';
  
  input.addEventListener('input', (e) => {
    const raw = (e.target as HTMLInputElement).value;
    const val = raw ? Number(raw) : '';
    props.onChange?.(val);
  });
  
  wrapper.appendChild(input);
  return wrapper;
}
