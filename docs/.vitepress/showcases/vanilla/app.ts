/**
 * Creates the root DOM element for the vanilla app (layout, tabs, panels).
 */

import type { FormSchema } from '@schepta/core';
import { createNativeForm } from './components/NativeForm';
import { createNativeComplexForm } from './components/NativeComplexForm';
import simpleFormSchema from '../../../../instances/form/simple-form.json';
import complexFormSchema from '../../../../instances/form/complex-form.json';

export function createAppRoot(): HTMLElement {
  const container = document.createElement('div');
  container.style.cssText = `background: var(--schepta-bg); border-radius: 8px; margin: 1rem 0;border: 1px solid var(--schepta-border);`;

  // Main content wrapper
  const mainContent = document.createElement('div');
  mainContent.style.cssText = `
    background: var(--schepta-bg);
    padding: 1.5rem;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `;

  // Tabs
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'vanilla-tabs';
  tabsContainer.style.cssText = `
    display: flex;
    border-bottom: 1px solid var(--schepta-border);
    margin-bottom: 1rem;
  `;

  const simpleTab = document.createElement('button');
  simpleTab.type = 'button';
  simpleTab.className = 'vanilla-tab active';
  simpleTab.setAttribute('data-test-id', 'simple-form-tab');
  simpleTab.textContent = 'Simple Form';
  simpleTab.style.cssText = `
    padding: 0.5rem 1rem;
    border: none;
    background: none;
    cursor: pointer;
    border-bottom: 2px solid var(--schepta-brand);
    color: var(--schepta-brand);
    font-weight: 500;
  `;

  const complexTab = document.createElement('button');
  complexTab.type = 'button';
  complexTab.className = 'vanilla-tab';
  complexTab.setAttribute('data-test-id', 'complex-form-tab');
  complexTab.textContent = 'Complex Form';
  complexTab.style.cssText = `
    padding: 0.5rem 1rem;
    border: none;
    background: none;
    cursor: pointer;
    border-bottom: 2px solid transparent;
  `;

  tabsContainer.appendChild(simpleTab);
  tabsContainer.appendChild(complexTab);
  mainContent.appendChild(tabsContainer);

  // Tab content
  const tabContent = document.createElement('div');
  tabContent.className = 'vanilla-tab-content';
  tabContent.style.padding = '1rem 0';

  // Simple form panel
  const simplePanel = document.createElement('div');
  simplePanel.id = 'simple-content';
  simplePanel.className = 'vanilla-tab-panel active';
  createNativeForm(simplePanel, simpleFormSchema as FormSchema);

  // Complex form panel
  const complexPanel = document.createElement('div');
  complexPanel.id = 'complex-content';
  complexPanel.className = 'vanilla-tab-panel';
  complexPanel.style.display = 'none';
  createNativeComplexForm(complexPanel, complexFormSchema as FormSchema);

  tabContent.appendChild(simplePanel);
  tabContent.appendChild(complexPanel);
  mainContent.appendChild(tabContent);

  container.appendChild(mainContent);

  // Attach tab switching behavior
  attachTabBehavior(simpleTab, complexTab, simplePanel, complexPanel);

  return container;
}

function attachTabBehavior(
  simpleTab: HTMLElement,
  complexTab: HTMLElement,
  simplePanel: HTMLElement,
  complexPanel: HTMLElement
) {
  const tabs = [simpleTab, complexTab];
  const panels = [simplePanel, complexPanel];

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      // Update tabs
      tabs.forEach(t => {
        t.classList.remove('active');
        (t as HTMLElement).style.borderBottomColor = 'transparent';
        (t as HTMLElement).style.color = 'var(--schepta-text-2)';
      });
      tab.classList.add('active');
      (tab as HTMLElement).style.borderBottomColor = 'var(--schepta-brand)';
      (tab as HTMLElement).style.color = 'var(--schepta-brand)';

      // Update panels
      panels.forEach(p => {
        p.classList.remove('active');
        (p as HTMLElement).style.display = 'none';
      });
      panels[index].classList.add('active');
      (panels[index] as HTMLElement).style.display = 'block';
    });
  });
}
