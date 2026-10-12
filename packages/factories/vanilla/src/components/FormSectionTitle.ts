/**
 * Vanilla FormSectionTitle Component
 */

export interface FormSectionTitleProps {
  'x-content'?: string;
  title?: string;
  children?: any[];
}

export function createFormSectionTitle(props: FormSectionTitleProps): HTMLElement {
  const heading = document.createElement('h3');
  heading.textContent = props['x-content'] ?? props.title ?? '';
  heading.style.fontSize = '1.25rem';
  heading.style.fontWeight = '600';
  heading.style.marginTop = '0';
  heading.style.marginBottom = '16px';
  heading.style.color = 'var(--schepta-text-1)';
  
  return heading;
}
