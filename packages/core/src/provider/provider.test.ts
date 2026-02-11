/**
 * Provider Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import { mergeProviderConfigs, resolveProviderConfig } from './provider';
import type { ProviderConfig } from './types';
import type { FormSchema } from '../schema/schema-types';
import { createComponentSpec } from '../registries/component-registry';

describe('Provider Utilities', () => {
  describe('mergeProviderConfigs', () => {
    it('should merge components with local overriding global', () => {
      const global: ProviderConfig = {
        components: {
          InputText: createComponentSpec({
            id: 'InputText',
            component: () => null,
            type: 'field',
          }),
        },
      };

      const local: ProviderConfig = {
        components: {
          InputText: createComponentSpec({
            id: 'InputText',
            component: () => null,
            type: 'field',
            displayName: 'CustomInputText',
          }),
        },
      };

      const merged = mergeProviderConfigs(local, global);
      expect(merged.components?.InputText?.displayName).toBe('CustomInputText');
    });

    it('should merge middlewares with local appended after global', () => {
      const globalMiddleware = (props: any) => ({ ...props, global: true });
      const localMiddleware = (props: any) => ({ ...props, local: true });

      const global: ProviderConfig = {
        middlewares: [globalMiddleware],
      };

      const local: ProviderConfig = {
        middlewares: [localMiddleware],
      };

      const merged = mergeProviderConfigs(local, global);
      expect(merged.middlewares).toHaveLength(2);
      expect(merged.middlewares?.[0]).toBe(globalMiddleware);
      expect(merged.middlewares?.[1]).toBe(localMiddleware);
    });

    it('should merge externalContext with local overriding global', () => {
      const global: ProviderConfig = {
        externalContext: {
          user: { id: 1, name: 'Global User' },
          api: 'https://api.example.com',
        },
      };

      const local: ProviderConfig = {
        externalContext: {
          user: { id: 2, name: 'Local User' },
        },
      };

      const merged = mergeProviderConfigs(local, global);
      expect(merged.externalContext?.user).toEqual({ id: 2, name: 'Local User' });
      expect(merged.externalContext?.api).toBe('https://api.example.com');
    });

    it('should merge debug config with local overriding global', () => {
      const global: ProviderConfig = {
        debug: {
          enabled: true,
          logComponentResolution: false,
        },
      };

      const local: ProviderConfig = {
        debug: {
          enabled: false,
          logComponentResolution: true,
        },
      };

      const merged = mergeProviderConfigs(local, global);
      expect(merged.debug?.enabled).toBe(false);
      expect(merged.debug?.logComponentResolution).toBe(true);
    });

    it('should use local schema if provided, otherwise global', () => {
      const global: ProviderConfig = {
        schema: { type: 'object', 'x-component': 'FormContainer', properties: {} } as FormSchema,
      };

      const local: ProviderConfig = {
        schema: { 
          type: 'object', 
          'x-component': 'FormContainer', 
          properties: { 
            test: { 
              type: 'object', 
              'x-component': 'FormField',
              properties: {},
            },
          },
        } as unknown as FormSchema,
      };

      const merged = mergeProviderConfigs(local, global);
      expect(merged.schema).toEqual(local.schema);

      const mergedWithoutLocal = mergeProviderConfigs({ components: {} }, global);
      expect(mergedWithoutLocal.schema).toEqual(global.schema);
    });
  });

  describe('resolveProviderConfig', () => {
    it('should return local config if no global config', () => {
      const local: ProviderConfig = {
        components: {
          InputText: createComponentSpec({
            id: 'InputText',
            component: () => null,
            type: 'field',
          }),
        },
      };

      const resolved = resolveProviderConfig(local, null);
      expect(resolved.components).toEqual(local.components);
    });

    it('should return global config if no local config', () => {
      const global: ProviderConfig = {
        components: {
          InputText: createComponentSpec({
            id: 'InputText',
            component: () => null,
            type: 'field',
          }),
        },
      };

      const resolved = resolveProviderConfig(undefined, global);
      expect(resolved.components).toEqual(global.components);
    });

    it('should return merged config if both local and global', () => {
      const global: ProviderConfig = {
        components: {
          InputText: createComponentSpec({
            id: 'InputText',
            component: () => null,
            type: 'field',
          }),
        },
      };

      const local: ProviderConfig = {
        components: {
          Button: createComponentSpec({
            id: 'Button',
            component: () => null,
            type: 'field',
          }),
        },
      };

      const resolved = resolveProviderConfig(local, global);
      expect(resolved.components?.InputText).toBeDefined();
      expect(resolved.components?.Button).toBeDefined();
    });

    it('should return default config if neither local nor global', () => {
      const resolved = resolveProviderConfig(undefined, null);
      expect(resolved.components).toEqual({});
      expect(resolved.renderers).toEqual({});
      expect(resolved.middlewares).toEqual([]);
      expect(resolved.externalContext).toEqual({});
      expect(resolved.debug).toBeDefined();
      expect(resolved.debug?.enabled).toBe(false);
    });
  });
});

