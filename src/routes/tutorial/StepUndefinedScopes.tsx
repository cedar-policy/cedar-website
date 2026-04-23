import React from 'react';
import TutorialStep from './TutorialStep';
import { Header } from '@cloudscape-design/components';
import CedarIntl from '../../components/CedarIntl';
import type { CedarEntity } from '../../cedar-utils';

export default function StepUndefinedScopes() {
    const principal = { type: 'User', id: 'alice' };
    const action = { type: 'Action', id: 'view' };
    const resource = { type: 'Photo', id: 'vacationPhoto.jpg' };
    const policy = `permit(
  principal, 
  action in [Action::"view", Action::"edit", Action::"delete"], 
  resource == Photo::"vacationPhoto.jpg"
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
                    <Header variant={'h2'}>
                        <CedarIntl
                            id="tutorial.undefinedScopes.label"
                            defaultMessage="Undefined scopes"
                        />
                    </Header>
                    <p>
                        <CedarIntl
                            id="tutorial.undefinedScopes.prePolicy.p1"
                            defaultMessage={
                                "Sets provide one way to broaden the scope " +
                'of a policy to include more than one action, but they don’t ' +
                'help much for principals and resources, at least within the ' +
                'scope of the policy. There are two ways ways to write a ' +
                'policy with a broader scope for these entities. The first is ' +
                'to leave the scope completely undefined, by not specifying a ' +
                'principal, resource or action. If a scope is undefined it is ' +
                'considered to apply to all entities.'
                            }
                        />
                    </p>
                </>
            }
            postPolicySlot={
                <p>
                    <CedarIntl
                        id="tutorial.undefinedScopes.postPolicy.p1"
                        defaultMessage={
                            "The policy above leaves the principal undefined " +
              'and is therefore evaluated as applying to all principals, ' +
              'including Alice. Hence the below request will return an {allow} ' +
              'decision.'
                        }
                        values={{
                            allow: <code>allow</code>,
                        }}
                    />
                </p>
            }
            postCodeSlot={
                <>
                    <p>
                        <CedarIntl
                            id="tutorial.undefinedScopes.postCode.p1"
                            defaultMessage={
                                "Try editing the policy to leave the resource " +
                'undefined. What happens if you leave the action undefined?'
                            }
                        />
                    </p>
                    <p>
                        <CedarIntl
                            id="tutorial.undefinedScopes.postCode.p2"
                            defaultMessage={
                                "If we would have left the resource undefined, " +
                'then the policy would allow all principals to perform those ' +
                'three actions on all resources. Make sure to exercise caution ' +
                'when leaving elements of the scope undefined, as this may ' +
                'result in over permissive policies.'
                            }
                        />
                    </p>
                    <p>
                        <CedarIntl
                            id="tutorial.undefinedScopes.postCode.p3"
                            defaultMessage={
                                "Remember that forbid policies can also have " +
                'undefined scopes. Try adding a second policy that forbids ' +
                'alice to view any resources.'
                            }
                        />
                    </p>
                </>
            }
        />
    );
}
