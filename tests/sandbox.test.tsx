import React from 'react';
import { describe, it, expect } from 'vitest';
import createWrapper from '@cloudscape-design/components/test-utils/dom';
import { render, screen, fireEvent } from '@testing-library/react';
import PolicyPlayground from '../src/routes/policy-playground/PolicyPlayground';
import { IntlProvider } from 'react-intl';
import nestedMessages from '../src/translations/en.json';
import { flattenMessages } from '../src/util/flattenMessages';
import { getCedarVersion } from '@cedar-policy/cedar-wasm';

const messages = flattenMessages(nestedMessages);

function mountPlayground() {
    return render(
        <IntlProvider
            locale='en'
            messages={messages}
        >
            <PolicyPlayground />
        </IntlProvider>,
    );
}

describe('playground tests', () => {
    it('should render the sandbox route', async() => {
        mountPlayground();
        const element = screen.getByTestId('policy-playground');
        expect(element).toBeTruthy();
        await screen.findByTestId('policy-playground');
    });

    it('should evaluate to Allow for Simple Access', async() => {
        mountPlayground();
        fireEvent.click(screen.getByTestId('evaluate-button'));
        await screen.findByTestId('is-success');
    });

    it('should evaluate to Deny for Simple Access with the wrong user', async() => {
        mountPlayground();
        const principalField = createWrapper(document.querySelector('[data-testid="principal-id"]') || undefined);
        const inputField = principalField.findInput();
        inputField!.setInputValue('hacker');
        fireEvent.click(screen.getByTestId('evaluate-button'));
        await screen.findByTestId('is-failure');
    });

    it('should evaluate to Allow for Resource Group Access', async() => {
        mountPlayground();
        const accessSelectorWrapper = createWrapper(document.querySelector('[data-testid="access-selector"]') || undefined);
        const accessSelector = accessSelectorWrapper.findSelect();
        accessSelector!.openDropdown();
        accessSelector!.selectOption(2); // 1-indexed, second option is "Resource group access"
        screen.getByDisplayValue(/stacey/);
        fireEvent.click(screen.getByTestId('evaluate-button'));
        await screen.findByTestId('is-success');
    });

    it('should evaluate to Deny for Resource Group Access with the wrong user', async() => {
        mountPlayground();
        const accessSelectorWrapper = createWrapper(document.querySelector('[data-testid="access-selector"]') || undefined);
        const accessSelector = accessSelectorWrapper.findSelect();
        accessSelector!.openDropdown();
        accessSelector!.selectOption(2);
        screen.getByDisplayValue(/stacey/);

        const principalField = createWrapper(document.querySelector('[data-testid="principal-id"]') || undefined);
        const inputField = principalField.findInput();
        inputField!.setInputValue('hacker');
        fireEvent.click(screen.getByTestId('evaluate-button'));
        await screen.findByTestId('is-failure');
    });

    // Note: the Monaco editor components are mocked in setupTests.ts since Monaco doesn't work in jsdom.
    // So, this is basically validating an empty schema & policy -- which is technically valid
    it('should validate to Success for Schema and policies', async() => {
        mountPlayground();
        fireEvent.click(screen.getByText(/Schema and policies/));
        fireEvent.click(screen.getByTestId('validate-button'));
        await screen.findByTestId('is-success');
    });

    it('should getCedarVersion properly', () => {
        const cedarVersion = getCedarVersion();
        expect(cedarVersion).toBeDefined();
        expect(cedarVersion).toEqual(expect.any(String));
    });
});
