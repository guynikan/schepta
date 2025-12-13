/**
 * i18n utilities for VitePress documentation
 */

export type Locale = 'en-US' | 'pt-BR' | 'es-ES';

const SUPPORTED_LOCALES: Locale[] = ['en-US', 'pt-BR', 'es-ES'];
const DEFAULT_LOCALE: Locale = 'en-US';

const LOCALE_STORAGE_KEY = 'schepta-docs-locale';

/**
 * Maps browser language to supported locale
 */
function mapBrowserLocale(browserLang: string): Locale {
  const lang = browserLang.toLowerCase();
  
  if (lang.startsWith('pt')) {
    return 'pt-BR';
  }
  
  if (lang.startsWith('es')) {
    return 'es-ES';
  }
  
  if (lang.startsWith('en')) {
    return 'en-US';
  }
  
  return DEFAULT_LOCALE;
}

/**
 * Detects browser locale
 */
export function detectBrowserLocale(): Locale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }
  
  // Check localStorage first (user preference)
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored && SUPPORTED_LOCALES.includes(stored as Locale)) {
    return stored as Locale;
  }
  
  // Detect from browser
  const browserLang = navigator.language || (navigator as any).userLanguage;
  return mapBrowserLocale(browserLang);
}

/**
 * Gets locale from current path
 */
export function getLocaleFromPath(path: string): Locale {
  if (path.startsWith('/pt-BR')) {
    return 'pt-BR';
  }
  if (path.startsWith('/es-ES')) {
    return 'es-ES';
  }
  if (path.startsWith('/en-US')) {
    return 'en-US';
  }
  return DEFAULT_LOCALE;
}

/**
 * Saves locale preference to localStorage
 */
export function saveLocalePreference(locale: Locale): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }
}

/**
 * Gets the locale path prefix
 */
export function getLocalePath(locale: Locale): string {
  if (locale === DEFAULT_LOCALE) {
    return '/en-US';
  }
  return `/${locale}`;
}

/**
 * Switches path to different locale
 */
export function switchLocalePath(currentPath: string, targetLocale: Locale): string {
  const currentLocale = getLocaleFromPath(currentPath);
  
  // Remove current locale prefix
  let pathWithoutLocale = currentPath;
  if (currentPath.startsWith(`/${currentLocale}`)) {
    pathWithoutLocale = currentPath.slice(`/${currentLocale}`.length) || '/';
  }
  
  // Add target locale prefix
  if (targetLocale === DEFAULT_LOCALE) {
    return `/en-US${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
  }
  return `/${targetLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
}

