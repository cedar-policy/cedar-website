import type { CedarEntity } from '../../cedar-utils';
import type { SampleApp } from './types';

export const policy = `// Account owner can do anything with their own photos and albums
permit (
    principal,
    action,
    resource
)
when { resource in principal.account };

// Account owner can share their albums with other users
permit (
    principal,
    action == PhotoApp::Action::"shareAlbum",
    resource
)
when { resource in principal.account };

// Anyone can view non-private photos
permit (
    principal,
    action == PhotoApp::Action::"viewPhoto",
    resource
)
when { !resource.private };

// Forbid unauthenticated access regardless of other policies
forbid (
    principal,
    action,
    resource
)
when { !context.authenticated };

// Example: policy created after alice shared "vacationAlbum" with stacey
permit (
    principal == PhotoApp::User::"stacey",
    action in [PhotoApp::Action::"viewPhoto", PhotoApp::Action::"createPhoto", PhotoApp::Action::"deletePhoto", PhotoApp::Action::"listPhotosInAlbum"],
    resource in PhotoApp::Album::"alice/vacationAlbum"
);`;

export const context: string = JSON.stringify(
    {
        authenticated: true,
    },
    null,
    2,
);

const query1Entities: CedarEntity[] = [
    {
        uid: { type: 'PhotoApp::User', id: 'alice' },
        attrs: {
            userId: '897345789237492878',
            personInformation: { age: 25, name: 'alice' },
            account: { __entity: { type: 'PhotoApp::Account', id: 'alice' } },
        },
        parents: [{ type: 'PhotoApp::UserGroup', id: 'AVTeam' }],
    },
    {
        uid: { type: 'PhotoApp::Account', id: 'alice' },
        attrs: {},
        parents: [],
    },
    {
        uid: { type: 'PhotoApp::Album', id: 'alice/vacationAlbum' },
        attrs: {},
        parents: [{ type: 'PhotoApp::Account', id: 'alice' }],
    },
    {
        uid: { type: 'PhotoApp::Photo', id: 'vacationPhoto.jpg' },
        attrs: { private: true },
        parents: [{ type: 'PhotoApp::Album', id: 'alice/vacationAlbum' }],
    },
    {
        uid: { type: 'PhotoApp::UserGroup', id: 'AVTeam' },
        attrs: {},
        parents: [],
    },
];

const query2Entities: CedarEntity[] = [
    {
        uid: { type: 'PhotoApp::User', id: 'stacey' },
        attrs: {
            userId: '345623462345',
            personInformation: { age: 18, name: 'stacey' },
            account: { __entity: { type: 'PhotoApp::Account', id: 'stacey' } },
        },
        parents: [],
    },
    {
        uid: { type: 'PhotoApp::Account', id: 'stacey' },
        attrs: {},
        parents: [],
    },
    {
        uid: { type: 'PhotoApp::Album', id: 'alice/vacationAlbum' },
        attrs: {},
        parents: [{ type: 'PhotoApp::Account', id: 'alice' }],
    },
    {
        uid: { type: 'PhotoApp::Account', id: 'alice' },
        attrs: {},
        parents: [],
    },
    {
        uid: { type: 'PhotoApp::Photo', id: 'beach.jpg' },
        attrs: { private: true },
        parents: [{ type: 'PhotoApp::Album', id: 'alice/vacationAlbum' }],
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
    personInformation: PersonType,
    account: Account
  };

  action viewPhoto appliesTo {
    principal: [User],
    resource: [Photo],
    context: ContextType
  };

  action createPhoto appliesTo {
    principal: [User],
    resource: [Album, Account],
    context: ContextType
  };

  action deletePhoto appliesTo {
    principal: [User],
    resource: [Photo],
    context: ContextType
  };

  action listPhotos appliesTo {
    principal: [User],
    resource: [Account],
    context: ContextType
  };

  action listPhotosInAlbum appliesTo {
    principal: [User],
    resource: [Album],
    context: ContextType
  };

  action shareAlbum appliesTo {
    principal: [User],
    resource: [Album],
    context: ContextType
  };
}`;

export const photoFlashSampleApp: SampleApp = {
    name: 'PhotoFlash',
    policy,
    schema: photoFlashSchema,
    queries: [
        {
            queryTitle: 'Owner views their own photo',
            principal: { type: 'PhotoApp::User', id: 'alice' },
            action: { type: 'PhotoApp::Action', id: 'viewPhoto' },
            resource: { type: 'PhotoApp::Photo', id: 'vacationPhoto.jpg' },
            context: context,
            entities: JSON.stringify(query1Entities, null, 4),
        },
        {
            queryTitle: 'Shared user views private photo in shared album',
            principal: { type: 'PhotoApp::User', id: 'stacey' },
            action: { type: 'PhotoApp::Action', id: 'viewPhoto' },
            resource: { type: 'PhotoApp::Photo', id: 'beach.jpg' },
            context: context,
            entities: JSON.stringify(query2Entities, null, 4),
        },
    ],
};
