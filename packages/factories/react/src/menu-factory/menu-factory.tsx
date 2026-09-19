/**
 * React Menu Factory
 *
 * Renders menus (navigation, command palettes, sidebars) from JSON schemas.
 * Built on top of `createReactFactory` as a reference implementation of a
 * second built-in factory coexisting with `FormFactory`.
 */

import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import type { ComponentSpec, MiddlewareFn, MiddlewareContext } from '@schepta/core';
import menuSchemaDefinition from '@schepta/factories/schemas/menu-schema.json';
import {
  createReactFactory,
  type FactoryBaseProps,
  type FactorySetupHook,
} from '../create-factory';
import { defaultMenuComponents } from './defaults';
import { MenuProvider, type MenuContextValue } from './context';

export interface MenuFactoryRef {
  /** Currently active (selected) item key, or `null` */
  getActiveItem: () => string | null;
  /** Programmatically set the active item */
  setActiveItem: (key: string | null) => void;
}

export interface MenuSelectionPayload {
  /** Schema key of the selected item */
  key: string;
  /** Display label of the selected item */
  label: string;
  /** Optional href of the selected item */
  href?: string;
}

export interface MenuFactoryProps extends FactoryBaseProps {
  components?: Record<string, ComponentSpec>;
  customComponents?: Record<string, ComponentSpec>;
  renderers?: Partial<Record<string, any>>;
  externalContext?: Record<string, any>;
  middlewares?: MiddlewareFn[];
  /** Initial active item */
  initialActiveItem?: string | null;
  /** Invoked when an item is selected */
  onSelect?: (payload: MenuSelectionPayload) => void;
  debug?: boolean;
}

interface MenuState extends Record<string, any> {
  activeItem: string | null;
}

function findDeclaredActiveItem(schema: any): string | null {
  if (!schema || typeof schema !== 'object') return null;

  for (const [key, child] of Object.entries(schema.properties ?? {})) {
    if (
      (child as any)?.['x-component'] === 'MenuItem' &&
      (child as any)?.['x-component-props']?.active === true
    ) {
      return key;
    }

    const nested = findDeclaredActiveItem(child);
    if (nested) return nested;
  }

  return null;
}

const useMenuSetup: FactorySetupHook<MenuFactoryProps, MenuFactoryRef, MenuState> = ({
  props,
}) => {
  const [activeItem, setActiveItem] = useState<string | null>(
    props.initialActiveItem !== undefined
      ? props.initialActiveItem
      : findDeclaredActiveItem(props.schema)
  );

  const state = useMemo<MenuState>(
    () => ({ activeItem }),
    [activeItem]
  );

  const onSelectRef = useRef(props.onSelect);
  onSelectRef.current = props.onSelect;

  const onSelect = useCallback(
    (payload: { href?: string; label: string }, key: string) => {
      setActiveItem(key);
      if (onSelectRef.current) {
        onSelectRef.current({ key, label: payload.label, href: payload.href });
      }
    },
    []
  );

  const menuContext = useMemo<MenuContextValue>(
    () => ({ activeItem }),
    [activeItem]
  );

  // Expose onSelect through externalContext so userland MenuItem components
  // (or template expressions) can read it alongside `activeItem`.
  const externalContext = useMemo(
    () => ({
      menu: {
        activeItem,
        onSelect,
      },
    }),
    [activeItem, onSelect]
  );

  // Middleware that automatically wires `onSelect` into every MenuItem so the
  // default components (and any drop-in replacements) dispatch selections
  // through the factory without requiring the user to opt-in via
  // `x-component-props`. Userland can still override it by setting `onSelect`
  // explicitly on a MenuItem's `x-component-props`.
  const menuItemWiring = useCallback<MiddlewareFn>(
    (itemProps, schema, context: MiddlewareContext) => {
      if (!schema || schema['x-component'] !== 'MenuItem') return itemProps;
      const menu = context.externalContext?.menu;
      if (!menu?.onSelect) return itemProps;

      const itemKey = itemProps['data-test-id'] as string | undefined;
      const composedProps = itemProps['x-component-props'] ?? {};
      const userOnSelect = (composedProps as any).onSelect ?? itemProps.onSelect;

      const wiredOnSelect = (payload: { href?: string; label: string }) => {
        menu.onSelect(payload, itemKey ?? '');
        userOnSelect?.(payload);
      };

      return {
        ...itemProps,
        onSelect: wiredOnSelect,
        'x-component-props': {
          ...composedProps,
          onSelect: wiredOnSelect,
        },
      };
    },
    []
  );

  const middlewares = useMemo<MiddlewareFn[]>(
    () => [menuItemWiring],
    [menuItemWiring]
  );

  const wrap = useCallback(
    (children: ReactNode) => (
      <MenuProvider value={menuContext}>{children}</MenuProvider>
    ),
    [menuContext]
  );

  const refApi = useMemo<MenuFactoryRef>(
    () => ({
      getActiveItem: () => activeItem,
      setActiveItem,
    }),
    [activeItem]
  );

  return {
    state,
    externalContext,
    middlewares,
    wrap,
    refApi,
  };
};

export const MenuFactory = createReactFactory<MenuFactoryProps, MenuFactoryRef, MenuState>({
  displayName: 'MenuFactory',
  schemaDefinition: menuSchemaDefinition,
  rootComponentKey: 'MenuContainer',
  defaultComponents: defaultMenuComponents,
  useSetup: useMenuSetup,
});
