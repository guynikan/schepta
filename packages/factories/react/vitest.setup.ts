import '@testing-library/jest-dom';
import { expect } from 'vitest';
import * as matchers from 'vitest-axe/matchers';

// Registers `toHaveNoViolations`, used by the a11y suites to run axe against
// each factory's rendered output.
expect.extend(matchers);
