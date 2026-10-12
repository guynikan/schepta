/**
 * Compatibility with the expression values produced before diagnostics existed.
 *
 * Every `main` value below was obtained by running this table against commit
 * 19b4abb (the last commit on main without expression diagnostics), not by
 * reading the code. Diagnostics are a side channel: in default mode they must
 * not change what an expression evaluates to. The only accepted differences
 * are rows with a `pr` value, and each one states why:
 *
 * - `evaluates`: main resolved the expression to undefined because it treated
 *   a valid JEXL expression as a property path. It is now evaluated.
 * - `forbidden`: the expression walks `__proto__`, `prototype` or
 *   `constructor`, which is refused on purpose.
 *
 * To re-check the baseline, copy this file into a checkout of 19b4abb next to
 * `template-processor.ts`, add a `diagnostics.ts` there exporting a
 * `createExpressionDiagnostics` that returns undefined, and run it with
 * SCHEPTA_COMPAT_BASELINE=main. Every row must pass against its `main` value.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { processValue } from './template-processor';
import { createCustomResolver, createDefaultResolver, type ResolverContext } from './variable-resolver';
import { createExpressionDiagnostics } from './diagnostics';

const BASELINE = process.env.SCHEPTA_COMPAT_BASELINE === 'main';

class Account {
  plan = 'pro';
  get fullName() { return 'Ada Lovelace'; }
}

const full = (): ResolverContext => ({
  formValues: {
    firstName: 'Ana',
    age: 30,
    price: 3,
    flag: false,
    empty: '',
    nothing: null,
    tags: ['t1', 't2'],
    address: { city: 'Recife', zip: null },
    items: [{ name: 'x', price: 2 }, { name: 'y', price: 5 }],
    'a-b': 5,
  },
  externalContext: {
    user: { name: 'x', profile: null },
    account: new Account(),
    proxy: new Proxy({}, { get: (_, key) => `P:${String(key)}` }),
    enabled: true,
    list: [1, 2, 3],
    'a/b': 7,
    'x+y': 8,
    'api-url': 'https://api',
  },
});

const small = (): ResolverContext => ({ formValues: { a: 1 }, externalContext: { b: 2 } });

const custom = (context: ResolverContext) => createCustomResolver(context, {
  $i18n: path => `T(${path})`,
  $now: () => 'NOW',
  $opt: () => undefined,
});

interface Row {
  value: unknown;
  /** Value returned by main (19b4abb). */
  main: unknown;
  /** Value returned now, when it differs on purpose. */
  pr?: unknown;
  why?: 'evaluates' | 'forbidden';
  context?: () => ResolverContext;
  resolver?: typeof custom;
}

