import { createComponentSpec, type ComponentSpec } from '@schepta/core';
import {
  DefaultLayoutContainer,
  DefaultLayoutHeader,
  DefaultLayoutSidebar,
  DefaultLayoutMain,
  DefaultLayoutFooter,
} from './components';

export const defaultLayoutComponents: Record<string, ComponentSpec> = {
  LayoutContainer: createComponentSpec({
    id: 'LayoutContainer',
    type: 'layout-container',
    component: () => DefaultLayoutContainer,
  }),
  LayoutHeader: createComponentSpec({
    id: 'LayoutHeader',
    type: 'layout-slot',
    component: () => DefaultLayoutHeader,
  }),
  LayoutSidebar: createComponentSpec({
    id: 'LayoutSidebar',
    type: 'layout-slot',
    component: () => DefaultLayoutSidebar,
  }),
  LayoutMain: createComponentSpec({
    id: 'LayoutMain',
    type: 'layout-slot',
    component: () => DefaultLayoutMain,
  }),
  LayoutFooter: createComponentSpec({
    id: 'LayoutFooter',
    type: 'layout-slot',
    component: () => DefaultLayoutFooter,
  }),
};
