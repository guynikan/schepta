/**
 * Vanilla InputCheckbox Component
 */

export interface InputCheckboxProps {
  name: string;
  value?: boolean | string;
  onChange?: (value: boolean) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  'data-test-id'?: string;
}

export function createInputCheckbox(props: InputCheckboxProps): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.marginBottom = '16px';
  
  const labelContainer = document.createElement('label');
  labelContainer.style.display = 'flex';
  labelContainer.style.alignItems = 'center';
  labelContainer.style.gap = '8px';
  labelContainer.style.cursor = 'pointer';
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.name = props.name;
  checkbox.checked = props.value === true || props.value === 'true';
  checkbox.required = props.required || false;
  checkbox.disabled = props.disabled || false;
  checkbox.setAttribute('data-test-id', props['data-test-id'] || props.name);
  
  checkbox.addEventListener('change', (e) => {
    props.onChange?.((e.target as HTMLInputElement).checked);
  });
  
  labelContainer.appendChild(checkbox);
  
  if (props.label) {
    const labelText = document.createTextNode(props.label);
    labelContainer.appendChild(labelText);
  }
  
  wrapper.appendChild(labelContainer);
  return wrapper;
}
