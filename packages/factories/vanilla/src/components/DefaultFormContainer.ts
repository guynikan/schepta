/**
 * Default Form Container Component for Vanilla JS
 * 
 * Built-in form container that wraps children in a <form> tag
 * and renders a submit button. Can be overridden via createComponentSpec.
 */

import { createDefaultSubmitButton, type SubmitButtonFactory } from './DefaultSubmitButton';

/**
 * Props for FormContainer component.
 * Use this type when creating a custom FormContainer.
 */
export interface FormContainerProps {
  /** Child elements to render inside the form */
  children?: HTMLElement[];
  /** Submit handler - when provided, renders a submit button */
  onSubmit?: () => void;
  /** External context passed from FormFactory */
  externalContext?: Record<string, any>;
  /** 
   * Custom SubmitButton factory - resolved by FormFactory from registry.
   * If not provided, uses createDefaultSubmitButton.
   */
  createSubmitButton?: SubmitButtonFactory;
}

/**
 * Creates a default form container element.
 * 
 * Renders children inside a <form> tag with an optional submit button.
 * 
 * - When `onSubmit` is provided: renders submit button inside the form
 * - When `onSubmit` is NOT provided: no submit button (for external submit via formRef)
 * 
 * @example
 * ```ts
 * const form = createDefaultFormContainer({
 *   children: [inputElement, selectElement],
 *   onSubmit: () => console.log('submitted'),
 * });
 * container.appendChild(form);
 * ```
 */
export function createDefaultFormContainer(props: FormContainerProps): HTMLElement {
  const form = document.createElement('form');
  form.dataset.testId = 'FormContainer';
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    props.onSubmit?.();
  });

  // Append children
  props.children?.forEach(child => form.appendChild(child));
  
  // Add submit button if onSubmit is provided
  if (props.onSubmit) {
    const submitButton = createDefaultSubmitButton({ onSubmit: props.onSubmit });
    form.appendChild(submitButton);
  }

  return form;
}
