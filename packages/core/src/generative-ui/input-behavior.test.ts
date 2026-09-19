import { describe, expect, it } from 'vitest';
import { isUiElementVisible, resolveUiInputProps, validateUiInputBehavior } from './input-behavior';

describe('semantic input behavior', () => {
  it('preserves placeholders and resolves JEXL visibility through the shared expression pipeline', () => {
    const props = {
      placeholder: 'Email for {{ $formValues.name }}',
      visible: "{{ $formValues.plan === 'team' && $formValues.enabled === true }}",
    };
    const state = { name: 'Ada', plan: 'team', enabled: true };

    expect(resolveUiInputProps(props, state).placeholder).toBe('Email for Ada');
    expect(isUiElementVisible(props, state)).toBe(true);
    expect(isUiElementVisible(props, { ...state, enabled: false })).toBe(false);
  });

  it('formats required, length, pattern, and numeric errors consistently', () => {
    expect(validateUiInputBehavior('', { required: true }).errors).toEqual(['This field is required.']);
    expect(validateUiInputBehavior('a', { minLength: 2 }).errors).toEqual(['Enter at least 2 characters.']);
    expect(validateUiInputBehavior('abcd', { maxLength: 3 }).errors).toEqual(['Enter no more than 3 characters.']);
    expect(validateUiInputBehavior('bad', { pattern: '^ok$' }).errors).toEqual(['Enter a valid value.']);
    expect(validateUiInputBehavior(2, { min: 3, max: 5 }).errors).toEqual(['Enter a value of at least 3.']);
    expect(validateUiInputBehavior(6, { min: 3, max: 5 }).errors).toEqual(['Enter a value of no more than 5.']);
  });

  it('honors semantic validation overrides and reports invalid regular expressions', () => {
    expect(validateUiInputBehavior('', { validation: { required: true, requiredMessage: 'Name is mandatory.' } }).errors).toEqual(['Name is mandatory.']);
    expect(validateUiInputBehavior('Ada', { pattern: '[' }).errors).toEqual(['This field has an invalid validation pattern.']);
  });
});
