/**
 * Vanilla InputAutocomplete Component
 */

export interface InputAutocompleteOption {
  value: string;
  label?: string;
}

export interface InputAutocompleteProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  options?: InputAutocompleteOption[] | string[];
  required?: boolean;
  disabled?: boolean;
  'data-test-id'?: string;
}

function normalizeOptions(
  options: InputAutocompleteOption[] | string[] = []
): { value: string; label: string }[] {
  return options.map((opt) =>
    typeof opt === 'string'
      ? { value: opt, label: opt }
      : { value: opt.value, label: opt.label ?? opt.value }
  );
}

export function createInputAutocomplete(props: InputAutocompleteProps): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.marginBottom = '16px';
  
  const listId = `${props.name}-datalist`;
  const normalizedOptions = normalizeOptions(props.options || []);
  
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
  input.id = props.name;
  input.name = props.name;
  input.value = props.value || '';
  input.placeholder = props.placeholder || '';
  input.required = props.required || false;
  input.disabled = props.disabled || false;
  input.setAttribute('data-test-id', props['data-test-id'] || props.name);
  input.setAttribute('list', listId);
  
  input.style.width = '100%';
  input.style.padding = '8px';
  input.style.border = '1px solid var(--schepta-border)';
  input.style.borderRadius = '4px';
  input.style.fontSize = '14px';
  
  input.addEventListener('input', (e) => {
    props.onChange?.((e.target as HTMLInputElement).value);
  });
  
  const datalist = document.createElement('datalist');
  datalist.id = listId;
  
  normalizedOptions.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    datalist.appendChild(option);
  });
  
  wrapper.appendChild(input);
  wrapper.appendChild(datalist);
  return wrapper;
}
