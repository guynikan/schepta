/**
 * Vanilla FormSectionTitle Component
 */

export interface FormSectionTitleProps {
  title?: string;
  children?: any[];
}

export function createFormSectionTitle(props: FormSectionTitleProps): HTMLElement {
  const heading = document.createElement('h3');
  heading.textContent = props.title || '';
  heading.style.fontSize = '1.25rem';
  heading.style.fontWeight = '600';
  heading.style.marginTop = '0';
  heading.style.marginBottom = '16px';
  heading.style.color = '#111827';
  
  return heading;
}
