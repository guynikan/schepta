import { createComponentSpec, type ComponentSpec } from '@schepta/core';
import {
  DefaultMenuContainer,
  DefaultMenuGroup,
  DefaultMenuItem,
} from './components';

export const defaultMenuComponents: Record<string, ComponentSpec> = {
  MenuContainer: createComponentSpec({
    id: 'MenuContainer',
    type: 'menu-container',
    component: () => DefaultMenuContainer,
  }),
  MenuGroup: createComponentSpec({
    id: 'MenuGroup',
    type: 'menu-container',
    component: () => DefaultMenuGroup,
  }),
  MenuItem: createComponentSpec({
    id: 'MenuItem',
    type: 'menu-item',
    component: () => DefaultMenuItem,
  }),
};
