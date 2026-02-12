/**
 * Default Submit Button Component for Vanilla JS
 * 
 * Built-in submit button for forms. Can be overridden via createComponentSpec.
 */

/**
 * Props for SubmitButton component.
 * Use this type when creating a custom SubmitButton.
 */
export interface SubmitButtonProps {
  /** Submit handler - triggers form submission */
  onSubmit: () => void;
}

/**
 * Factory function type for custom SubmitButton.
 */
export type SubmitButtonFactory = (props: SubmitButtonProps) => HTMLElement;

/**
 * Creates a default submit button element.
 * Can be overridden via components prop or ScheptaProvider.
 */
export function createDefaultSubmitButton(props: SubmitButtonProps): HTMLElement {
  const container = document.createElement('div');
  container.style.marginTop = '24px';
  container.style.textAlign = 'right';

  const button = document.createElement('button');
  button.type = 'submit';
  button.textContent = 'Submit';
  button.dataset.testId = 'submit-button';
  button.style.padding = '12px 24px';
  button.style.backgroundColor = '#007bff';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  button.style.fontSize = '16px';
  button.style.fontWeight = '500';

  container.appendChild(button);
  return container;
}
