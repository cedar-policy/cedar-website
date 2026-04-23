import { test, expect } from 'vitest';
import { Locale, defaultLocale } from '../src/translations/configuration';
import { getLocaleFromPath } from '../src/util/intlHelpers';
import { typeAndIdToFormattedString, renderRustCode } from '../src/routes/tutorial/helpers';
import type { EntityJson } from '@cedar-policy/cedar-wasm';

const locales: Locale[] = [defaultLocale, 'es', 'zh-CN'];

const intlHelperTestCases = [
    {
        input: '',
        expectedLocaleOutput: defaultLocale,
    },
    {
        input: '/',
        expectedLocaleOutput: defaultLocale,
    },
    {
        input: `/${defaultLocale}`,
        expectedLocaleOutput: defaultLocale,
    },
    {
        input: `/${defaultLocale}/`,
        expectedLocaleOutput: defaultLocale,
    },
    {
        input: '/tutorial',
        expectedLocaleOutput: defaultLocale,
    },
    {
        input: '/tutorial/',
        expectedLocaleOutput: defaultLocale,
    },
    {
        input: '/tutorial/tutorial-step',
        expectedLocaleOutput: defaultLocale,
    },
    {
        input: '/es/tutorial/tutorial-step',
        expectedLocaleOutput: 'es',
    },
    {
        input: '/zh-CN/tutorial/tutorial-step',
        expectedLocaleOutput: 'zh-CN',
    },
    {
        input: '/es/zh-CN',
        expectedLocaleOutput: 'es',
    },

];

test('ensure getLocaleFromPath behaves as expected', () => {
    intlHelperTestCases.forEach(testCase => {
        const actualResult = getLocaleFromPath(testCase.input, locales);
        expect(actualResult).toEqual(testCase.expectedLocaleOutput);
    });
});

test('renderRustCode test', () => {
    const principal = {type: 'User', id: 'alice'};
    const action = {type: 'Action', id: 'view'};
    const resource = {type: 'Photo', id: 'VacationPhoto94.jpg'};
    const entities: EntityJson[] = [
        {
            uid: {
                type: 'Photo',
                id: 'VacationPhoto94.jpg',
            },
            attrs: {
                accessLevel: 'public',
            },
            parents: [],
        },
        {
            uid: {
                type: 'User',
                id: 'alice',
            },
            attrs: {
                location: 'USA',
            },
            parents: [],
        },
    ];
    const context = {
        mfa_authenticated: true,
        request_client_ip: '222.222.222.222',
        oidc_scope: 'profile',
    };

    const renderedRustCode = renderRustCode(principal, action, resource, context, 'permit(principal, action, resource);', entities);
    entities.forEach(entity => {
        const { type, id } = ('__entity' in entity.uid) ? entity.uid.__entity : entity.uid;
        expect(renderedRustCode.includes(type)).toBe(true);
        expect(renderedRustCode.includes(id)).toBe(true);
    });
    expect(renderedRustCode.includes(JSON.stringify(typeAndIdToFormattedString(principal)))).toBe(true);
    expect(renderedRustCode.includes(JSON.stringify(typeAndIdToFormattedString(action)))).toBe(true);
    expect(renderedRustCode.includes(JSON.stringify(typeAndIdToFormattedString(resource)))).toBe(true);
});
