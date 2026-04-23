import React from 'react';
import TutorialStep from './TutorialStep';
import { Header } from '@cloudscape-design/components';
import CedarIntl from '../../components/CedarIntl';
import type { CedarEntity } from '../../cedar-utils';

export default function StepABAC1() {
    const principal = { type: 'User', id: 'alice' };
    const action = { type: 'Action', id: 'view' };
    const resource = { type: 'Photo', id: 'VacationPhoto94.jpg' };
    const entities: CedarEntity[] = [
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
    const policy = `permit(
  principal,
  action == Action::"view",
  resource
)
when {resource.accessLevel == "public" && principal.location == "USA"};

`;
    const context: Record<string, any> = {};
    return (
        <TutorialStep
            waterfordEditorHeight={160}
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
                            id="tutorial.abacPt1.header"
                            defaultMessage="Attribute-based access control (part 1)"
                        />
                    </Header>
                    <p>
                        <CedarIntl
                            id="tutorial.abacPt1.prePolicy.p1"
                            defaultMessage={
                                "The policy below permits any principal to " +
                'view any resource, but only on the condition that the ' +
                'accessLevel for the resource is designated as public. It ' +
                'permits any principal to view any photo, but only on the ' +
                'condition that the resource is tagged as public and the ' +
                'location of the principal is equal to "USA".'
                            }
                        />
                    </p>
                </>
            }
            postPolicySlot={
                <>
                    <p>
                        <CedarIntl
                            id="tutorial.abacPt1.postPolicy.p1"
                            defaultMessage={
                                "Similar to what we saw with groups, the " +
                'evaluation engine needs to be told the value of the resource ' +
                'attribute called {accessLevel}, in order to be able to ' +
                'evaluate requests by considering this policy. This information ' +
                'needs to be passed by your application, as part of the ' +
                'authorization request using the {entities} request attribute.'
                            }
                            values={{
                                accessLevel: <code>accessLevel</code>,
                                entities: <code>entities</code>,
                            }}
                        />
                    </p>
                </>
            }
            postCodeSlot={
                <>
                    <p>
                        <CedarIntl
                            id="tutorial.abacPt1.postCode.list1.header"
                            defaultMessage={
                                "Experiment by modifying the policy to try " +
                'out these  other operators:'
                            }
                        />
                    </p>
                    <ul>
                        <li>
                            <code>||</code>&nbsp;&nbsp;&nbsp;
                            <CedarIntl
                                id="tutorial.abacPt1.postCode.list1.p1"
                                defaultMessage="logical or"
                            />
                        </li>
                        <li>
                            <code>!=</code>&nbsp;&nbsp;&nbsp;
                            <CedarIntl
                                id="tutorial.abacPt1.postCode.list1.p2"
                                defaultMessage="not equal to"
                            />
                        </li>
                    </ul>
                    <p>
                        <CedarIntl
                            id="tutorial.abacPt1.postCode.list2.header"
                            defaultMessage={
                                "The example above uses an attribute of type " +
                '{String}. Cedar can also support the following types:'
                            }
                            values={{
                                String: <code>String</code>,
                            }}
                        />
                    </p>
                    <ul>
                        <li>
                            <CedarIntl
                                id="tutorial.abacPt1.postCode.list2.p1"
                                defaultMessage={'Boolean'}
                            />
                        </li>
                        <li>
                            <CedarIntl
                                id="tutorial.abacPt1.postCode.list2.p2"
                                defaultMessage={'Integer'}
                            />
                        </li>
                        <li>
                            <CedarIntl
                                id="tutorial.abacPt1.postCode.list2.p3"
                                defaultMessage={'Entity ID: eg. {exampleId}'}
                                values={{
                                    exampleId: <code>User::&quot;Alice&quot;</code>,
                                }}
                            />
                        </li>
                        <li>
                            <CedarIntl
                                id="tutorial.abacPt1.postCode.list2.p4"
                                defaultMessage={
                                    "Sets: collections of values, expressed with []"
                                }
                            />
                        </li>
                    </ul>
                </>
            }
        />
    );
}
