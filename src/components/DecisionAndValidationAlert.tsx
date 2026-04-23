import React from 'react';
import { Alert, AlertProps, Box } from '@cloudscape-design/components';
import { DecisionAndValidationOutputForUI } from '../util/outputMappers';

export default function DecisionAndValidationAlert(props: { output: DecisionAndValidationOutputForUI}) {
    const { output } = props;

    const { status, message, errors, warnings } = output;

    const hasErrors = status === 'error' || errors.length > 0;

    const errorMessages = errors.length > 0 && <Box margin={{ top: 's' }}><strong>Errors:</strong><ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul></Box>;

    const hasWarnings = status === 'warning' || warnings.length > 0;
    const warningMessages = warnings.length > 0 && <Box margin={{ top: 's' }}><strong>Warnings:</strong><ul>{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul></Box>;

    let alertType: AlertProps.Type = 'error';
    let dataTestId = 'is-failure';

    if (status === 'success') {
        alertType = hasWarnings ? 'warning' : 'success';
        dataTestId = 'is-success';
    }

    // `<Alert>` leaves extra vertical space if `errorMessages` & `warningMessages` are empty
    // So, an extra check if everything is required
    if (hasErrors || hasWarnings) {
        return (
            <Alert type={alertType} header={message} data-testid={dataTestId}>
                {errorMessages}
                {warningMessages}
            </Alert>
        );
    }

    return (
        <Alert type={alertType} header={message} data-testid={dataTestId} />
    );
}
