/**
 * Vanilla FormSectionContainer Component
 */

export interface FormSectionContainerProps {
  children?: any[];
}

export function createFormSectionContainer(props: FormSectionContainerProps): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.marginBottom = '24px';
  wrapper.style.padding = '20px';
  wrapper.style.border = '1px solid #e5e7eb';
  wrapper.style.borderRadius = '8px';
  wrapper.style.background = '#fff';
  
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
