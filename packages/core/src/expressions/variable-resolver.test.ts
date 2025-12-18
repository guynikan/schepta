/**
 * Variable Resolver Tests
 */

import { describe, it, expect } from 'vitest';
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
    formState: {
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

    it('should resolve $formState.* expressions', () => {
      const resolver = createDefaultResolver(context);
      
      expect(resolver('$formState.firstName')).toBe('John');
      expect(resolver('$formState.lastName')).toBe('Doe');
      expect(resolver('$formState.email')).toBe('john@example.com');
    });

    it('should resolve $formState with nested objects', () => {
      const nestedContext: ResolverContext = {
        externalContext: {},
        formState: {
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
      expect(nestedResolver('$formState.user.profile.firstName')).toBe('John');
      expect(nestedResolver('$formState.user.profile.lastName')).toBe('Doe');
      expect(nestedResolver('$formState.user.settings.theme')).toBe('dark');
    });

    it('should resolve $formState with arrays', () => {
      const arrayContext: ResolverContext = {
        externalContext: {},
        formState: {
          tags: ['react', 'typescript', 'vue'],
          items: [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
          ],
        },
      };
      const resolver = createDefaultResolver(arrayContext);
      
      const arrayResolver = createDefaultResolver(arrayContext);
      expect(arrayResolver('$formState.tags')).toEqual(['react', 'typescript', 'vue']);
      expect(arrayResolver('$formState.items')).toEqual([
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ]);
    });

    it('should resolve $formState with primitive values', () => {
      const primitiveContext: ResolverContext = {
        externalContext: {},
        formState: {
          count: 42,
          isActive: true,
          price: 99.99,
          description: 'Test description',
        },
      };
      const resolver = createDefaultResolver(primitiveContext);
      
      const primitiveResolver = createDefaultResolver(primitiveContext);
      expect(primitiveResolver('$formState.count')).toBe(42);
      expect(primitiveResolver('$formState.isActive')).toBe(true);
      expect(primitiveResolver('$formState.price')).toBe(99.99);
      expect(primitiveResolver('$formState.description')).toBe('Test description');
    });

    it('should resolve $formState with null and undefined values', () => {
      const nullContext: ResolverContext = {
        externalContext: {},
        formState: {
          nullable: null,
          undefinedValue: undefined,
          emptyString: '',
        },
      };
      
      const nullResolver = createDefaultResolver(nullContext);
      expect(nullResolver('$formState.nullable')).toBeNull();
      expect(nullResolver('$formState.undefinedValue')).toBeUndefined();
      expect(nullResolver('$formState.emptyString')).toBe('');
    });

    it('should handle $formState with complex nested structures', () => {
      const complexContext: ResolverContext = {
        externalContext: {},
        formState: {
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
      expect(complexResolver('$formState.address.street')).toBe('123 Main St');
      expect(complexResolver('$formState.address.city')).toBe('New York');
      expect(complexResolver('$formState.address.coordinates.lat')).toBe(40.7128);
      expect(complexResolver('$formState.address.coordinates.lng')).toBe(-74.0060);
    });

    it('should resolve $externalContext without path', () => {
      const resolver = createDefaultResolver(context);
      const result = resolver('$externalContext');
      
      expect(result).toEqual(context.externalContext);
    });

    it('should resolve $formState without path', () => {
      const resolver = createDefaultResolver(context);
      const result = resolver('$formState');
      
      expect(result).toEqual(context.formState);
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
      expect(resolver('$formState.nonexistent')).toBeUndefined();
    });

    it('should handle null/undefined context values', () => {
      const emptyContext: ResolverContext = {
        externalContext: {},
        formState: {},
      };
      const emptyResolver = createDefaultResolver(emptyContext);
      
      expect(emptyResolver('$externalContext.user.name')).toBeUndefined();
      expect(emptyResolver('$formState.firstName')).toBeUndefined();
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
      expect(resolver('$formState.firstName')).toBe('John');
    });

    it('should handle paths with leading dots', () => {
      const resolver = createCustomResolver(context, {
        '$test': (path) => `test-${path}`,
      });

      expect(resolver('$test.value')).toBe('test-value');
    });
  });
});

