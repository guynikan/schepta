import { describe, expect, it, vi } from 'vitest';
import complexForm from '../../../../instances/form/complex-form.json';
import { createComponentOrchestrator } from './component-orchestrator';
import { createComponentSpec } from '../registries/component-registry';

describe('createComponentOrchestrator', () => {
  const unresolvable = (onExpressionError: (error: unknown) => void, schema: unknown) => {
    // No component resolves: nothing renders, but the schema is still processed.
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
    return render('form', schema);
  };

  it('treats schema fields as declared even when their component does not resolve', () => {
    const onExpressionError = vi.fn();

    expect(unresolvable(onExpressionError, complexForm)).toBeNull();
    expect(onExpressionError).not.toHaveBeenCalled();
  });

  it('reports an undeclared reference inside a visibility comparison', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const onExpressionError = vi.fn();
    const schema = JSON.parse(JSON.stringify(complexForm).replace('$formValues.userInfo.maritalStatus', '$formValues.userInfo.maritalStatuss'));

    expect(unresolvable(onExpressionError, schema)).toBeNull();
    expect(onExpressionError).toHaveBeenCalledWith(expect.objectContaining({
      code: 'EXPRESSION_PATH_NOT_FOUND',
      missingPath: '$formValues.userInfo.maritalStatuss',
    }));
    vi.restoreAllMocks();
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
