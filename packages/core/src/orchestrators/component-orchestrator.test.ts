import { describe, expect, it, vi } from 'vitest';
import complexForm from '../../../../instances/form/complex-form.json';
import { createComponentOrchestrator } from './component-orchestrator';

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
});
