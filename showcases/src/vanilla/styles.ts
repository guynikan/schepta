export const vanillaStyles = `
  .vanilla-tabs { display: flex; border-bottom: 1px solid #ddd; margin-bottom: 1rem; }
  .vanilla-tab { padding: 0.5rem 1rem; border: none; background: none; cursor: pointer; border-bottom: 2px solid transparent; font-family: inherit; }
  .vanilla-tab.active { border-bottom-color: #f7df1e; color: #333; font-weight: 600; }
  .vanilla-tab:hover { background-color: #f5f5f5; }
  .vanilla-tab-content { padding: 1rem 0; }
  .vanilla-tab-panel { display: none; }
  .vanilla-tab-panel.active { display: block; }
  .vanilla-tab-panel h3 { margin-bottom: 0.5rem; color: #333; }
  .vanilla-tab-panel p { color: #666; line-height: 1.5; }
`;
