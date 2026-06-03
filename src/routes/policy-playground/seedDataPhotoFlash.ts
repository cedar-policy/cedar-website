import type { CedarEntity } from '../../cedar-utils';
import type { SampleApp } from './types';

// String of one or more Waterford policies written in the Cedar language
export const policy = `permit (
    principal == PhotoApp::User::"alice",
    action == PhotoApp::Action::"viewPhoto",
    resource == PhotoApp::Photo::"vacationPhoto.jpg"
);

permit (
    principal == PhotoApp::User::"stacey",
    action == PhotoApp::Action::"viewPhoto",
    resource
)
when { resource in PhotoApp::Account::"stacey" };`;

export const context: string = JSON.stringify(
    {
        authenticated: true,
    },
    null,
    2,
);

const query1Entities: CedarEntity[] = [
    {
        uid: {
            type: 'PhotoApp::User',
            id: 'alice',
        },
        attrs: {
            userId: '897345789237492878',
            personInformation: {
                age: 25,
                name: 'alice',
            },
        },
        parents: [
            {
                type: 'PhotoApp::UserGroup',
                id: 'alice_friends',
            },
            {
                type: 'PhotoApp::UserGroup',
                id: 'AVTeam',
            },
        ],
    },
    {
        uid: {
            type: 'PhotoApp::Photo',
            id: 'vacationPhoto.jpg',
        },
        attrs: {
            private: false,
        },
        parents: [
            {
                type: 'PhotoApp::Account',
                id: 'ahmad',
            },
        ],
    },
    {
        uid: {
            type: 'PhotoApp::UserGroup',
            id: 'alice_friends',
        },
        attrs: {},
        parents: [],
    },
    {
        uid: {
            type: 'PhotoApp::UserGroup',
            id: 'AVTeam',
        },
        attrs: {},
        parents: [],
    },
    {
        uid: {
            type: 'PhotoApp::Account',
            id: 'ahmad',
        },
        attrs: {},
        parents: [],
    },
];

const query2Entities: CedarEntity[] = [
    {
        uid: {
            type: 'PhotoApp::User',
            id: 'stacey',
        },
        attrs: {
            userId: '345623462345',
            personInformation: {
                age: 18,
                name: 'stacey',
            },
        },
        parents: [],
    },
    {
        uid: {
            type: 'PhotoApp::Photo',
            id: 'birthdaySelfie.jpg',
        },
        attrs: {
            private: false,
        },
        parents: [
            {
                type: 'PhotoApp::Account',
                id: 'stacey',
            },
        ],
    },
    {
        uid: {
            type: 'PhotoApp::Account',
            id: 'stacey',
        },
        attrs: {},
        parents: [],
    },
];

const photoFlashSchema = `namespace PhotoApp {
  type PersonType = {
    age: Long,
    name: String
  };

  type ContextType = {
    authenticated: Bool,
    ip?: ipaddr
  };

  entity Account;

  entity Album in [Account];

  entity Photo in [Album, Account] = {
    private: Bool
  };

  entity UserGroup;

  entity User in [UserGroup] = {
    userId: String,
    personInformation: PersonType
  };

  action viewPhoto appliesTo {
    principal: [User, UserGroup],
    resource: [Photo],
    context: ContextType
  };

  action createPhoto appliesTo {
    principal: [User, UserGroup],
    resource: [Account],
    context: ContextType
  };

  action listPhotos appliesTo {
    principal: [User, UserGroup],
    resource: [Account],
    context: ContextType
  };
}`;

export const photoFlashSampleApp: SampleApp = {
    name: 'PhotoFlash',
    policy,
    schema: photoFlashSchema,
    queries: [
        {
            queryTitle: 'Simple access example',
            principal: { type: 'PhotoApp::User', id: 'alice' },
            action: { type: 'PhotoApp::Action', id: 'viewPhoto' },
            resource: { type: 'PhotoApp::Photo', id: 'vacationPhoto.jpg' },
            context: context,
            entities: JSON.stringify(query1Entities, null, 4),
        },
        {
            queryTitle: 'Resource group access example',
            principal: { type: 'PhotoApp::User', id: 'stacey' },
            action: { type: 'PhotoApp::Action', id: 'viewPhoto' },
            resource: { type: 'PhotoApp::Photo', id: 'birthdaySelfie.jpg' },
            context: context,
            entities: JSON.stringify(query2Entities, null, 4),
        },
    ],
};
