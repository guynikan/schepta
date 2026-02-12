/**
 * Vanilla FormField Component
 */

export interface FormFieldProps {
  children?: any[];
}

export function createFormField(props: FormFieldProps): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.marginBottom = '16px';
  
  // Render children
  if (props.children) {
    props.children.forEach(child => {
      if (child && typeof child === 'object') {
        if ('element' in child && child.element instanceof HTMLElement) {
          wrapper.appendChild(child.element);
        } else if (child instanceof HTMLElement) {
          wrapper.appendChild(child);
        }
      }
    });
  }
  
  return wrapper;
}
