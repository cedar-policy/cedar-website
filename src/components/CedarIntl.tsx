import React from 'react';
import { FormattedMessage } from 'react-intl';
import { isIntlDebug } from '../util/intlHelpers';

/*
    Since the structure of the locale files (as required for Totoro onboarding)
    has .text and .note for each string, where .note is context for
    translators, only .text should ever be displayed in the UI.
*/
interface CedarIntlProps {
    id: string,
    defaultMessage?: string,
    values?: Record<string, React.ReactNode>
}

export default function CedarIntl({ id, defaultMessage, values }:CedarIntlProps) {
    if (isIntlDebug()) {
        return (
            <span>
                <FormattedMessage
                    id={id + '.text'}
                    defaultMessage={`*${defaultMessage}`}
                    values={values}
                />
                {` [${id}]`}
            </span>
        );
    }
    return (
        <FormattedMessage
            id={id + '.text'}
            defaultMessage={defaultMessage}
            values={values}
        />
    );
}
