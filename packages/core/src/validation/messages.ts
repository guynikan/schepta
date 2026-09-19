/**
 * Shared validation message contracts used by FormSchema and semantic UiSpec
 * inputs. Keeping these templates together prevents renderer-specific wording
 * from drifting from Schepta's established validation output.
 */
export interface ValidationMessages {
  required?: string;
  minLength?: string;
  maxLength?: string;
  pattern?: string;
  minimum?: string;
  maximum?: string;
  format?: string;
}

/** Default validation messages with interpolation placeholders. */
export const DEFAULT_VALIDATION_MESSAGES: Required<ValidationMessages> = {
  required: '{{label}} is required',
  minLength: '{{label}} must be at least {{minLength}} characters',
  maxLength: '{{label}} must be at most {{maxLength}} characters',
  pattern: '{{label}} format is invalid',
  minimum: '{{label}} must be at least {{min}}',
  maximum: '{{label}} must be at most {{max}}',
  format: '{{label}} format is invalid',
};

/** Interpolate a Schepta validation message template with field data. */
export function interpolateValidationMessage(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => (
    data[key] !== undefined ? String(data[key]) : `{{${key}}}`
  ));
}
