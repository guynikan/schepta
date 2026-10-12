/**
 * Vanilla InputTextarea Component
 */

import { toSafeText } from '@schepta/core';

export interface InputTextareaProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  'data-test-id'?: string;
}

export function createInputTextarea(props: InputTextareaProps): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.marginBottom = '16px';
  
  const labelText = toSafeText(props.label);
  if (labelText) {
    const label = document.createElement('label');
    label.textContent = labelText;
    label.htmlFor = props.name;
    label.style.display = 'block';
    label.style.marginBottom = '4px';
    label.style.fontWeight = '500';
    wrapper.appendChild(label);
  }
  
  const textarea = document.createElement('textarea');
  textarea.id = props.name;
  textarea.name = props.name;
  textarea.value = props.value || '';
  textarea.placeholder = props.placeholder || '';
  textarea.rows = props.rows || 4;
  textarea.required = props.required || false;
  textarea.disabled = props.disabled || false;
  textarea.setAttribute('data-test-id', props['data-test-id'] || props.name);
  
  textarea.style.width = '100%';
  textarea.style.padding = '8px';
  textarea.style.border = '1px solid var(--schepta-border)';
  textarea.style.borderRadius = '4px';
  textarea.style.fontSize = '14px';
  textarea.style.fontFamily = 'inherit';
  textarea.style.resize = 'vertical';
  
  textarea.addEventListener('input', (e) => {
    props.onChange?.((e.target as HTMLTextAreaElement).value);
  });
  
  wrapper.appendChild(textarea);
  return wrapper;
}
