import { createComponentSpec, type ComponentSpec } from '@schepta/core';
import { DefaultTabsContainer, DefaultTabPanel } from './components';

export const defaultTabsComponents: Record<string, ComponentSpec> = {
  TabsContainer: createComponentSpec({
    id: 'TabsContainer',
    type: 'tabs-container',
    component: () => DefaultTabsContainer,
  }),
  TabPanel: createComponentSpec({
    id: 'TabPanel',
    type: 'tabs-panel',
    component: () => DefaultTabPanel,
  }),
};
