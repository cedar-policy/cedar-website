import React from 'react';
import TutorialStep from './TutorialStep';
import { Header } from '@cloudscape-design/components';
import CedarIntl from '../../components/CedarIntl';
import type { CedarEntity } from '../../cedar-utils';

export default function StepPolicyStructure() {
    const principal = { type: 'User', id: 'alice' };
    const action = { type: 'Action', id: 'update' };
    const resource = { type: 'Photo', id: 'VacationPhoto94.jpg' };
    const policy = `permit(
  principal == User::"alice", 
  action    == Action::"update", 
  resource  == Photo::"VacationPhoto94.jpg"
);`;
    const context: Record<string, any> = {};
    const entities: CedarEntity[] = [];
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
                    <Header variant={'h1'}>
                        <CedarIntl
                            id="tutorial.policyStructure.header"
                            defaultMessage="Tutorial"
                        />
                    </Header>
                    <p>
                        <CedarIntl
                            id="tutorial.policyStructure.prePolicy.p1"
                            defaultMessage={
                                " This tutorial provides an introduction to the " +
                'Cedar policy language. On completion of this tutorial you will ' +
                'be ready to start writing Cedar policies, and understand how ' +
                'those policies will be evaluated for an authorization request.'
                            }
                        />
                    </p>

                    <Header variant={'h2'}>
                        <CedarIntl
                            id="tutorial.policyStructure.title"
                            defaultMessage="Policy structure"
                        />
                    </Header>
                    <p>
                        <CedarIntl
                            id="tutorial.policyStructure.prePolicy.p2"
                            defaultMessage={
                                "With Cedar, permissions are expressed as sets " +
                'of policy statements. Each statement is a rule that permits or ' +
                'forbids a user (or principal) to act on a resource, given a ' +
                'defined context. This format is often referred to as the PARC ' +
                'model.'
                            }
                        />
                    </p>
                    <p>
                        <CedarIntl
                            id="tutorial.policyStructure.prePolicy.list.header"
                            defaultMessage={
                                "Every policy statement must include an effect and a scope:"
                            }
                        />
                    </p>
                    <ul>
                        <li>
                            <CedarIntl
                                id="tutorial.policyStructure.prePolicy.list.p1"
                                defaultMessage={
                                    "The effect specifies whether this a {permit} " +
                  'or a {forbid} policy.'
                                }
                                values={{
                                    permit: <code>permit</code>,
                                    forbid: <code>forbid</code>,
                                }}
                            />
                        </li>
                        <li>
                            <CedarIntl
                                id="tutorial.policyStructure.prePolicy.list.p2"
                                defaultMessage={
                                    "The scope specifies the principal[s], the " +
                  'action[s], and the resource[s] to which the effect applies.'
                                }
                            />
                        </li>
                        <li>
                            <CedarIntl
                                id="tutorial.policyStructure.prePolicy.list.p3"
                                defaultMessage={
                                    "Optionally, the statement may also include " +
                  'one or more conditions in the form of {when} or {unless} ' +
                  'clauses.'
                                }
                                values={{
                                    when: <code>when</code>,
                                    unless: <code>unless</code>,
                                }}
                            />
                        </li>
                    </ul>

                    <p>
                        <CedarIntl
                            id="tutorial.policyStructure.prePolicy.p3"
                            defaultMessage={
                                "Through this tutorial we will use a photo " +
                'sharing application as the inspiration for our examples. Below ' +
                'is an example of a very simple Cedar policy. It has an effect ' +
                'and a scope. The effect is {permit}. The scope is a principal ' +
                'of type {user} called Alice, an action of {update}, and a ' +
                'resource of type {photo} called ‘VacationPhoto94.jpg’. In ' +
                'short, the policy permits a User called Alice to update a Photo ' +
                'called VacationPhoto94.jpg.  Note that this policy has no ' +
                'conditions. We will cover these later in the tutorial.'
                            }
                            values={{
                                permit: <code>permit</code>,
                                user: <code>User</code>,
                                update: <code>update</code>,
                                photo: <code>Photo</code>,
                            }}
                        />
                    </p>
                </>
            }
            postPolicySlot={
                <>
                    <p>
                        <CedarIntl
                            id="tutorial.policyStructure.postPolicy.p1"
                            defaultMessage={
                                "Principals and resources are identified by a " +
                'unique combination of a type and an ID, for example, a ' +
                'principal of type ‘User’ called ‘Alice’. Each time a policy ' +
                'references a principal or a resource, it must call out both the ' +
                'type and the ID.'
                            }
                            values={{
                                is: <code>is</code>,
                            }}
                        />
                    </p>
                    <p>
                        <CedarIntl
                            id="tutorial.policyStructure.postPolicy.p2"
                            defaultMessage={
                                "Cedar policies are evaluated by a Cedar " +
                'evaluation engine. The engine considers a set of policy ' +
                'statements in response to an authorization request, and returns ' +
                'either an {allow} or {deny} decision. For the authorization ' +
                'request to be allowed, there must be at least one applicable ' +
                'permit statement and no applicable forbid statements. A policy ' +
                'is applicable if the scope matches that of the authorization ' +
                'request, and any conditions are met.'
                            }
                            values={{
                                allow: <code>allow</code>,
                                deny: <code>deny</code>,
                            }}
                        />
                    </p>
                    <p>
                        <CedarIntl
                            id="tutorial.policyStructure.postPolicy.p3"
                            defaultMessage={
                                "Within this tutorial, we will present Rust " +
                'code that illustrates how to use the Cedar library to evaluate ' +
                'authorization requests. This code is not meant to be production ' +
                'quality. The Cedar library is stateless and currently only ' +
                'supports the Rust language. We will provide FFI interfaces into ' +
                'the Cedar library in the future.'
                            }
                        />
                    </p>
                </>
            }
            postCodeSlot={
                <>
                    <p>
                        <CedarIntl
                            id="tutorial.policyStructure.postCode.p1"
                            defaultMessage={
                                "Now try editing the policy in the first code " +
                'block on this page. Change the principal, action or resource to ' +
                'so that the scopes don\'t match and see the request denied, ' +
                'because the policy no longer applies. Is the evaluation logic ' +
                'case sensitive? Add a second policy underneath the first one, ' +
                'note that you only need one {permit} policy to apply for an ' +
                '{allow} authorization decision.'
                            }
                            values={{
                                allow: <code>allow</code>,
                                permit: <code>permit</code>,
                            }}
                        />
                    </p>
                    <p>
                        <CedarIntl
                            id="tutorial.policyStructure.postCode.p2"
                            defaultMessage={
                                "As an application developer, you can name your " +
                'entity types (principals and resources) whatever makes sense to ' +
                'you. For these examples, we\'ve used the type name {user}, but ' +
                'we could use {person}, {consumer} or any other label. What ' +
                'matters is that you are consistent between the entity type names ' +
                'you use in your policies and in your code.'
                            }
                            values={{
                                user: <code>User</code>,
                                person: <code>Person</code>,
                                consumer: <code>Consumer</code>,
                            }}
                        />
                    </p>
                </>
            }
        />
    );
}
