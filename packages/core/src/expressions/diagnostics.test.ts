import { afterEach, describe, expect, it, vi } from 'vitest';
import complexForm from '../../../../instances/form/complex-form.json';
import { collectDeclaredFormPaths, createExpressionDiagnostics, type ExpressionDiagnosticDetails } from './diagnostics';

afterEach(() => vi.restoreAllMocks());

describe('collectDeclaredFormPaths', () => {
  it('uses real form field names instead of schema container paths', () => {
    const paths = collectDeclaredFormPaths(complexForm);

    expect(paths).toContain('userInfo.maritalStatus');
    expect(paths).not.toContain('userInfo.fields.basicInfo.maritalStatus.maritalStatus');
  });
});

describe('collectDeclaredFormPaths with a component registry', () => {
  const schema = {
    type: 'object',
    'x-component': 'FormContainer',
    properties: {
      profile: {
        type: 'object',
        'x-component': 'Section',
        properties: {
          rating: { type: 'number', 'x-component': 'RatingStars' },
          nickname: { type: 'string', 'x-component': 'InputText' },
          note: { type: 'object', 'x-component': 'Note' },
        },
      },
    },
  };

  it('uses the registry answer when the component resolves', () => {
    const paths = collectDeclaredFormPaths(schema, node => node['x-component'] === 'RatingStars');

    expect([...paths]).toEqual(['profile.rating']);
  });

  it('falls back to the schema when the component does not resolve', () => {
    const paths = collectDeclaredFormPaths(schema, () => undefined);

    expect(paths).toContain('profile.rating');
    expect(paths).toContain('profile.nickname');
    expect(paths).not.toContain('profile.note');
  });
});

describe('createExpressionDiagnostics', () => {
  const details: ExpressionDiagnosticDetails = {
    code: 'EXPRESSION_PATH_NOT_FOUND', expression: '$formValues.emial', path: 'x-ui.visible', missingPath: '$formValues.emial',
  };

  it('keeps de-duplication while calling the latest handler and mode', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const first = vi.fn();
    const second = vi.fn();
    let config: { onError?: 'warn' | 'throw'; onExpressionError: (error: unknown) => void } = { onExpressionError: first };
    const diagnostics = createExpressionDiagnostics(() => config);

    diagnostics.report(details);
    config = { onExpressionError: second };
    diagnostics.report(details);
    diagnostics.report({ ...details, path: 'x-ui.disabled' });

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledWith(expect.objectContaining({ path: 'x-ui.disabled' }));

    config = { onError: 'throw', onExpressionError: second };
    expect(() => diagnostics.report(details)).toThrow(expect.objectContaining({ code: 'EXPRESSION_PATH_NOT_FOUND' }));
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('never throws for a soft problem', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const diagnostics = createExpressionDiagnostics({ onError: 'throw' });

    expect(() => diagnostics.report({ ...details, strict: false })).not.toThrow();
    expect(() => diagnostics.report(details)).toThrow();
  });
});
