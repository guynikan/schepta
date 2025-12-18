/**
 * Template Expression Middleware Tests
 */

import { describe, it, expect } from 'vitest';
import {
  createTemplateExpressionMiddleware,
  templateExpressionMiddleware,
} from './template-expression-middleware';
import type { MiddlewareContext } from './types';

describe('Template Expression Middleware', () => {
  const context: MiddlewareContext = {
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
    },
  };

  const schema = {
    'x-component': 'InputText',
    'x-ui': {
      label: '{{ $externalContext.user.name }}',
      placeholder: 'Enter {{ $formValues.firstName }}',
    },
  };

  describe('createTemplateExpressionMiddleware', () => {
    it('should process template expressions in props', () => {
      const middleware = createTemplateExpressionMiddleware(context);
      
      const props = {
        label: '{{ $externalContext.user.name }}',
        placeholder: 'Enter {{ $formState.firstName }}',
      };

      const result = middleware(props, schema, context);

      expect(result.label).toBe('John Doe');
      expect(result.placeholder).toBe('Enter John');
    });

    it('should process nested objects', () => {
      const middleware = createTemplateExpressionMiddleware(context);
      
      const props = {
        ui: {
          label: '{{ $externalContext.user.name }}',
          nested: {
            placeholder: '{{ $formState.firstName }}',
          },
        },
      };

      const result = middleware(props, schema, context);

      expect(result.ui.label).toBe('John Doe');
      expect(result.ui.nested.placeholder).toBe('John');
    });

    it('should process arrays', () => {
      const middleware = createTemplateExpressionMiddleware(context);
      
      const props = {
        items: [
          '{{ $externalContext.user.name }}',
          '{{ $formState.firstName }}',
        ],
      };

      const result = middleware(props, schema, context);

      expect(result.items).toEqual(['John Doe', 'John']);
    });

    it('should leave props without templates unchanged', () => {
      const middleware = createTemplateExpressionMiddleware(context);
      
      const props = {
        label: 'Static label',
        count: 42,
      };

      const result = middleware(props, schema, context);

      expect(result).toEqual(props);
    });

    it('should handle empty props', () => {
      const middleware = createTemplateExpressionMiddleware(context);
      
      const props = {};
      const result = middleware(props, schema, context);

      expect(result).toEqual({});
    });
  });

  describe('templateExpressionMiddleware', () => {
    it('should work as default middleware instance', () => {
      const props = {
        label: '{{ $externalContext.user.name }}',
      };

      const result = templateExpressionMiddleware(props, schema, context);

      expect(result.label).toBe('John Doe');
    });

    it('should use context from middleware execution', () => {
      const customContext: MiddlewareContext = {
        externalContext: {
          user: { name: 'Jane Doe' },
        },
        formState: { firstName: 'Jane' },
      };

      const props = {
        label: '{{ $externalContext.user.name }}',
      };

      const result = templateExpressionMiddleware(props, schema, customContext);

      expect(result.label).toBe('Jane Doe');
    });
  });
});

