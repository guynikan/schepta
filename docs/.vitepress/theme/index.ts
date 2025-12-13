import DefaultTheme from 'vitepress/theme';
import './custom.css';
import { defineAsyncComponent } from 'vue';


export default {
  ...DefaultTheme,
  enhanceApp({ app, router }) {
    app.component('CodeSandboxEmbed', defineAsyncComponent(() => import('../../components/examples/CodeSandboxEmbed.vue')));
    
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
    }
  },
};
