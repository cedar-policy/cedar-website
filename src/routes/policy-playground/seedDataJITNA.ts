import type { CedarEntity } from '../../cedar-utils';
import type { SchemaJson } from '@cedar-policy/cedar-wasm';
import type { SampleApp } from './types';

interface CedarEntityWithTags extends CedarEntity {
  tags?: Record<string, string>;
}

const schema: SchemaJson<string> = {
    "AWS::IdentityStore": {
        entityTypes: {
            Group: {},
            User: {
                memberOfTypes: ['Group'],
                shape: {
                    type: 'Record',
                    attributes: {
                        costCenter: {
                            type: 'EntityOrCommon',
                            name: 'String',
                            required: false,
                        },
                        division: {
                            type: 'EntityOrCommon',
                            name: 'String',
                            required: false,
                        },
                        employeeNumber: {
                            type: 'EntityOrCommon',
                            name: 'String',
                            required: false,
                        },
                        organization: {
                            type: 'EntityOrCommon',
                            name: 'String',
                            required: false,
                        },
                    },
                },
            },
        },
        actions: {},
    },
    "AWS::SSM": {
        entityTypes: {
            ManagedInstance: {
                tags: {
                    type: 'EntityOrCommon',
                    name: 'String',
                },
            },
        },
        actions: {
            getTokenForInstanceAccess: {
                appliesTo: {
                    resourceTypes: ['AWS::EC2::Instance', 'AWS::SSM::ManagedInstance'],
                    principalTypes: ['AWS::IdentityStore::User'],
                    context: {
                        type: 'Record',
                        attributes: {
                            iam: {
                                type: 'EntityOrCommon',
                                name: 'AWS::IAM::AuthorizationContext',
                            },
                        },
                    },
                },
            },
        },
    },
    "AWS::EC2": {
        entityTypes: {
            Instance: {
                tags: {
                    type: 'EntityOrCommon',
                    name: 'String',
                },
            },
        },
        actions: {},
    },
    'AWS::IAM': {
        commonTypes: {
            AuthorizationContext: {
                type: 'Record',
                attributes: {
                    principalTags: {
                        type: 'EntityOrCommon',
                        name: 'PrincipalTags',
                    },
                },
            },
        },
        entityTypes: {
            PrincipalTags: {
                tags: {
                    type: 'EntityOrCommon',
                    name: 'String',
                },
            },
            Role: {
                tags: {
                    type: 'EntityOrCommon',
                    name: 'String',
                },
            },
        },
        actions: {},
    },
};

const policy = `permit (principal in AWS::IdentityStore::Group::"90677fa0fb-5513f9a2-9916-4fc2-aec5-0358ce119215", action == AWS::SSM::Action::"getTokenForInstanceAccess", resource)
when {
    resource.hasTag("Prod") && resource.getTag("Prod") == "Database"
};

permit(principal, action == AWS::SSM::Action::"getTokenForInstanceAccess", resource)
when { 
    context.iam.principalTags.hasTag("Role") && context.iam.principalTags.getTag("Role") == "Admin" 
};

permit(principal, action == AWS::SSM::Action::"getTokenForInstanceAccess", resource)
when {
    resource.hasTag("Environment") &&
    resource.getTag("Environment") == "Development"
};`;

const query1Entities: CedarEntityWithTags[] = [
    {
        uid: {
            type: 'AWS::IdentityStore::User',
            id: 'user123',
        },
        attrs: {
            costCenter: '123456',
            division: 'Engineering',
            employeeNumber: 'E123',
            organization: 'Technology',
        },
        parents: [
            {
                type: 'AWS::IdentityStore::Group',
                id: '90677fa0fb-5513f9a2-9916-4fc2-aec5-0358ce119215',
            },
        ],
    },
    {
        uid: {
            type: 'AWS::EC2::Instance',
            id: 'i-1234567890abcdef0',
        },
        attrs: {},
        parents: [],
        tags: {
            Prod: 'Database',
        },
    },
    {
        uid: {
            type: 'AWS::IAM::PrincipalTags',
            id: 'default',
        },
        attrs: {},
        parents: [],
        tags: {
            Role: 'Admin',
        },
    },
];

const query3Entities: CedarEntityWithTags[] = [
    {
        uid: {
            type: 'AWS::IdentityStore::User',
            id: 'user123',
        },
        attrs: {
            costCenter: '123456',
            division: 'Engineering',
            employeeNumber: 'E123',
            organization: 'Technology',
        },
        parents: [
            {
                type: 'AWS::IdentityStore::Group',
                id: '90677fa0fb-5513f9a2-9916-4fc2-aec5-0358ce119215',
            },
        ],
    },
    {
        uid: {
            type: 'AWS::EC2::Instance',
            id: 'i-1234567890abcdef0',
        },
        attrs: {},
        parents: [],
        tags: {
            Environment: 'Development',
        },
    },
    {
        uid: {
            type: 'AWS::IAM::PrincipalTags',
            id: 'default',
        },
        attrs: {},
        parents: [],
        tags: {
            Role: 'Admin',
        },
    },
];

export const jitnaApp: SampleApp = {
    name: 'JITNA',
    policy,
    schema: JSON.stringify(schema, null, 4),
    queries: [
        {
            queryTitle: 'Access for prod admin group member',
            principal: { type: 'AWS::IdentityStore::User', id: 'user123' },
            action: { type: 'AWS::SSM::Action', id: 'getTokenForInstanceAccess' },
            resource: { type: 'AWS::EC2::Instance', id: 'i-1234567890abcdef0' },
            context: JSON.stringify(
                {
                    iam: {
                        principalTags: {
                            __entity: {
                                type: 'AWS::IAM::PrincipalTags',
                                id: 'default',
                            },
                        },
                    },
                },
                null,
                2,
            ),
            entities: JSON.stringify(query1Entities, null, 4),
        },
        {
            queryTitle: 'Allow access on the IAM role by principal tag ',
            principal: { type: 'AWS::IdentityStore::User', id: 'user123' },
            action: { type: 'AWS::SSM::Action', id: 'getTokenForInstanceAccess' },
            resource: { type: 'AWS::EC2::Instance', id: 'i-1234567890abcdef0' },
            context: JSON.stringify(
                {
                    iam: {
                        principalTags: {
                            __entity: {
                                type: 'AWS::IAM::PrincipalTags',
                                id: 'default',
                            },
                        },
                    },
                },
                null,
                2,
            ),
            entities: JSON.stringify(query1Entities, null, 4),
        },
        {
            queryTitle: 'Allow access if the EC2 instance by tag',
            principal: { type: 'AWS::IdentityStore::User', id: 'user123' },
            action: { type: 'AWS::SSM::Action', id: 'getTokenForInstanceAccess' },
            resource: { type: 'AWS::EC2::Instance', id: 'i-1234567890abcdef0' },
            context: JSON.stringify(
                {
                    iam: {
                        principalTags: {
                            __entity: {
                                type: 'AWS::IAM::PrincipalTags',
                                id: 'default',
                            },
                        },
                    },
                },
                null,
                2,
            ),
            entities: JSON.stringify(query3Entities, null, 4),
        },
    ],
};
