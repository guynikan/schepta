/**
 * Variable Resolver Tests
 */

import { describe, it, expect, vi } from 'vitest';
import {
  createDefaultResolver,
  createCustomResolver,
  type ResolverContext,
} from './variable-resolver';

describe('Variable Resolver', () => {
  const context: ResolverContext = {
    externalContext: {
      user: {
        name: 'John Doe',
        email: 'john@example.com',
      },
      api: 'https://api.example.com',
    },
    formValues: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
  };

  describe('createDefaultResolver', () => {
    it('should resolve $externalContext.* expressions', () => {
      const resolver = createDefaultResolver(context);
      
      expect(resolver('$externalContext.user.name')).toBe('John Doe');
      expect(resolver('$externalContext.user.email')).toBe('john@example.com');
      expect(resolver('$externalContext.api')).toBe('https://api.example.com');
    });

    it('should resolve $formValues.* expressions', () => {
      const resolver = createDefaultResolver(context);
      
      expect(resolver('$formValues.firstName')).toBe('John');
      expect(resolver('$formValues.lastName')).toBe('Doe');
      expect(resolver('$formValues.email')).toBe('john@example.com');
    });

    it('should resolve $formValues with nested objects', () => {
      const nestedContext: ResolverContext = {
        externalContext: {},
        formValues: {
          user: {
            profile: {
              firstName: 'John',
              lastName: 'Doe',
            },
            settings: {
              theme: 'dark',
            },
          },
        },
      };
      const resolver = createDefaultResolver(nestedContext);
      
      expect(resolver('$formValues.user.profile.firstName')).toBe('John');
      expect(resolver('$formValues.user.profile.lastName')).toBe('Doe');
      expect(resolver('$formValues.user.settings.theme')).toBe('dark');
    });

    it('should resolve $formValues without path', () => {
      const resolver = createDefaultResolver(context);
      const result = resolver('$formValues');
      
      expect(result).toEqual(context.formValues);
    });

    it('should resolve $formValues with nested objects', () => {
      const nestedContext: ResolverContext = {
        externalContext: {},
        formValues: {
          user: {
            profile: {
              firstName: 'John',
              lastName: 'Doe',
            },
            settings: {
              theme: 'dark',
            },
          },
        },
      };
      const resolver = createDefaultResolver(nestedContext);
      
      const nestedResolver = createDefaultResolver(nestedContext);
      expect(nestedResolver('$formValues.user.profile.firstName')).toBe('John');
      expect(nestedResolver('$formValues.user.profile.lastName')).toBe('Doe');
      expect(nestedResolver('$formValues.user.settings.theme')).toBe('dark');
    });

    it('should resolve $formValues with arrays', () => {
      const arrayContext: ResolverContext = {
        externalContext: {},
        formValues: {
          tags: ['react', 'typescript', 'vue'],
          items: [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
          ],
        },
      };
      const resolver = createDefaultResolver(arrayContext);
      
      const arrayResolver = createDefaultResolver(arrayContext);
      expect(arrayResolver('$formValues.tags')).toEqual(['react', 'typescript', 'vue']);
      expect(arrayResolver('$formValues.items')).toEqual([
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ]);
    });

    it('should resolve $formValues with primitive values', () => {
      const primitiveContext: ResolverContext = {
        externalContext: {},
        formValues: {
          count: 42,
          isActive: true,
          price: 99.99,
          description: 'Test description',
        },
      };
      const resolver = createDefaultResolver(primitiveContext);
      
      const primitiveResolver = createDefaultResolver(primitiveContext);
      expect(primitiveResolver('$formValues.count')).toBe(42);
      expect(primitiveResolver('$formValues.isActive')).toBe(true);
      expect(primitiveResolver('$formValues.price')).toBe(99.99);
      expect(primitiveResolver('$formValues.description')).toBe('Test description');
    });

    it('should resolve $formValues with null and undefined values', () => {
      const nullContext: ResolverContext = {
        externalContext: {},
        formValues: {
          nullable: null,
          undefinedValue: undefined,
          emptyString: '',
        },
      };
      
      const nullResolver = createDefaultResolver(nullContext);
      expect(nullResolver('$formValues.nullable')).toBeNull();
      expect(nullResolver('$formValues.undefinedValue')).toBeUndefined();
      expect(nullResolver('$formValues.emptyString')).toBe('');
    });

    it('should handle $formValues with complex nested structures', () => {
      const complexContext: ResolverContext = {
        externalContext: {},
        formValues: {
          address: {
            street: '123 Main St',
            city: 'New York',
            zip: '10001',
            coordinates: {
              lat: 40.7128,
              lng: -74.0060,
            },
          },
        },
      };
      const resolver = createDefaultResolver(complexContext);
      
      const complexResolver = createDefaultResolver(complexContext);
      expect(complexResolver('$formValues.address.street')).toBe('123 Main St');
      expect(complexResolver('$formValues.address.city')).toBe('New York');
      expect(complexResolver('$formValues.address.coordinates.lat')).toBe(40.7128);
      expect(complexResolver('$formValues.address.coordinates.lng')).toBe(-74.0060);
    });

    it('should resolve $externalContext without path', () => {
      const resolver = createDefaultResolver(context);
      const result = resolver('$externalContext');
      
      expect(result).toEqual(context.externalContext);
    });

    it('should return undefined for unknown variables', () => {
      const resolver = createDefaultResolver(context);
      
      expect(resolver('$unknown.variable')).toBeUndefined();
      expect(resolver('invalid')).toBeUndefined();
    });

    it('should handle nested paths', () => {
      const resolver = createDefaultResolver(context);
      
      expect(resolver('$externalContext.user.name')).toBe('John Doe');
    });

    it('should return undefined for non-existent paths', () => {
      const resolver = createDefaultResolver(context);
      
      expect(resolver('$externalContext.user.nonexistent')).toBeUndefined();
      expect(resolver('$formValues.nonexistent')).toBeUndefined();
    });

    it('should handle null/undefined context values', () => {
      const emptyContext: ResolverContext = {
        externalContext: {},
        formValues: {},
      };
      const emptyResolver = createDefaultResolver(emptyContext);
      
      expect(emptyResolver('$externalContext.user.name')).toBeUndefined();
      expect(emptyResolver('$formValues.firstName')).toBeUndefined();
    });

    it('preserves inherited values from external context', () => {
      class User {
        get fullName() { return 'Ada Lovelace'; }
      }
      const resolver = createDefaultResolver({ externalContext: { user: new User() }, formValues: {} });

      expect(resolver('$externalContext.user.fullName')).toBe('Ada Lovelace');
    });

    it('blocks prototype-chain segments', () => {
      const resolver = createDefaultResolver({ externalContext: { user: {} }, formValues: {} });

      expect(resolver('$formValues.constructor.constructor')).toBeUndefined();
      expect(resolver('$externalContext.user.__proto__')).toBeUndefined();
      expect(resolver('$externalContext.user.constructor.prototype')).toBeUndefined();
    });

    it('reads get-only Proxy contexts with a plain property read', () => {
      const proxy = new Proxy({}, { get: (_, key) => `P:${String(key)}` });
      const resolver = createDefaultResolver({ externalContext: { proxy }, formValues: {} });

      expect(resolver('$externalContext.proxy.anything')).toBe('P:anything');
    });

    it('resolves keys that contain operator characters', () => {
      const resolver = createDefaultResolver({
        externalContext: { 'a/b': 7, 'x+y': 8, 'api-url': 'https://api' },
        formValues: { 'a-b': 5 },
      });

      expect(resolver('$externalContext.a/b')).toBe(7);
      expect(resolver('$externalContext.x+y')).toBe(8);
      expect(resolver('$externalContext.api-url')).toBe('https://api');
      expect(resolver('$formValues.a-b')).toBe(5);
    });

    it('never reports: diagnostics belong to the template processor', () => {
      const report = vi.fn();
      const resolver = createDefaultResolver({ externalContext: {}, formValues: {}, diagnostics: { report } });

      expect(resolver('$formValues.emial')).toBeUndefined();
      expect(resolver('$typo.value')).toBeUndefined();
      expect(report).not.toHaveBeenCalled();
    });
  });

  describe('createCustomResolver', () => {
    it('should use custom handlers for custom variables', () => {
      const resolver = createCustomResolver(context, {
        '$i18n': (path, ctx) => {
          const translations: Record<string, string> = {
            'label.name': 'Nome',
            'label.email': 'Email',
          };
          return translations[path];
        },
        '$now': () => new Date('2024-01-01'),
      });

      expect(resolver('$i18n.label.name')).toBe('Nome');
      expect(resolver('$i18n.label.email')).toBe('Email');
      expect(resolver('$now')).toEqual(new Date('2024-01-01'));
    });

    it('should fall back to default resolver for unknown variables', () => {
      const resolver = createCustomResolver(context, {
        '$custom': (path) => `custom-${path}`,
      });

      // Custom variable
      expect(resolver('$custom.value')).toBe('custom-value');
      
      // Default variables still work
      expect(resolver('$externalContext.user.name')).toBe('John Doe');
      expect(resolver('$formValues.firstName')).toBe('John');
    });

    it('should handle paths with leading dots', () => {
      const resolver = createCustomResolver(context, {
        '$test': (path) => `test-${path}`,
      });

      expect(resolver('$test.value')).toBe('test-value');
    });

    it('tells diagnostics which expressions its handlers own', () => {
      const resolver = createCustomResolver(context, { '$i18n': path => path });

      expect(resolver.handles?.('$i18n.title')).toBe(true);
      expect(resolver.handles?.('$i18n')).toBe(true);
      expect(resolver.handles?.('$formValues.firstName')).toBe(false);
      expect(createDefaultResolver(context).handles).toBeUndefined();
    });
  });
});
