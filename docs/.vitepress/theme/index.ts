import DefaultTheme from 'vitepress/theme';
import './custom.css';
import { defineAsyncComponent } from 'vue';
import { Terminal, Copy, Check } from 'lucide-vue-next';


export default {
  ...DefaultTheme,
  enhanceApp({ app, router }) {
    app.component('CodeSandboxEmbed', defineAsyncComponent(() => import('../../components/examples/CodeSandboxEmbed.vue')));
    app.component('TerminalIcon', Terminal);
    app.component('CopyIcon', Copy);
    app.component('CheckIcon', Check);
    
    if (typeof window !== 'undefined') {
      const handleLanguageClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const link = target.closest('a[href]') as HTMLAnchorElement;
        
        if (link && link.href) {
          // Check if this is a language selector link
          const translationsContainer = link.closest('.VPNavBarTranslations');
          if (!translationsContainer) return;
          
          e.preventDefault();
          e.stopPropagation();
          
          const url = new URL(link.href);
          const pathname = url.pathname;
          
          // Extract target locale from the link
          let targetLocale = 'en-US';
          if (pathname.includes('/pt-BR')) {
            targetLocale = 'pt-BR';
          } else if (pathname.includes('/es-ES')) {
            targetLocale = 'es-ES';
          } else if (pathname.includes('/en-US')) {
            targetLocale = 'en-US';
          }
          
          // Get current path and remove ALL locale prefixes
          const currentPath = window.location.pathname;
          let cleanPath = currentPath
            .replace(/^\/pt-BR\//, '/')
            .replace(/^\/pt-BR$/, '/')
            .replace(/^\/es-ES\//, '/')
            .replace(/^\/es-ES$/, '/')
            .replace(/^\/en-US\//, '/')
            .replace(/^\/en-US$/, '/');
          
          // Remove any duplicate locales that might be in the path
          cleanPath = cleanPath.replace(/\/pt-BR\//g, '/').replace(/\/es-ES\//g, '/').replace(/\/en-US\//g, '/');
          
          // Ensure path starts with /
          if (!cleanPath.startsWith('/')) {
            cleanPath = '/' + cleanPath;
          }
          
          // Build final URL with ONLY the target locale
          const finalPath = cleanPath === '/' ? `/${targetLocale}/` : `/${targetLocale}${cleanPath}`;
          window.location.href = finalPath;
        }
      };
      
      // Add event listener
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          document.addEventListener('click', handleLanguageClick, true);
        });
      } else {
        document.addEventListener('click', handleLanguageClick, true);
      }

      // Install command copy functionality
      function copyInstallCommand(id: string) {
        const input = document.getElementById(id || 'install-command') as HTMLInputElement;
        if (!input) {
          console.warn('Input not found for id:', id);
          return;
        }
        
        const textToCopy = input.value;
        
        // Try modern clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(textToCopy).then(() => {
            updateButtonIcon(input, true);
          }).catch((err) => {
            console.error('Failed to copy:', err);
            // Fallback to execCommand
            fallbackCopy(input, textToCopy);
          });
        } else {
          // Fallback for older browsers
          fallbackCopy(input, textToCopy);
        }
      }

      function updateButtonIcon(input: HTMLInputElement, success: boolean) {
        const button = input.closest('.install-input-wrapper')?.querySelector('.install-copy-button') as HTMLElement;
        if (!button) return;
        
        if (success) {
          // Add 'copied' class to toggle icon visibility via CSS
          button.classList.add('copied');
          
          setTimeout(() => {
            button.classList.remove('copied');
          }, 2000);
        }
      }

      function fallbackCopy(input: HTMLInputElement, text: string) {
        input.select();
        input.setSelectionRange(0, 99999);
        
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            updateButtonIcon(input, true);
          } else {
            console.error('execCommand copy failed');
          }
        } catch (err) {
          console.error('Fallback copy failed:', err);
        }
      }

      // Use event delegation for better reliability
      function setupInstallCopyButtons() {
        // Remove old listeners by removing and re-adding the handler
        document.removeEventListener('click', handleCopyClick as EventListener);
        document.addEventListener('click', handleCopyClick as EventListener, true);
      }

      function handleCopyClick(e: MouseEvent) {
        const target = e.target as HTMLElement;
        const button = target.closest('.install-copy-button') as HTMLElement;
        const overlay = target.closest('.install-copy-overlay') as HTMLElement;
        
        if (button || overlay) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          
          const element = button || overlay;
          const id = element.getAttribute('data-install-id') || 'install-command';
          copyInstallCommand(id);
          return false;
        }
      }

      // Setup immediately and also on DOM ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupInstallCopyButtons);
      } else {
        setupInstallCopyButtons();
      }
      
      // Also setup after a short delay to catch dynamically added content
      setTimeout(setupInstallCopyButtons, 500);

      // Match install component width to hero actions width
      function matchInstallWidth() {
        const heroActions = document.querySelector('.hero-actions') as HTMLElement;
        const heroInstall = document.querySelector('.hero-install') as HTMLElement;
        
        if (heroActions && heroInstall) {
          const actionsWidth = heroActions.offsetWidth;
          heroInstall.style.width = `${actionsWidth}px`;
        }
      }

      function setupInstallWidth() {
        matchInstallWidth();
        
        // Also match on window resize
        window.addEventListener('resize', matchInstallWidth);
        
        // Use ResizeObserver to watch for changes in hero-actions width
        const heroActions = document.querySelector('.hero-actions');
        if (heroActions && window.ResizeObserver) {
          const resizeObserver = new ResizeObserver(() => {
            matchInstallWidth();
          });
          resizeObserver.observe(heroActions);
        }
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          setTimeout(setupInstallWidth, 100);
        });
      } else {
        setTimeout(setupInstallWidth, 100);
      }
    }
  },
};
