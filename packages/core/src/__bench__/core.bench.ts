import { bench, describe } from 'vitest';
import { processValue, needsProcessing } from '../expressions/template-processor';
import { createDefaultResolver } from '../expressions/variable-resolver';
import { applyMiddlewares } from '../middleware/types';
import { resolveSpec, createComponentOrchestrator, type FactorySetupResult } from '../orchestrators/component-orchestrator';
import {
  createBenchSchema,
  createBenchFormValues,
  createBenchComponents,
  createBenchRenderers,
  NoopRuntimeAdapter,
} from './helpers';

const ctx = {
  formValues: createBenchFormValues(50),
  externalContext: {
    placeholders: Object.fromEntries(
      Array.from({ length: 50 }, (_, i) => [`field_${i}`, `placeholder_${i}`])
    ),
  },
};
const resolver = createDefaultResolver(ctx);

const schema10Static = createBenchSchema(10, 0);
const schema50Static = createBenchSchema(50, 0);
const schema100Static = createBenchSchema(100, 0);
const schema50Dynamic = createBenchSchema(50, 10);
const schema10Dynamic = createBenchSchema(10, 10);

// ─── processValue ─────────────────────────────────────────────────────────────

describe('processValue', () => {
  bench('10 campos estaticos', () => {
    processValue(schema10Static, resolver, ctx);
  });

  bench('50 campos estaticos', () => {
    processValue(schema50Static, resolver, ctx);
  });

  bench('100 campos estaticos', () => {
    processValue(schema100Static, resolver, ctx);
  });

  bench('50 campos com 10 templates', () => {
    processValue(schema50Dynamic, resolver, ctx);
  });

  bench('10 campos com 10 templates (JEXL-heavy)', () => {
    const jexlSchema = createBenchSchema(10, 0);
    const section = jexlSchema.properties.section1.properties.fields.properties.row1.properties;
    let i = 0;
    for (const key of Object.keys(section)) {
      section[key].properties[`input_${i}`]['x-component-props'].label =
        `{{ $formValues.section1.input_0 === 'value_0' }}`;
      i++;
    }
    processValue(jexlSchema, resolver, ctx);
  });
});

// ─── needsProcessing ──────────────────────────────────────────────────────────

describe('needsProcessing', () => {
  bench('50 campos estaticos (returns false)', () => {
    needsProcessing(schema50Static);
  });

  bench('50 campos com templates (returns true)', () => {
    needsProcessing(schema50Dynamic);
  });
});

// ─── resolveSpec ──────────────────────────────────────────────────────────────

describe('resolveSpec', () => {
  const components = createBenchComponents();
  const renderers = createBenchRenderers();

  bench('lookup InputText', () => {
    resolveSpec({ 'x-component': 'InputText' }, 'InputText', components, {}, renderers);
  });
});

// ─── applyMiddlewares ─────────────────────────────────────────────────────────

describe('applyMiddlewares', () => {
  const m1 = (props: any) => ({ ...props, m1: true });
  const m2 = (props: any) => ({ ...props, m2: true });
  const m3 = (props: any) => ({ ...props, m3: true });
  const baseProps = { name: 'test', value: 'hello' };
  const mwCtx = { formValues: {}, externalContext: {} };

  bench('pipeline de 3 middlewares', () => {
    applyMiddlewares(baseProps, {}, [m1, m2, m3], mwCtx);
  });
});

// ─── Full orchestrator render ─────────────────────────────────────────────────

describe('orchestrator full render', () => {
  const components = createBenchComponents();
  const renderers = createBenchRenderers();
  const runtime = new NoopRuntimeAdapter();

  function makeSetup(schema: any): () => FactorySetupResult {
    return () => ({
      components,
      renderers,
      externalContext: ctx.externalContext,
      state: ctx.formValues,
      middlewares: [],
      debug: undefined,
      formAdapter: undefined,
    });
  }

  bench('render 10 campos', () => {
    const render = createComponentOrchestrator(makeSetup(schema10Static), runtime);
    render('FormContainer', schema10Static);
  });

  bench('render 50 campos', () => {
    const render = createComponentOrchestrator(makeSetup(schema50Static), runtime);
    render('FormContainer', schema50Static);
  });

  bench('render 100 campos', () => {
    const render = createComponentOrchestrator(makeSetup(schema100Static), runtime);
    render('FormContainer', schema100Static);
  });

  bench('render 50 campos com 10 templates', () => {
    const render = createComponentOrchestrator(makeSetup(schema50Dynamic), runtime);
    render('FormContainer', schema50Dynamic);
  });
});

// ─── Repeated render (simulates React re-render with same schema) ─────────────

describe('orchestrator repeated render (warm cache)', () => {
  const components = createBenchComponents();
  const renderers = createBenchRenderers();
  const runtime = new NoopRuntimeAdapter();

  const render50 = createComponentOrchestrator(() => ({
    components,
    renderers,
    externalContext: ctx.externalContext,
    state: ctx.formValues,
    middlewares: [],
    debug: undefined,
    formAdapter: undefined,
  }), runtime);
  // Warm up cache
  render50('FormContainer', schema50Static);

  const render100 = createComponentOrchestrator(() => ({
    components,
    renderers,
    externalContext: ctx.externalContext,
    state: ctx.formValues,
    middlewares: [],
    debug: undefined,
    formAdapter: undefined,
  }), runtime);
  render100('FormContainer', schema100Static);

  bench('re-render 50 campos estaticos (cached)', () => {
    render50('FormContainer', schema50Static);
  });

  bench('re-render 100 campos estaticos (cached)', () => {
    render100('FormContainer', schema100Static);
  });
});
