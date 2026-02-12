/**
 * Vanilla InputSelect Component
 */

export interface InputSelectOption {
  value: string;
  label: string;
}

export interface InputSelectProps {
  name: string;
  value?: string | number;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  options?: InputSelectOption[];
  required?: boolean;
  disabled?: boolean;
  'data-test-id'?: string;
}

export function createInputSelect(props: InputSelectProps): HTMLElement {
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
  
  const select = document.createElement('select');
  select.id = props.name;
  select.name = props.name;
  select.value = props.value?.toString() || '';
  select.required = props.required || false;
  select.disabled = props.disabled || false;
  select.setAttribute('data-test-id', props['data-test-id'] || props.name);
  
  select.style.width = '100%';
  select.style.padding = '8px';
  select.style.border = '1px solid var(--schepta-border)';
  select.style.borderRadius = '4px';
  select.style.fontSize = '14px';
  
  // Add placeholder option
  const placeholderOption = document.createElement('option');
  placeholderOption.value = '';
  placeholderOption.textContent = props.placeholder || 'Select...';
  select.appendChild(placeholderOption);
  
  // Add options
  (props.options || []).forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    if (opt.value === props.value) {
      option.selected = true;
    }
    select.appendChild(option);
  });
  
  select.addEventListener('change', (e) => {
    props.onChange?.((e.target as HTMLSelectElement).value);
  });
  
  wrapper.appendChild(select);
  return wrapper;
}
