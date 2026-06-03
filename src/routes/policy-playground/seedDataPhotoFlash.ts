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
            account: {
                __entity: {
                    type: 'PhotoApp::Account',
                    id: 'ahmad',
                },
            },
        },
        parents: [],
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
            account: {
                __entity: {
                    type: 'PhotoApp::Account',
                    id: 'stacey',
                },
            },
        },
        parents: [
            {
                type: 'PhotoApp::Account',
                id: 'stacey',
            },
        ],
    },
];

const photoFlashSchema = `namespace PhotoApp {
  type ContextType = {
    authenticated: Bool,
    ip?: ipaddr
  };

  type PersonType = {
    age: Long,
    name: String
  };

  entity Account;

  entity Album;

  entity Photo in [Album, Account] = {
    account: Account,
    private: Bool
  };

  entity User in [UserGroup] = {
    personInformation: PersonType,
    userId: String
  };

  entity UserGroup;

  action "createPhoto" appliesTo {
    principal: [User, UserGroup],
    resource: [Photo],
    context: ContextType
  };

  action "listPhotos" appliesTo {
    principal: [User, UserGroup],
    resource: [Photo],
    context: ContextType
  };

  action "viewPhoto" appliesTo {
    principal: [User, UserGroup],
    resource: [Photo],
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
