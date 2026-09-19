import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { validateUiSpec } from '@schepta/core';
import { UiSpecRenderer } from '@schepta/renderer-react-mui';
import { demoCatalog, onboardingSpec } from './shared';
import './styles.css';

function App(): JSX.Element {
  const [completed, setCompleted] = useState(false);
  const report = validateUiSpec(onboardingSpec, { catalog: demoCatalog });
  if (!report.valid) throw new Error(`Checked-in UiSpec is invalid: ${report.errors.map((issue) => issue.code).join(', ')}`);
  return <main className="harness"><header><span>SCHEPTA</span><small>GENERATIVE UI HARNESS / REACT + MUI</small></header><section className="intro"><p>Versioned semantic interface</p><h1>Onboarding is <em>data.</em></h1><p>The app imports <code>src/ui/onboarding.ui.json</code>; no browser prompt, model endpoint, API key, or framework code is part of the generation boundary.</p></section><section className="proof"><div><h2>Accepted UiSpec</h2><p>Catalog validation passed. React/MUI is resolved only at this renderer boundary.</p><UiSpecRenderer spec={onboardingSpec} catalog={demoCatalog} success={completed ? 'Onboarding action accepted.' : undefined} onAction={({ action }) => { if (action === 'submit') setCompleted(true); }} /></div><aside><h2>Codex handoff</h2><ol><li>Inspect the catalog with the local CLI.</li><li>Ask Codex to create or update the JSON artifact.</li><li>Validate it; feed structured errors back for at most two corrections.</li></ol><p>Unsupported requests such as a <code>DatePicker</code> are rejected naturally because they are absent from the registry. The worker, not this browser, owns the real prompt and correction loop.</p><pre>{JSON.stringify({ accepted: report.valid, components: Object.keys(demoCatalog.components), artifact: 'src/ui/onboarding.ui.json' }, null, 2)}</pre></aside></section></main>;
}

createRoot(document.getElementById('root')!).render(<App />);
