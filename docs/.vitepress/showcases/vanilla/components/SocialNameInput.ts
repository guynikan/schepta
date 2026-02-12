/**
 * Custom Social Name Input Component for Vanilla
 */

export interface SocialNameInputProps {
  name: string;
  schema: any;
  externalContext: {
    openSocialName: boolean;
    setOpenSocialName: (value: boolean) => void;
  };
  value?: string;
  onChange?: (value: string) => void;
}

export function createSocialNameInput(props: SocialNameInputProps): HTMLElement {
  const { name, schema, externalContext, value, onChange } = props;
  const label = schema?.['x-component-props']?.label || 'Social Name';
  const placeholder = schema?.['x-component-props']?.placeholder || '';
  
  const wrapper = document.createElement('div');
  wrapper.style.marginBottom = '16px';
  wrapper.style.gridColumn = '1 / -1';
  
  // Toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.setAttribute('data-test-id', 'social-name-toggle');
  toggleBtn.style.background = 'none';
  toggleBtn.style.border = 'none';
  toggleBtn.style.color = '#2563eb';
  toggleBtn.style.cursor = 'pointer';
  toggleBtn.style.padding = '0';
  toggleBtn.style.fontSize = '14px';
  toggleBtn.style.fontWeight = '500';
  
  const updateToggleText = () => {
    toggleBtn.textContent = externalContext.openSocialName 
      ? `- Remove ${label}` 
      : `+ Add ${label}`;
  };
  updateToggleText();
  
  // Input container
  const inputContainer = document.createElement('div');
  inputContainer.style.marginTop = '8px';
  inputContainer.style.width = '49%';
  inputContainer.style.display = externalContext.openSocialName ? 'block' : 'none';
  
  // Label
  const inputLabel = document.createElement('label');
  inputLabel.textContent = label;
  inputLabel.style.display = 'block';
  inputLabel.style.marginBottom = '4px';
  inputLabel.style.fontSize = '14px';
  inputLabel.style.fontWeight = '500';
  
  // Input
  const input = document.createElement('input');
  input.type = 'text';
  input.name = name;
  input.value = value || '';
  input.placeholder = placeholder;
  input.setAttribute('data-test-id', 'social-name-input');
  input.style.display = 'block';
  input.style.width = '100%';
  input.style.padding = '8px 12px';
  input.style.border = '1px solid #d1d5db';
  input.style.borderRadius = '4px';
  input.style.fontSize = '14px';
  
  input.addEventListener('input', (e) => {
    onChange?.((e.target as HTMLInputElement).value);
  });
  
  inputContainer.appendChild(inputLabel);
  inputContainer.appendChild(input);
  
  // Toggle behavior
  toggleBtn.addEventListener('click', () => {
    const newValue = !externalContext.openSocialName;
    externalContext.setOpenSocialName(newValue);
    inputContainer.style.display = externalContext.openSocialName ? 'block' : 'none';
    updateToggleText();
  });
  
  wrapper.appendChild(toggleBtn);
  wrapper.appendChild(inputContainer);
  
  return wrapper;
}
