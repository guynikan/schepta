/**
 * React Layout Factory
 *
 * Renders the application shell (header / sidebar / main / footer) from a
 * JSON schema. Unlike FormFactory or TableFactory, it has very little runtime
 * state — the factory mostly composes slot components via the generic
 * `createReactFactory` primitive.
 *
 * The schema declares slots as named properties of the root
 * `LayoutContainer`. Each slot's `x-component` must be one of
 * `LayoutHeader`, `LayoutSidebar`, `LayoutMain` or `LayoutFooter`.
 */

import { useMemo } from 'react';
import type { ComponentSpec, MiddlewareFn } from '@schepta/core';
import layoutSchemaDefinition from '@schepta/factories/schemas/layout-schema.json';
import {
  createReactFactory,
  type FactoryBaseProps,
  type FactorySetupHook,
} from '../create-factory';
import { defaultLayoutComponents } from './defaults';
import type { LayoutVariant, SidebarPosition } from './components';

export type { LayoutVariant, SidebarPosition };

export interface LayoutFactoryRef {
  /** Returns the list of slot keys present in the schema (header, main…). */
  getSlots: () => string[];
  /** Whether a given slot is declared in the schema. */
  hasSlot: (slot: string) => boolean;
}

export interface LayoutFactoryProps extends FactoryBaseProps {
  components?: Record<string, ComponentSpec>;
  customComponents?: Record<string, ComponentSpec>;
  renderers?: Partial<Record<string, any>>;
  externalContext?: Record<string, any>;
  middlewares?: MiddlewareFn[];
  debug?: boolean;
}

function listSlots(schema: any): string[] {
  const properties = (schema?.properties ?? {}) as Record<string, any>;
  const slots: string[] = [];
  for (const [key, child] of Object.entries(properties)) {
    const tag = (child as any)?.['x-component'];
    if (
      tag === 'LayoutHeader' ||
      tag === 'LayoutSidebar' ||
      tag === 'LayoutMain' ||
      tag === 'LayoutFooter'
    ) {
      slots.push(key);
    }
  }
  return slots;
}

const useLayoutSetup: FactorySetupHook<LayoutFactoryProps, LayoutFactoryRef> = ({
  props,
}) => {
  const slots = useMemo(() => listSlots(props.schema), [props.schema]);

  const refApi = useMemo<LayoutFactoryRef>(
    () => ({
      getSlots: () => slots,
      hasSlot: (slot: string) => slots.includes(slot),
    }),
    [slots]
  );

  const externalContext = useMemo(
    () => ({
      layout: {
        slots,
      },
    }),
    [slots]
  );

  return {
    refApi,
    externalContext,
  };
};

export const LayoutFactory = createReactFactory<LayoutFactoryProps, LayoutFactoryRef>({
  displayName: 'LayoutFactory',
  schemaDefinition: layoutSchemaDefinition,
  rootComponentKey: 'LayoutContainer',
  defaultComponents: defaultLayoutComponents,
  useSetup: useLayoutSetup,
});
