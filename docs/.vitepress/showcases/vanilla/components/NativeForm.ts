/**
 * Native Simple Form for Vanilla
 */

import type { FormSchema } from '@schepta/core';
import { createFormFactory, type FormFactoryResult } from '@schepta/factory-vanilla';

export function createNativeForm(container: HTMLElement, schema: FormSchema): FormFactoryResult {
  const wrapper = document.createElement('div');
  wrapper.style.border = '1px solid #ddd';
  wrapper.style.padding = '24px';
  wrapper.style.borderRadius = '8px';
  
  const factory = createFormFactory({
    schema,
    container: wrapper,
    onSubmit: (values) => {
      console.log('Form submitted:', values);
      displaySubmittedValues(container, values);
    },
    debug: true,
  });
  
  container.appendChild(wrapper);
  return factory;
}

function displaySubmittedValues(container: HTMLElement, values: any) {
  let resultsDiv = container.querySelector('.submitted-values') as HTMLElement;
  if (!resultsDiv) {
    resultsDiv = document.createElement('div');
    resultsDiv.className = 'submitted-values';
    resultsDiv.style.marginTop = '24px';
    resultsDiv.style.padding = '16px';
    resultsDiv.style.background = '#f9fafb';
    resultsDiv.style.border = '1px solid #e5e7eb';
    resultsDiv.style.borderRadius = '8px';
    container.appendChild(resultsDiv);
  }
  
  resultsDiv.innerHTML = `
    <h3 style="margin-top: 0; margin-bottom: 12px;">Submitted Values:</h3>
    <pre style="background: white; padding: 12px; border-radius: 4px; overflow: auto; font-size: 13px;">${JSON.stringify(values, null, 2)}</pre>
  `;
}
