import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { UiSpecRenderer } from '@schepta/renderer-react-mui';
import type { UiGenerationTrace, UiSpec } from '@schepta/core';
import { demoCatalog, demoSpec, type DemoMode, type PublicGenerationResponse } from './shared';
import { mountVueRenderer } from './vue-bridge';
import './styles.css';

const examples = [
  'Create a welcome flow for a new teammate',
  'Ask for a name before starting a product tour',
  'Make a tiny onboarding checkpoint',
];

function TraceInspector({ response }: { response: PublicGenerationResponse }): JSX.Element {
  const { trace, validation } = response;
  const decision = trace.decisions[0];
  return (
    <aside className="inspector" data-testid="trace-inspector">
      <div className="inspector-heading">
        <span className="eyebrow">Run trace</span>
        <span className="trace-dot" aria-label="Trace complete" />
      </div>
      <div className="trace-grid">
        <TraceValue label="Canonical" value={validation.valid ? 'yes' : 'no'} tone={validation.valid ? 'good' : 'bad'} />
        <TraceValue label="Provider" value={trace.provider} />
        <TraceValue label="Latency" value={`${trace.latencyMs} ms`} />
        <TraceValue label="Repair" value={trace.repairAttempts ? `${trace.repairAttempts} pass` : 'none'} />
        <TraceValue label="Fallback" value={trace.fallbackUsed ? 'used' : 'not used'} tone={trace.fallbackUsed ? 'warn' : 'good'} />
        <TraceValue label="JEV decision" value={decision ? `${decision.provider} → ${decision.selectedCandidateId ?? 'n/a'}` : 'not requested'} />
      </div>
      <p className="trace-note">
        JEV is a typed decision, routing, and validation signal — never a string generator.
      </p>
      {trace.failures.length > 0 && (
        <div className="trace-failures" role="status">
          {trace.failures.map((failure) => <span key={`${failure.code}-${failure.message}`}>{failure.code}: {failure.message}</span>)}
        </div>
      )}
    </aside>
  );
}

