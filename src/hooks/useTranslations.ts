import { useIntl } from 'react-intl';
import { PrimitiveType, FormatXMLElementFn } from 'intl-messageformat';
import { isIntlDebug } from '../util/intlHelpers';

export type TranslateFunction = (
    id: string,
    values?: Record<string, PrimitiveType | FormatXMLElementFn<string, string>>,
) => string;

export function useTranslations() {
    const intl = useIntl();

    const t: TranslateFunction = (id, values) => {
        const translation = intl.formatMessage({ id: id + '.text' }, values);
        return isIntlDebug() ? translation + ` [${id}]` : translation;
    };

    return {
        t,
    };
}
