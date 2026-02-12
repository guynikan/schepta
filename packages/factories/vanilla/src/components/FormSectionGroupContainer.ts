/**
 * Vanilla FormSectionGroupContainer Component
 */

export interface FormSectionGroupContainerProps {
  children?: any[];
}

export function createFormSectionGroupContainer(props: FormSectionGroupContainerProps): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'grid';
  wrapper.style.gridTemplateColumns = 'repeat(2, 1fr)';
  wrapper.style.gap = '16px';
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
