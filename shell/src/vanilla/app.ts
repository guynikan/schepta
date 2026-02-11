/**
 * Creates the root DOM element for the vanilla app (layout, tabs, panels).
 * Does not inject styles or attach event listeners.
 */
export function createAppRoot(): HTMLElement {
  const container = document.createElement('div');
  container.style.cssText = `
    padding: 2rem;
    background: #fffbf0;
    border-radius: 8px;
    margin: 1rem 0;
  `;

  container.innerHTML = `
    <div style="color: #f7df1e; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#f7df1e">
        <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"/>
      </svg>
      <h2 style="margin: 0; color: #333;">Vanilla JS Microfrontend - Schepta Forms</h2>
    </div>

    <div style="background: white; padding: 1.5rem; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div class="vanilla-tabs">
        <button type="button" class="vanilla-tab active" data-tab="simple">Simple Form</button>
        <button type="button" class="vanilla-tab" data-tab="complex">Complex Form</button>
      </div>

      <div class="vanilla-tab-content">
        <div id="simple-content" class="vanilla-tab-panel active">
          <h3>Simple Vanilla Form</h3>
          <p>Esta é uma demonstração básica do Schepta em Vanilla JS (monorepo unificado)</p>
          <div style="padding: 1rem; background: #fff3cd; border-radius: 4px; margin-top: 1rem;">
            <p><strong>✅ Funcionando!</strong> Este microfrontend Vanilla JS está rodando dentro do shell principal.</p>
          </div>
        </div>

        <div id="complex-content" class="vanilla-tab-panel">
          <h3>Complex Vanilla Form</h3>
          <p>Aqui seria um formulário mais complexo com Schepta</p>
        </div>
      </div>
    </div>
  `;

  return container;
}