const rows: Row[] = [
  // Simple paths
  { value: '{{ $formValues.firstName }}', main: 'Ana' },
  { value: '{{ $formValues.age }}', main: 30 },
  { value: '{{ $formValues.flag }}', main: false },
  { value: '{{ $formValues.empty }}', main: '' },
  { value: '{{ $formValues.nothing }}', main: null },
  { value: '{{ $externalContext.user.name }}', main: 'x' },
  { value: '{{ $formValues }}', main: { a: 1 }, context: small },
  { value: '{{ $externalContext }}', main: { b: 2 }, context: small },
  { value: '{{$formValues.firstName}}', main: 'Ana' },

  // Nested paths
  { value: '{{ $formValues.address.city }}', main: 'Recife' },
  { value: '{{ $formValues.address }}', main: { city: 'Recife', zip: null } },
  { value: '{{ $formValues.tags.length }}', main: 2 },
  { value: '{{ $formValues.firstName.length }}', main: 3 },
  { value: '{{ $formValues.tags }}', main: ['t1', 't2'] },

  // Missing paths and unknown roots
  { value: '{{ $formValues.emial }}', main: undefined },
  { value: '{{ $formValues.address.zip.code }}', main: undefined },
  { value: '{{ $externalContext.missing.deep }}', main: undefined },
  { value: '{{ $externalContext.user.nickname }}', main: undefined },
  { value: '{{ $typo.value }}', main: undefined },
  { value: '{{ invalid }}', main: undefined },
  { value: '{{ $formValues. }}', main: undefined },

  // Comparisons
  { value: "{{ $formValues.firstName === 'Ana' }}", main: true },
  { value: "{{ $formValues.firstName !== 'Ana' }}", main: false },
  { value: '{{ $formValues.age >= 18 }}', main: true },
  { value: '{{ $formValues.age < 18 }}', main: false },
  { value: "{{ $formValues.emial === 'a' }}", main: false },
  { value: "{{ $formValues.emial != 'a' }}", main: true },
  { value: '{{ $session.admin == true }}', main: false },
  { value: '{{ $formValues.nothing == null }}', main: true },
  { value: '{{ $formValues.emial == undefined }}', main: true },
  { value: '{{ $formValues.price + 1 > 3 }}', main: true },

  // Conditions over optional $externalContext keys
  { value: '{{ $externalContext.user.isAdmin == true }}', main: false },
  { value: "{{ $externalContext.user.role != 'admin' }}", main: true },
  { value: "{{ $externalContext.user.nickname != 'x' }}", main: true },
  { value: '{{ $externalContext.user.profile && $externalContext.user.profile.bio }}', main: null },

  // Arithmetic and other operators main read as a path
  { value: '{{ $formValues.price * 2 }}', main: undefined, pr: 6, why: 'evaluates' },
  { value: '{{ $formValues.price - 1 }}', main: undefined, pr: 2, why: 'evaluates' },
  { value: '{{ $formValues.price*2 }}', main: undefined, pr: 6, why: 'evaluates' },
  { value: 'Total: {{ $formValues.price * 2 }}', main: 'Total: ', pr: 'Total: 6', why: 'evaluates' },
  { value: '{{ $formValues.pricee * 2 }}', main: undefined, pr: NaN, why: 'evaluates' },
  { value: '{{ !$formValues.flag }}', main: undefined, pr: true, why: 'evaluates' },
  { value: '{{ 1 + 2 }}', main: undefined, pr: 3, why: 'evaluates' },
  { value: "{{ 'literal' }}", main: undefined, pr: 'literal', why: 'evaluates' },
  { value: '{{ true }}', main: undefined, pr: true, why: 'evaluates' },
  { value: "{{ $formValues.age + ' years' }}", main: undefined, pr: '30 years', why: 'evaluates' },
  { value: "{{ '$USD' + $formValues.price }}", main: undefined, pr: '$USD3', why: 'evaluates' },
  { value: '{{ [$formValues.age, 1] }}', main: undefined, pr: [30, 1], why: 'evaluates' },
  { value: "{{ 'n' in $formValues.firstName }}", main: undefined, pr: true, why: 'evaluates' },

  // Guards
  { value: "{{ $externalContext.locale || 'en' }}", main: 'en' },
  { value: "{{ $formValues.firstName || 'anon' }}", main: 'Ana' },
  { value: '{{ $formValues.firstName && $formValues.firstName.length > 2 }}', main: true },
  { value: '{{ $formValues.emial && $formValues.emial.length > 2 }}', main: undefined },
  { value: '{{ $formValues.flag || $formValues.empty }}', main: '' },
  { value: '{{ $formValues.age > 18 && $externalContext.enabled }}', main: true },

  // Ternaries
  { value: "{{ $formValues.age >= 18 ? 'adult' : 'minor' }}", main: 'adult' },
  { value: "{{ $formValues.emial === 'x' ? 'a' : 'b' }}", main: 'b' },
  { value: "{{ $formValues.flag ? 'a' : 'b' }}", main: undefined, pr: 'b', why: 'evaluates' },
  { value: "{{ $formValues.emial ? 'a' : 'b' }}", main: undefined, pr: 'b', why: 'evaluates' },
  { value: "{{ $session.admin ? 'a' : 'b' }}", main: undefined, pr: 'b', why: 'evaluates' },

  // Class instances with getters
  { value: '{{ $externalContext.account.fullName }}', main: 'Ada Lovelace' },
  { value: '{{ $externalContext.account.plan }}', main: 'pro' },
  { value: '{{ $externalContext.account.missing }}', main: undefined },
  { value: "{{ $externalContext.account.fullName == 'Ada Lovelace' }}", main: true },

  // Get-only Proxy
  { value: '{{ $externalContext.proxy.anything }}', main: 'P:anything' },
  { value: "{{ $externalContext.proxy.anything == 'P:anything' }}", main: true },
  { value: 'Hi {{ $externalContext.proxy.name }}', main: 'Hi P:name' },

  // Keys containing operator characters
  { value: '{{ $externalContext.a/b }}', main: 7 },
  { value: '{{ $externalContext.x+y }}', main: 8 },
  { value: '{{ $externalContext.api-url }}', main: 'https://api' },
  { value: '{{ $formValues.a-b }}', main: 5 },
  { value: '{{ $externalContext.c/d }}', main: undefined },
  { value: '{{ $externalContext.user-id }}', main: undefined },
  { value: 'URL: {{ $externalContext.api-url }}/v1', main: 'URL: https://api/v1' },

  // Custom resolver roots
  { value: '{{ $i18n.hello }}', main: 'T(hello)', resolver: custom },
  { value: '{{ $now }}', main: 'NOW', resolver: custom },
  { value: '{{ $opt.anything }}', main: undefined, resolver: custom },
  { value: 'Hi {{ $i18n.hello }} {{ $now }}', main: 'Hi T(hello) NOW', resolver: custom },
  { value: "{{ $i18n.hello == 'T(hello)' }}", main: false, resolver: custom },
  { value: '{{ $formValues.firstName }}', main: 'Ana', resolver: custom },
  { value: '{{ $i18n.hello }}', main: undefined },

  // Multiple templates in one string
  { value: '{{ $formValues.firstName }} - {{ $externalContext.user.name }}', main: 'Ana - x' },
  { value: '{{ $formValues.emial }}|{{ $formValues.age }}', main: '|30' },
  { value: '{{ $formValues.age > 18 }} and {{ $formValues.flag }}', main: 'true and false' },
  { value: '{{ $formValues.nothing }} / {{ $formValues.flag }}', main: ' / false' },
  { value: 'Hi {{$formValues.firstName}}', main: 'Hi {{$formValues.firstName}}' },

  // Non-string values
  { value: 42, main: 42 },
  { value: true, main: true },
  { value: null, main: null },
  { value: undefined, main: undefined },
  { value: 'plain text', main: 'plain text' },
  { value: { a: 1, b: [1, 2] }, main: { a: 1, b: [1, 2] } },
  { value: ['{{ $formValues.flag }}', 'plain'], main: [false, 'plain'] },
  {
    value: {
      label: '{{ $formValues.firstName }}',
      nested: { on: '{{ $formValues.age > 18 }}', list: ['{{ $formValues.age }}', 7, null] },
    },
    main: { label: 'Ana', nested: { on: true, list: [30, 7, null] } },
  },

  // Array index and filter access
  { value: "{{ $formValues.items[0].name == 'x' }}", main: true },
  { value: '{{ $formValues.items[.price > 3][0].name }}', main: 'y' },
  { value: '{{ $formValues.items[0].name }}', main: undefined, pr: 'x', why: 'evaluates' },
  { value: '{{ $externalContext.list[1] }}', main: undefined, pr: 2, why: 'evaluates' },
  { value: "{{ $formValues['firstName'] }}", main: undefined, pr: 'Ana', why: 'evaluates' },

  // Syntax and evaluation errors
  { value: '{{ 1 === }}', main: undefined },
  { value: '{{ $formValues.firstName + }}', main: undefined },
  { value: '{{ $formValues.firstName|upper }}', main: undefined },

  // Forbidden segments
  { value: '{{ $formValues.constructor.name }}', main: 'Object', pr: undefined, why: 'forbidden' },
  { value: "{{ $formValues.constructor.name == 'Object' }}", main: undefined },
];

