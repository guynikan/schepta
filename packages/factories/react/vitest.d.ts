/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

import type { AxeMatchers } from 'vitest-axe/matchers';

declare global {
  namespace Chai {
    interface Assertion extends AxeMatchers {}
  }
}
