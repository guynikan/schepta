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

  it('uses the original Schepta message templates and interpolation placeholders', () => {
    expect(validateUiInputBehavior('', { label: 'Name', required: true }).errors).toEqual(['Name is required']);
    expect(validateUiInputBehavior('a', { label: 'Name', minLength: 2 }).errors).toEqual(['Name must be at least 2 characters']);
    expect(validateUiInputBehavior('abcd', { label: 'Name', maxLength: 3 }).errors).toEqual(['Name must be at most 3 characters']);
    expect(validateUiInputBehavior('bad', { label: 'Email', pattern: '^ok$' }).errors).toEqual(['Email format is invalid']);
    expect(validateUiInputBehavior(2, { label: 'Seats', min: 3, max: 5 }).errors).toEqual(['Seats must be at least 3']);
    expect(validateUiInputBehavior(6, { label: 'Seats', min: 3, max: 5 }).errors).toEqual(['Seats must be at most 5']);
    expect(validateUiInputBehavior('', { label: 'Name', validation: { required: true, requiredMessage: '{{label}} cannot be blank' } }).errors).toEqual(['Name cannot be blank']);
  });

  it('requires checked checkboxes and non-empty selections', () => {
    expect(validateUiInputBehavior(false, { label: 'Terms', required: true }, { component: 'Checkbox' }).errors).toEqual(['Terms is required']);
    expect(validateUiInputBehavior(true, { label: 'Terms', required: true }, { component: 'Checkbox' }).valid).toBe(true);
    expect(validateUiInputBehavior('', { label: 'Plan', required: true }, { component: 'ChoiceGroup' }).errors).toEqual(['Plan is required']);
    expect(validateUiInputBehavior([], { label: 'Plan', required: true }, { component: 'ChoiceGroup' }).errors).toEqual(['Plan is required']);
  });

  it('honors semantic validation overrides and maps invalid patterns to the standard contract', () => {
    expect(validateUiInputBehavior('Ada', { label: 'Name', pattern: '[' }).errors).toEqual(['Name format is invalid']);
  });
});
