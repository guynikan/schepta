/**
 * Native Complex Form for Vanilla
 */

import type { FormSchema } from '@schepta/core';
import { createComponentSpec } from '@schepta/core';
import { createFormFactory, type FormFactoryResult } from '@schepta/factory-vanilla';
import { createSocialNameInput } from './SocialNameInput';
import { createSubmitButton } from './SubmitButton';

export function createNativeComplexForm(container: HTMLElement, schema: FormSchema): FormFactoryResult {
  // Feature list info box
  const infoBox = createInfoBox();
  container.appendChild(infoBox);
  
  // Form wrapper
  const formWrapper = document.createElement('div');
  formWrapper.style.border = '1px solid var(--schepta-border)';
  formWrapper.style.padding = '24px';
  formWrapper.style.borderRadius = '8px';
  
  // External context for custom component
  let openSocialName = false;
  
  const factory = createFormFactory({
    schema,
    container: formWrapper,
    initialValues: {
      userInfo: {
        enrollment: '8743',
      },
    },
    customComponents: {
      socialName: createComponentSpec({
        id: 'socialName',
        type: 'field',
        component: () => createSocialNameInput,
      }),
    },
    externalContext: {
      get openSocialName() {
        return openSocialName;
      },
      setOpenSocialName: (value: boolean) => {
        openSocialName = value;
      },
    },
    onSubmit: (values) => {
      console.log('Form submitted:', values);
      displaySubmittedValues(container, values);
    },
    debug: true,
  });
  
  container.appendChild(formWrapper);
  return factory;
}

function createInfoBox(): HTMLElement {
  const box = document.createElement('div');
  box.style.marginBottom = '24px';
  box.style.padding = '20px';
  box.style.background = 'var(--schepta-bg-soft)';
  box.style.border = '1px solid var(--schepta-border)';
  box.style.borderRadius = '8px';
  
  box.innerHTML = `
    <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 18px; font-weight: 600; color: var(--schepta-text-1);">What you can see in this form:</h3>
    <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
      <li style="margin-bottom: 8px;"><strong>Custom Components (x-custom):</strong> Social Name field with toggle behavior</li>
      <li style="margin-bottom: 8px;"><strong>Template Expressions:</strong> Conditional visibility (spouseName appears when maritalStatus is 'married')</li>
      <li style="margin-bottom: 8px;"><strong>Disabled Fields:</strong> Enrollment field is disabled</li>
      <li style="margin-bottom: 8px;"><strong>Required Fields:</strong> Email, Phone, First Name, Last Name, Accept Terms</li>
      <li style="margin-bottom: 8px;"><strong>Grid Layout:</strong> 2-column grid with full-width fields (socialName, spouseName)</li>
      <li style="margin-bottom: 8px;"><strong>Input Types:</strong> Text, Phone, Select, Date, Textarea, Checkbox</li>
      <li style="margin-bottom: 8px;">
        <strong>Sections:</strong> Organized with section containers and titles
        <ul style="margin-top: 4px; margin-bottom: 4px;">
          <li>
            <strong>User Information</strong> contains two subsections:
            <ul style="margin-top: 4px;">
              <li><strong>basicInfo:</strong> enrollment, firstName, lastName, socialName, userType, birthDate, maritalStatus, spouseName</li>
              <li><strong>additionalInfo:</strong> bio, acceptTerms</li>
            </ul>
          </li>
        </ul>
      </li>
      <li style="margin-bottom: 8px;"><strong>Field Ordering:</strong> Custom order via x-ui.order</li>
      <li style="margin-bottom: 8px;"><strong>Initial Values:</strong> Pre-filled enrollment value</li>
      <li style="margin-bottom: 8px;"><strong>External Context:</strong> State management for custom components</li>
    </ul>
  `;
  
  return box;
}

function displaySubmittedValues(container: HTMLElement, values: any) {
  let resultsDiv = container.querySelector('.submitted-values') as HTMLElement;
  if (!resultsDiv) {
    resultsDiv = document.createElement('div');
    resultsDiv.className = 'submitted-values';
    resultsDiv.style.marginTop = '24px';
    resultsDiv.style.padding = '16px';
    resultsDiv.style.background = 'var(--schepta-bg-soft)';
    resultsDiv.style.border = '1px solid var(--schepta-border)';
    resultsDiv.style.borderRadius = '8px';
    container.appendChild(resultsDiv);
  }
  
  resultsDiv.innerHTML = `
    <h3 style="margin-top: 0; margin-bottom: 12px; color: var(--schepta-text-1);">Submitted Values:</h3>
    <pre style="background: var(--schepta-bg); padding: 12px; border-radius: 4px; overflow: auto; font-size: 13px; color: var(--schepta-text-1);">${JSON.stringify(values, null, 2)}</pre>
  `;
}
