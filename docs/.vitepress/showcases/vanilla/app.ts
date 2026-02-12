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
  container.style.cssText = `
    padding: 2rem;
    background: var(--schepta-bg);
    border-radius: 8px;
    margin: 1rem 0;
  `;

  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    color: var(--schepta-brand);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  `;
  header.innerHTML = `
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"/>
    </svg>
    <h2 style="margin: 0; color: var(--schepta-text-1);">Vanilla JS Microfrontend - Schepta Forms</h2>
  `;
  container.appendChild(header);

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
