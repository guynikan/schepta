/**
 * Attaches tab click behavior to the root element: toggles .active on tabs and panels.
 */
export function attachTabBehavior(root: HTMLElement): void {
  const tabs = root.querySelectorAll('.vanilla-tab');
  const panels = root.querySelectorAll('.vanilla-tab-panel');

  tabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      const target = e.target as HTMLButtonElement;
      const targetTab = target.dataset.tab;
      if (!targetTab) return;

      tabs.forEach((t) => t.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));

      target.classList.add('active');
      const panel = root.querySelector(`#${targetTab}-content`);
      panel?.classList.add('active');
    });
  });
}
