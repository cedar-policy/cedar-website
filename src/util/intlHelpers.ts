import { supportedLocales, defaultLocale, Locale } from '../translations/configuration';

export function getLocaleFromPath(path: string, locales = supportedLocales) : Locale {
    // Cut away the first segment of the path, which should be locale if specified
    // eg. '/fr/tutorial' -> 'fr', '/' -> defaultlocale -> 'en'
    const pathSegments = path.split('/');
    if (pathSegments.length < 2) {
        return defaultLocale;
    }
    const locale = locales.find((validLocale) => pathSegments[1] === validLocale);
    return locale || defaultLocale;
}

export function isIntlDebug() {
    const host: string = window?.location?.host || '';
    const isLocal = host.includes('127.0.0.1') || host.includes('localhost');
    return isLocal && window.location.search.toLowerCase().includes('i18n');
}

