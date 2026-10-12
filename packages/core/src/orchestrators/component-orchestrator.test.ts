import { describe, expect, it, vi } from 'vitest';
import complexForm from '../../../../instances/form/complex-form.json';
import { createComponentOrchestrator } from './component-orchestrator';
import { createComponentSpec } from '../registries/component-registry';

describe('createComponentOrchestrator', () => {
  it('reports an undeclared reference inside a visibility comparison', () => {
    const onExpressionError = vi.fn();
    const render = createComponentOrchestrator(
      () => ({
        components: {},
        externalContext: {},
        state: { userInfo: { firstName: 'Ana' } },
        middlewares: [],
        expressions: { onExpressionError },
      }),
      {} as any,
    );

    expect(render('form', complexForm)).toBeNull();
    expect(onExpressionError).toHaveBeenCalledWith(expect.objectContaining({
      code: 'EXPRESSION_PATH_NOT_FOUND',
      missingPath: '$formValues.userInfo.maritalStatus',
    }));
  });

  it('treats a registered custom field as declared before it has a value', () => {
    const onExpressionError = vi.fn();
    const schema = {
      type: 'object', 'x-component': 'FormContainer', properties: {
        rating: { type: 'string', 'x-component': 'RatingStars', 'x-custom': true, 'x-ui': { visible: '{{ $formValues.rating }}' } },
      },
    };
    const render = createComponentOrchestrator(
      () => ({
        components: { FormContainer: createComponentSpec({ id: 'FormContainer', type: 'container', component: () => null }) },
        customComponents: { rating: createComponentSpec({ id: 'RatingStars', type: 'field', component: () => null }) },
        externalContext: {}, state: {}, middlewares: [], expressions: { onExpressionError },
      }),
      { create: () => null } as any,
    );

    render('FormContainer', schema);
    expect(onExpressionError).not.toHaveBeenCalled();
  });
});
