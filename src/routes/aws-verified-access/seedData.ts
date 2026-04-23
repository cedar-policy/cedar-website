import { TranslateFunction } from '../../hooks/useTranslations';

export interface VerifiedAccessTestCaseDefinition {
    id: string;
    labelKey: string;
    policyBody: string;
    context: string;
}

const basicIdentityPolicyBodyOne =
`permit(principal,action,resource)
when {
    context.identity.groups.contains("finance") &&
    context.identity.email_verified == true
}; 
`;

const basicidentityPolicyBodyTwo =
`permit(principal,action,resource)
when {
     context.identity.groups.contains("finance") 
    && context.identity.email_verified == true
     && context.jamf.risk == "LOW"
};
`;

const crowdstrikePolicyBody =
`permit(principal,action,resource)
when {
    context.crwd.assessment.overall > 50 
};`;

const ipPolicyBody =
`permit(principal, action, resource) 
when {
    context.http_request.method == "GET"
};`;

export const VERIFIED_ACCESS_TEST_CASES: VerifiedAccessTestCaseDefinition[] = [
    {
        id: 'basic_identity',
        labelKey: 'avaPlayground.testCases.basicIdentity',
        policyBody: basicIdentityPolicyBodyOne,
        context: JSON.stringify({
            identity: {
                groups: ['finance', 'employees'],
                email: 'anna@example.com',
                email_verified: true,
            },
        }, null, 2),
    },
    {
        id: 'basic_identity_2',
        labelKey: 'avaPlayground.testCases.basicIdentity2',
        policyBody: basicidentityPolicyBodyTwo,
        context: JSON.stringify({
            identity: {
                groups: ['finance', 'employees'],
                email: 'anna@example.com',
                email_verified: true,
            },
            jamf: {
                iss: 'c6d9f9eb-3d1e-0f04-13ef-47d4ec348223',
                sub: 'exampleexternalidentifier',
                risk: 'NOT_APPLICABLE',
                osv: '12.5.0',
                groups: [],
                iat: 1666193492,
                exp: 1666197092,
                kid: '6bb0f88c-c9e7-1c7a-5f84-4f8c4ec11474',
            },
        }, null, 2),
    },
    {
        id: 'crowd_strike',
        labelKey: 'avaPlayground.testCases.crowdStrike',
        policyBody: crowdstrikePolicyBody,
        context: JSON.stringify({
            crwd: {
                assessment: {
                    overall: 52,
                    os: 42,
                    sensor_config: 2,
                    version: '3.4.0',
                },
                exp: 1656444407,
                iat: 1655234807,
                jwt_url: 'https://example.com/jwt_sign',
                platform: 'macOS',
                serial_number: 'e0a0d3c1b11cc82b2a79379e3a7e47fa',
                sub: '597c71c2e2f9',
                typ: 'crowdstrike-zta+jwt',
            },
        }, null, 2),
    },
    {
        id: 'ip_address',
        labelKey: 'avaPlayground.testCases.ipAddress',
        policyBody: ipPolicyBody,
        context: JSON.stringify({
            http_request: {
                user_agent: 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
                x_forwarded_for: '10.2.1.28, 10.1.5.21',
                method: 'GET',
                hostname: 'www.example.com',
            },
        }, null, 2),
    },
];

export function getInitialTestCase(params: URLSearchParams): VerifiedAccessTestCaseDefinition {
    return VERIFIED_ACCESS_TEST_CASES.find(testCase => testCase.id === params.get('use-case')) || VERIFIED_ACCESS_TEST_CASES[0];
}

export function testCaseToSelectOption(testCase: VerifiedAccessTestCaseDefinition, t: TranslateFunction): {label: string, value: string} {
    return { label: t(testCase.labelKey), value: testCase.id };
}
