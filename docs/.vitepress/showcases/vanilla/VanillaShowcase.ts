import { createAppRoot } from './app';

export function mountVanillaShowcase(containerId: string = 'vanilla-showcase-root'): void {
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error(`Container with id "${containerId}" not found`);
    return;
  }

  // Clear any existing content
  container.innerHTML = '';

  // Create and mount the vanilla app
  const appRoot = createAppRoot();
  container.appendChild(appRoot);
}

export function unmountVanillaShowcase(containerId: string = 'vanilla-showcase-root'): void {
  const container = document.getElementById(containerId);
  
  if (container) {
    container.innerHTML = '';
  }
}