function TraceValue({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' | 'warn' }): JSX.Element {
  return (
    <div className="trace-value">
      <span>{label}</span>
      <strong className={tone ? `tone-${tone}` : undefined}>{value}</strong>
    </div>
  );
}

function App(): JSX.Element {
  const [prompt, setPrompt] = useState(examples[0]);
  const [mode, setMode] = useState<DemoMode>('offline');
  const [response, setResponse] = useState<PublicGenerationResponse>({
    spec: demoSpec,
    validation: { valid: true, errors: [], warnings: [], issues: [] },
    trace: {
      provider: 'offline-fixture',
      model: 'deterministic-fixture',
      startedAt: new Date(0).toISOString(),
      completedAt: new Date(0).toISOString(),
      latencyMs: 0,
      decisions: [{ provider: 'deterministic', selectedCandidateId: 'model', confidence: 1, latencyMs: 0 }],
      failures: [],
      fallbackUsed: false,
      repairAttempts: 0,
    },
  });
  const [promptError, setPromptError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const vuePanelRef = useRef<HTMLDivElement>(null);

  const handleRendererSubmit = useCallback(() => {
    setActionSuccess('Declarative submit accepted — both renderers ran the same action.');
  }, []);

  useEffect(() => {
    if (!vuePanelRef.current) return undefined;
    return mountVueRenderer(vuePanelRef.current, {
      spec: response.spec,
      success: actionSuccess,
      onSubmit: handleRendererSubmit,
    });
  }, [actionSuccess, handleRendererSubmit, response.spec]);

  async function submitPrompt(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) {
      setPromptError('A natural-language prompt is required.');
      return;
    }
    setPromptError('');
    setActionSuccess('');
    setIsGenerating(true);
    try {
      const result = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt: cleanPrompt, mode }),
      });
      const body = await result.json() as PublicGenerationResponse & { message?: string };
      if (!result.ok || !body.spec || !body.trace || !body.validation) throw new Error(body.message ?? 'Generation failed.');
      setResponse({ spec: body.spec, trace: body.trace, validation: body.validation });
    } catch (error) {
      setPromptError(error instanceof Error ? error.message : 'Generation failed.');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className="workbench-shell">
      <header className="topbar">
        <div className="brand-lockup"><span className="brand-mark">S</span><span>SCHEPTA</span><span className="brand-slash">/</span><span>GEN UI LAB</span></div>
        <span className="branch-tag">EXPERIMENTAL BRANCH · SYSTEM ONE READY</span>
      </header>

      <section className="hero">
        <div className="hero-kicker"><span className="signal-line" /> Semantic UI workbench</div>
        <h1>One spec.<br /><em>Two realities.</em></h1>
        <p className="hero-copy">Describe an interface in plain language. Schepta returns a validated, canonical UiSpec and lets two framework renderers prove the same contract in parallel.</p>
      </section>

      <section className="prompt-console" aria-label="Generation controls">
        <div className="console-label"><span className="console-index">01</span><span>Natural-language input</span><span className="console-rule" /></div>
        <form onSubmit={submitPrompt} noValidate>
          <div className="prompt-row">
            <textarea
              data-testid="prompt-input"
              aria-label="Natural-language prompt"
              aria-invalid={Boolean(promptError)}
              value={prompt}
              onChange={(event) => { setPrompt(event.target.value); if (promptError) setPromptError(''); }}
              placeholder="Describe the experience you want to generate…"
              required
              rows={2}
            />
            <div className="prompt-actions">
              <label className="mode-select"><span>Mode</span><select data-testid="mode-select" value={mode} onChange={(event) => setMode(event.target.value as DemoMode)}><option value="offline">Offline / deterministic</option><option value="openai">OpenAI / structured</option></select></label>
              <button data-testid="generate-button" className="generate-button" type="submit" disabled={isGenerating}>{isGenerating ? 'Generating…' : 'Generate'}<span>↗</span></button>
            </div>
          </div>
          {promptError && <p className="prompt-error" data-testid="prompt-validation" role="alert">{promptError}</p>}
        </form>
        <div className="example-prompts"><span>Try an example</span>{examples.map((example) => <button key={example} type="button" onClick={() => { setPrompt(example); setPromptError(''); }}>{example}</button>)}</div>
      </section>

      <TraceInspector response={response} />

      <section className="renderer-section" aria-label="Renderer comparison">
        <div className="section-heading"><span className="console-index">02</span><h2>Same UiSpec / different surfaces</h2><span className="same-spec-pill">● IDENTICAL INPUT</span></div>
        <div className="renderer-grid">
          <article className="renderer-card renderer-card-react">
            <div className="renderer-card-header"><div><span className="renderer-chip">REACT</span><h3>Material UI</h3></div><span className="renderer-status">LIVE</span></div>
            <div className="renderer-mount" data-testid="react-renderer"><UiSpecRenderer spec={response.spec} catalog={demoCatalog} success={actionSuccess || undefined} onAction={({ action }) => { if (action === 'submit_prompt') handleRendererSubmit(); }} /></div>
          </article>
          <article className="renderer-card renderer-card-vue">
            <div className="renderer-card-header"><div><span className="renderer-chip">VUE</span><h3>Vuetify</h3></div><span className="renderer-status">LIVE</span></div>
            <div className="renderer-mount vue-mount" data-testid="vue-renderer" ref={vuePanelRef} />
          </article>
        </div>
        {actionSuccess && <div className="action-success" data-testid="action-success" role="status"><span>✓</span>{actionSuccess}</div>}
      </section>

      <footer className="footnote"><span>UiSpec 1.0 · JSON only at the browser boundary</span><span>Secrets stay server-side · no JSX or Vue templates cross the API</span></footer>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
