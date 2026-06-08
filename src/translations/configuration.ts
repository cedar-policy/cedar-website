export type Locale = 'de' | 'en' | 'en-UK' | 'es' | 'fr' | 'id' | 'it' | 'ja' | 'ko' | 'pt-BR' | 'zh-TW' | 'zh-CN';
export const defaultLocale: Locale = 'en';
export const supportedLocales: Locale[] = ['en'];

// In order to "trick" webpack into exporting all of our JSON files as assets, we
// build a map of import. However we actually only use (and thus download) a single
// translation map during runtime.
const data = supportedLocales.reduce(
    (result, item) => {
        /* eslint-disable @typescript-eslint/no-require-imports,
           @typescript-eslint/no-unsafe-assignment,
           @typescript-eslint/no-unsafe-member-access */
        result[item] = require(`./${item}.json`).default;
        /* eslint-enable @typescript-eslint/no-require-imports,
           @typescript-eslint/no-unsafe-assignment,
           @typescript-eslint/no-unsafe-member-access */
        return result;
    },
    {} as Record<string, string>,
);

export function languagePath(language: string): string {
    return data[language as Locale] || data[defaultLocale];
}
