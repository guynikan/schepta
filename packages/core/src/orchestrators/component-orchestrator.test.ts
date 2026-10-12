import { describe, expect, it, vi } from 'vitest';
import complexForm from '../../../../instances/form/complex-form.json';
import { createComponentOrchestrator } from './component-orchestrator';

describe('createComponentOrchestrator', () => {
  it('does not diagnose declared fields omitted from partial initial values', () => {
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
    expect(onExpressionError).not.toHaveBeenCalled();
  });
});