const declaredFormPaths = new Set([
  'firstName', 'age', 'price', 'flag', 'empty', 'nothing', 'tags', 'address.city', 'address.zip', 'items', 'a-b',
]);

/** Each way diagnostics can be wired in default mode; none may change a value. */
const variants: Array<{ name: string; extend: (context: ResolverContext) => ResolverContext }> = BASELINE
  ? [{ name: 'main baseline', extend: context => context }]
  : [
      { name: 'without diagnostics', extend: context => context },
      { name: 'with diagnostics, onError unset', extend: context => ({ ...context, diagnostics: createExpressionDiagnostics() }) },
      {
        name: "with diagnostics, onError 'warn' and declared paths",
        extend: context => ({
          ...context,
          declaredFormPaths,
          diagnostics: createExpressionDiagnostics({ onError: 'warn', onExpressionError: () => undefined }),
        }),
      },
    ];

afterEach(() => vi.restoreAllMocks());

describe('expression values match main (19b4abb)', () => {
  it('covers enough expressions and documents every difference', () => {
    expect(rows.length).toBeGreaterThanOrEqual(60);
    for (const row of rows) {
      expect('pr' in row).toBe(row.why !== undefined);
    }
    // Apart from forbidden segments, a value only changes where main gave nothing.
    for (const row of rows.filter(candidate => candidate.why === 'evaluates')) {
      expect([undefined, 'Total: ']).toContain(row.main);
    }
  });

  describe.each(variants)('$name', ({ extend }) => {
    it.each(rows.map((row, index) => [`#${index + 1} ${JSON.stringify(row.value)}`, row] as const))('%s', (_, row) => {
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const context = extend((row.context ?? full)());
      const resolver = (row.resolver ?? createDefaultResolver)(context);
      const expected = !BASELINE && 'pr' in row ? row.pr : row.main;

      expect(processValue(row.value, resolver, context)).toStrictEqual(expected);
    });
  });
});
