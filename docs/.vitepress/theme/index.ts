import DefaultTheme from 'vitepress/theme';
import './custom.css';
import { defineAsyncComponent, defineComponent, h, ref, onMounted, onUnmounted } from 'vue';

// ThemeImage component - detects dark mode and switches images
const ThemeImage = defineComponent({
  props: {
    src: { type: String, required: true },
    alt: { type: String, default: '' }
  },
  setup(props) {
    const imageSrc = ref(props.src);
    let observer: MutationObserver | null = null;

    const updateTheme = () => {
      if (typeof document !== 'undefined') {
        const isDark = document.documentElement.classList.contains('dark');
        const baseSrc = props.src.replace(/-dark\.(png|jpg|jpeg|svg|webp)$/i, '.$1');
        const extensionMatch = baseSrc.match(/\.(png|jpg|jpeg|svg|webp)$/i);
        const extension = extensionMatch ? extensionMatch[0] : '.png';
        const srcWithoutExt = baseSrc.replace(extension, '');
        imageSrc.value = isDark 
          ? `${srcWithoutExt}-dark${extension}`
          : baseSrc;
      }
    };

    onMounted(() => {
      updateTheme();
      if (typeof document !== 'undefined') {
        observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['class']
        });
      }
    });

    onUnmounted(() => {
      if (observer) {
        observer.disconnect();
      }
    });

    return () => h('img', {
      src: imageSrc.value,
      alt: props.alt || '',
      style: { transition: 'opacity 0.2s ease-in-out' }
    });
  }
});

export default {
  ...DefaultTheme,
  enhanceApp({ app, router }) {
    app.component('CodeSandboxEmbed', defineAsyncComponent(() => import('../../components/examples/CodeSandboxEmbed.vue')));
    app.component('ExampleWrapper', defineAsyncComponent(() => import('../../components/examples/ExampleWrapper.vue')));
    app.component('ThemeImage', ThemeImage);
    
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
          } else if (pathname.includes('/en-US')) {
            targetLocale = 'en-US';
          }
          
          // Get current path and remove ALL locale prefixes
          const currentPath = window.location.pathname;
          let cleanPath = currentPath
            .replace(/^\/pt-BR\//, '/')
            .replace(/^\/pt-BR$/, '/')
            .replace(/^\/en-US\//, '/')
            .replace(/^\/en-US$/, '/');
          
          // Remove any duplicate locales that might be in the path
          cleanPath = cleanPath.replace(/\/pt-BR\//g, '/').replace(/\/en-US\//g, '/');
          
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
