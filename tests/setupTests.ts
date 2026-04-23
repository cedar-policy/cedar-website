/* eslint import/first: 0 */
/* eslint @typescript-eslint/ban-ts-comment: 0 */
/* eslint @typescript-eslint/no-unused-vars: 0 */
import { beforeAll, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

import { TextEncoder, TextDecoder } from 'util';
import { TranslateFunction } from '../src/hooks/useTranslations';

// This removes "Warning: The current testing environment is not configured to support act(...)"
// vitest doesn't require the wrapped act() madness, but '@testing-library/react' doesn't realize that
// @see: https://github.com/testing-library/react-testing-library/issues/1061
global.IS_REACT_ACT_ENVIRONMENT = true;

beforeAll(() => {
    // Removes noisey `isAuthorized` logs from output
    const originalConsoleLog = console.log;
    vi.spyOn(console, 'log').mockImplementation((...args: any) => {
        const logMessage = args.join(' ');
        if (!logMessage.includes('isAuthorized')) {
            originalConsoleLog(...args);
        }
    });

    // Removes noisey `Worker is not defined` error
    // In an actual browser, the Monaco-based Cedar editors spawn WebWorkers for LSP/validation.
    // `jsdom` doesn't have a `WebWorker` context — and the editors themselves are mocked below —
    // so these errors are irrelevant in the context of these tests and can be safely hidden.
    const originalConsoleError = console.error;
    vi.spyOn(console, 'error').mockImplementation((...args: any) => {
        const errorRegex = /(TypeError: Failed to parse URL)/i;

        const logMessage = args.join(' ');
        if (!errorRegex.test(logMessage)) {
            originalConsoleError(...args);
        }
    });
});

// mock react router stuff
export const mockNavigate = vi.fn((path: string) => '');
let getMockParams = () => ({ '*': '' });
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
vi.mock('react-router-dom', () => ({
    ...vi.importActual('react-router-dom'),
    BrowserRouter: () => '',
    Route: () => '',
    useNavigate: () => mockNavigate,
    Link: () => '',
    useParams: () => getMockParams(),
}));
export const setMockParams = (fn: () => {'*': string}) => {
    getMockParams = fn;
};

// Monaco does not run inside jsdom — stub the new editor package with null-returning
// React components so any JSX that renders the editors in tests is a no-op.
vi.mock('@cedar-policy/cedar-monaco-editor', () => ({
    CedarPolicyEditor: (props: { value?: string }) => null,
    CedarSchemaEditor: (props: { value?: string }) => null,
    CedarJsonEditor: (props: { value?: string }) => null,
    configureCedarEditors: () => {},
    registerCedarLanguages: () => {},
    VERSION: '0.0.0-test',
}));

export const tForTests:TranslateFunction = (id) => id;

afterEach(() => {
    mockNavigate.mockReset().mockImplementation((path: string) => '');
    cleanup();
});
