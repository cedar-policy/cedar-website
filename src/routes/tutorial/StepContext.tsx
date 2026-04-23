import React from 'react';
import TutorialStep from './TutorialStep';
import { Header } from '@cloudscape-design/components';
import CedarIntl from '../../components/CedarIntl';
import type { CedarEntity } from '../../cedar-utils';
import { typeAndIdToFormattedString } from './helpers';

export default function StepContext() {
    const principal = { type: 'User', id: 'alice' };
    const action = { type: 'Action', id: 'update' };
    const resource = { type: 'Photo', id: 'flower.jpg' };
    const context = {
        mfa_authenticated: true,
        request_client_ip: '222.222.222.222',
        oidc_scope: 'profile',
    };
    const entities: CedarEntity[] = [];
    const policy = `permit(
    principal in ${typeAndIdToFormattedString(principal)}, 
    action in [Action::"update", Action::"delete"],
    resource == ${typeAndIdToFormattedString(resource)})
when {
    context.mfa_authenticated == true &&
    context.request_client_ip == "222.222.222.222"
};`;
    return (
        <TutorialStep
            waterfordEditorHeight={200}
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
                            id="tutorial.context.label"
                            defaultMessage="Conditions and context"
                        />
                    </Header>
                    <p>
                        <CedarIntl
                            id="tutorial.context.prePolicy.p1"
                            defaultMessage={
                                "In the examples so far we’ve examined " +
                'policies based on attributes of the principal and/or the ' +
                'resource. But what if you wanted to write a policy that takes ' +
                'takes into account variables that are unrelated to either the ' +
                'principal or the resource? Cedar provides a way for you to do ' +
                'this, using the Context record. Context enables you to pass ' +
                'additional data into the authorization request, which can be ' +
                'referenced in policy conditions.'
                            }
                        />
                    </p>
                    <p>
                        <CedarIntl
                            id="tutorial.context.prePolicy.p2"
                            defaultMessage={
                                "Examples of context data you might use are " +
                'OpenID claims in a JWT or anything else that is only known at ' +
                'the time of the incoming request and not necessarily stored ' +
                'in your database.'
                            }
                        />
                    </p>
                    <p>
                        <CedarIntl
                            id="tutorial.context.prePolicy.p3"
                            defaultMessage={
                                "The policy below permits a User called Alice " +
                'to update and delete a photo called VacationPhoto94.jpg, but ' +
                'only on the condition that she has authenticated using ' +
                'multi-factor authentication and is accessing the application ' +
                'from a specific IP address.'
                            }
                        />
                    </p>
                </>
            }
            postPolicySlot={
                <p>
                    <CedarIntl
                        id="tutorial.context.postPolicy.p1"
                        defaultMessage={
                            "To enable the Cedar evaluation engine to make " +
              'the authorization decision, we need to supply context values as ' +
              'part of the request. These context values might come from http ' +
              'headers, a signed and verified JWT payload, path parameters, ' +
              'query strings, etc. When using context values, it’s important to ' +
              'remember to structure your policies in such a way that end users ' +
              'cannot spoof the context values. For instance, a good way to ' +
              'ensure a user identity can’t be spoofed is obtaining the user ID ' +
              'from a signed JWT payload.'
                        }
                    />
                </p>
            }
            postCodeSlot={
                <>
                    <p>
                        <CedarIntl
                            id="tutorial.context.postCode.p1"
                            defaultMessage={
                                "Experiment with context by changing the " +
                'policy so that it uses the {oidc_scope} property instead.'
                            }
                            values={{
                                oidc_scope: <code>oidc_scope</code>,
                            }}
                        />
                    </p>
                    <p>
                        <CedarIntl
                            id="tutorial.context.postCode.p2"
                            defaultMessage={
                                "The {context} and {entities} parameters of " +
                'the request are different. The {entities} parameter enables ' +
                'the calling application to provide data about the resource ' +
                'and principal, such as attribute values and group membership. ' +
                'Context provides a mechanism for you to write policies that ' +
                'consider other data beyond that of the principal and resource.'
                            }
                            values={{
                                context: <code>context</code>,
                                entities: <code>entities</code>,
                            }}
                        />
                    </p>
                </>
            }
        />
    );
}
