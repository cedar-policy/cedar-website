import React from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { setMockParams, mockNavigate } from './setupTests';
import Tutorial from '../src/routes/tutorial';
import StepPolicyStructure from '../src/routes/tutorial/StepPolicyStructure';
import StepRBAC from '../src/routes/tutorial/StepRBAC';
import StepContext from '../src/routes/tutorial/StepContext';
import StepABAC from '../src/routes/tutorial/StepABAC';
import StepABAC2 from '../src/routes/tutorial/StepABAC2';
import StepForbid from '../src/routes/tutorial/StepForbid';
import StepSets from '../src/routes/tutorial/StepSets';
import StepUndefinedScopes from '../src/routes/tutorial/StepUndefinedScopes';
import { IntlProvider } from 'react-intl';
import nestedMessages from '../src/translations/en.json';
import { flattenMessages } from '../src/util/flattenMessages';

const messages = flattenMessages(nestedMessages);

function IntlWrap({ children }:React.PropsWithChildren) {
    return <IntlProvider
        locale='en'
        messages={messages}
    >
        {children}
    </IntlProvider>;
}

// Key from the translations that isn't likely to change
// Tests will pass with any key but invalid keys make noisy warnings
const workingNavKey = 'pageTitles.tutorial';

describe('Tutorial tests', () => {
    test('Shows first step and next step button navigates', () => {
        render(
            <Tutorial
                steps={[
                    {
                        element: <div>First text</div>,
                        navLabelKey: workingNavKey,
                        route: 'first',
                    },
                    {
                        element: <div>Last text</div>,
                        navLabelKey: workingNavKey,
                        route: 'last',
                    },
                ]}
            />,
            { wrapper: IntlWrap },
        );
        expect(screen.queryByText('Last text')).toBeNull();
        screen.getByText('First text');

        expect(screen.queryByTestId('previous-tutorial-step')).toBeNull();
        fireEvent.click(screen.getByTestId('next-tutorial-step'));
        expect(mockNavigate.mock.calls[0][0].includes('/last')).toBe(true);
    });

    test('Tutorial routes to step and previous step button navigates', () => {
        setMockParams(() => ({ '*': 'last' }));

        render(
            <Tutorial
                steps={[
                    {
                        element: <div>First text</div>,
                        navLabelKey: workingNavKey,
                        route: 'first',
                    },
                    {
                        element: <div>Last text</div>,
                        navLabelKey: workingNavKey,
                        route: 'last',
                    },
                ]}
            />,
            { wrapper: IntlWrap },
        );
        expect(screen.queryByText('First text')).toBeNull();
        screen.getByText('Last text');

        expect(screen.queryByText('Next step')).toBeNull();
        fireEvent.click(screen.getByTestId('previous-tutorial-step'));
        expect(mockNavigate.mock.calls[0][0].includes('/first')).toBe(true);
    });

    test('Policy structure step evaluates to allow', async() => {
        render(
            <StepPolicyStructure/>,
            { wrapper: IntlWrap },
        );
        fireEvent.click(screen.getByTestId('evaluate-button'));

        await screen.findByTestId('is-success');
    });

    test('Forbid step evaluates to deny', async() => {
        render(
            <StepForbid/>,
            { wrapper: IntlWrap },
        );
        fireEvent.click(screen.getByTestId('evaluate-button'));
        await screen.findByTestId('is-failure');
    });

    test('Sets step evaluates to allow', async() => {
        render(
            <StepSets/>,
            { wrapper: IntlWrap },
        );
        fireEvent.click(screen.getByTestId('evaluate-button'));
        await screen.findByTestId('is-success');
    });

    test('Undefined scopes step evaluates to allow', async() => {
        render(
            <StepUndefinedScopes/>,
            { wrapper: IntlWrap },
        );
        fireEvent.click(screen.getByTestId('evaluate-button'));
        await screen.findByTestId('is-success');
    });

    test('RBAC step evaluates to allow', async() => {
        render(
            <StepRBAC/>,
            { wrapper: IntlWrap },
        );
        fireEvent.click(screen.getByTestId('evaluate-button'));
        await screen.findByTestId('is-success');
    });

    test('ABAC pt. 1 step evaluates to allow', async() => {
        render(
            <StepABAC/>,
            { wrapper: IntlWrap },
        );
        fireEvent.click(screen.getByTestId('evaluate-button'));
        await screen.findByTestId('is-success');
    });

    test('ABAC pt. 2 step evaluates to allow', async() => {
        render(
            <StepABAC2/>,
            { wrapper: IntlWrap },
        );
        fireEvent.click(screen.getByTestId('evaluate-button'));
        await screen.findByTestId('is-success');
    });

    test('Context step evaluates to allow', async() => {
        render(
            <StepContext/>,
            { wrapper: IntlWrap },
        );
        fireEvent.click(screen.getByTestId('evaluate-button'));
        await screen.findByTestId('is-success');
    });
});
