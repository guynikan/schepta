/**
 * Vanilla FormSectionGroup Component
 */

export interface FormSectionGroupProps {
  children?: any[];
}

export function createFormSectionGroup(props: FormSectionGroupProps): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.gap = '8px';
  
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
