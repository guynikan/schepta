export interface SubmitButtonProps {
  onSubmit: () => void;
}

export function createSubmitButton(props: SubmitButtonProps): HTMLElement {
  const button = document.createElement('button');
  button.type = 'submit';
  button.textContent = 'Submit';
  button.dataset.testId = 'submit-button-complex-form';
  button.style.padding = '12px 24px';
  button.style.backgroundColor = 'var(--schepta-brand)';
  button.style.color = 'var(--schepta-brand-text)';
  button.style.border = 'none';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  button.addEventListener('click', props.onSubmit);
  return button;
}