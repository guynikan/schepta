import { describe, expect, it } from 'vitest';
import { createFormValidator } from './form-validator';

describe('form validator', () => {
  it('keeps object-level AJV errors in the form error map', () => {
    const validate = createFormValidator({
      type: 'object',
    } as any, { additionalProperties: false });

    const result = validate({ unexpected: true });

    expect(result.valid).toBe(false);
    expect(result.errors._form).toBeDefined();
  });
});
