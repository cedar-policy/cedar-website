import React from 'react';
import TutorialStep from './TutorialStep';
import { Header } from '@cloudscape-design/components';
import CedarIntl from '../../components/CedarIntl';
import type { CedarEntity } from '../../cedar-utils';

export default function StepRBAC() {
    const principal = { type: 'User', id: 'Bob' };
    const action = { type: 'Action', id: 'view' };
    const resource = { type: 'Photo', id: 'vacationPhoto94.jpg' };
    const entities: CedarEntity[] = [
        {
            uid: {
                type: 'User',
                id: 'Bob',
            },
            attrs: {},
            parents: [
                {
                    type: 'Role',
                    id: 'vacationPhotoJudges',
                },
                {
                    type: 'Role',
                    id: 'juniorPhotographerJudges',
                },
            ],
        },
        {
            uid: {
                type: 'Role',
                id: 'vacationPhotoJudges',
            },
            attrs: {},
            parents: [],
        },
        {
            uid: {
                type: 'Role',
                id: 'juniorPhotographerJudges',
            },
            attrs: {},
            parents: [],
        },
    ];
    const policy = `permit(
  principal in Role::"vacationPhotoJudges",
  action == Action::"view",
  resource == Photo::"vacationPhoto94.jpg"
);
`;
    const context: Record<string, any> = {};

    return (
        <TutorialStep
            waterfordEditorHeight={120}
            initialPolicyBody={policy}
            principal={principal}
            action={action}
            resource={resource}
            context={context}
            entities={entities}
            prePolicySlot={
                <>
                    <Header variant={'h2'}>
                        <CedarIntl
                            id="tutorial.rbac.label"
                            defaultMessage={'Groups for role-based access control'}
                        />
                    </Header>
                    <p>
                        <CedarIntl
                            id="tutorial.rbac.prePolicy.p1"
                            defaultMessage={
                                'The other way to broaden the scope of a ' +
                'policy is to define it for a group of entities, rather than ' +
                'an individual entity. Principal groups provide us with a way ' +
                'to manage permissions using roles. Let’s imagine users are ' +
                'submitting their photos to a competition for the year’s best ' +
                'vacation photos, and we want a role for the competition ' +
                'judges to be able to view those photos. The policy below ' +
                'permits any principal in the role called {role} to view the ' +
                'photo called {resource}.'
                            }
                            values={{
                                role: <code>&quot;vacationPhotoJudges&quot;</code>,
                                resource: <code>&quot;vacationPhoto94.jpg&quot;</code>,
                            }}
                        />
                    </p>
                </>
            }
            postPolicySlot={
                <>
                    <p>
                        <CedarIntl
                            id="tutorial.rbac.postPolicy.p1"
                            defaultMessage={
                                "In this example we are modeling the role as " +
                'a group. The group is itself an entity and so has a type and ' +
                'an ID. {Role} is not a reserved word, we could equally have ' +
                'called the entity type {UserGroup}. In order to be able to ' +
                'evaluate requests by considering this policy, the evaluation ' +
                'engine needs to know whether the principal referenced within ' +
                'the authorization request is a  member of this group. ' +
                'Therefore, your application will need to pass relevant group ' +
                'membership information to the evaluation engine as part of the ' +
                'authorization request. This is done through the {entities} ' +
                'property, which enables you to provide the Cedar evaluation ' +
                'engine with attribute and group membership data for the ' +
                'principal and resource involved in the authorization call. ' +
                'If you look at the code below you will see that group ' +
                'membership is indicated by defining {bob} as having a parent ' +
                'called {bobRole}.'
                            }
                            values={{
                                Role: <code>Role</code>,
                                UserGroup: <code>UserGroup</code>,
                                entities: <code>entities</code>,
                                bob: <code>User::&quot;bob&quot;</code>,
                                bobRole: <code>Role::&quot;vacationPhotoJudges&quot;</code>,
                            }}
                        />
                    </p>
                </>
            }
            postCodeSlot={
                <>
                    <p>
                        <CedarIntl
                            id="tutorial.rbac.postCode.p1"
                            defaultMessage={
                                "Groups of principals don’t necessarily have " +
                'to equate to Roles. For example, your application could ' +
                'include a concept of friend groups, whereby permissions on ' +
                'photos are managed based on membership of friend groups. ' +
                'There could be a user group called Jane’s friends, and a ' +
                'policy could be created that gives everyone in that group ' +
                'view access to vacationphoto94.jpg. This policy would be ' +
                'identical in structure to the one in this example.'
                            }
                        />
                    </p>
                    <p>
                        <CedarIntl
                            id="tutorial.rbac.postCode.p2"
                            defaultMessage={
                                "Note that Bob is actually a member of two " +
                'groups - {judges} and {juniorJudges}. Try adding a second ' +
                'policy that permits Bob to view vacationPhoto94.jpg ' +
                'through his membership in this second group.'
                            }
                            values={{
                                judges: <code>Role::&quot;vacationPhotoJudges&quot;</code>,
                                juniorJudges: (
                                    <code>Role::&quot; juniorPhotographerJudges&quot;</code>
                                ),
                            }}
                        />
                    </p>
                    <p>
                        <CedarIntl
                            id="tutorial.rbac.postCode.p3"
                            defaultMessage={
                                "Policies can also be defined on resource " +
                'groups. For example, your application might group photos ' +
                'into Albums, and create a policy that applies to all photos ' +
                'in the Album. We provide an example of this at the end of ' +
                'this tutorial.'
                            }
                        />
                    </p>
                </>
            }
        />
    );
}
