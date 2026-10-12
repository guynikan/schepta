import { describe, expect, it } from 'vitest';
import complexForm from '../../../../instances/form/complex-form.json';
import { collectDeclaredFormPaths } from './diagnostics';

describe('collectDeclaredFormPaths', () => {
  it('uses real form field names instead of schema container paths', () => {
    const paths = collectDeclaredFormPaths(complexForm);

    expect(paths).toContain('userInfo.maritalStatus');
    expect(paths).not.toContain('userInfo.fields.basicInfo.maritalStatus.maritalStatus');
  });
});
