/**
 * DOM element wrapper
 */
export interface DOMElement {
  element: HTMLElement;
  children: DOMElement[];
  props: Record<string, any>;
}

