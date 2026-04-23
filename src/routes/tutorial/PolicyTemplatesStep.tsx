import React from 'react';
import { Box, Header } from '@cloudscape-design/components';
import CedarIntl from '../../components/CedarIntl';
import ReadOnlyCode from '../../components/ReadOnlyCode';
import LearningPathListItem from '../../components/LearningPathListItem';

const samplePolicy1 = `permit (
    principal == User::"973db890-092c-49e4-a9d0-912a4c0a20c7", // "Alice"
    action in [Action::"readFile", Action::"writeFile"],
    resource in Folder::"4e153865-0b24-4b77-94f7-9a7f24fa8a59"   // "Vacation Photos"
);`;
const samplePolicy2 = `permit (
    principal == User::"aa72347c-0f07-4015-b23c-551bab7371bb", // "Bob"
    action in [Action::"readFile", Action::"writeFile"],
    resource in Folder::"d5cf9de7-8f10-452b-9aef-a3b735da47ef"   // "Birthday Photos"
);`;

const policyTemplate = `permit(
    principal == ?principal, 
    action in [Action::"readFile", Action::"writeFile"] 
    resource  == ?resource
  );`;

const instantiatedPolicy = `permit(
    principal == User::"alice", 
    action in [Action::"readFile", Action::"writeFile"] 
    resource  == Photo::"pic.jpg"
  );`;

export default function PolicyTemplatesStep() {
    return (
        <Box padding={{ bottom: 'm' }}>
            <Header variant={'h2'}>
                <CedarIntl
                    id='tutorial.templates.title'
                    defaultMessage='Policy Templates'
                />
            </Header>
            <p>
                <CedarIntl
                    id='tutorial.templates.paragraph1'
                    defaultMessage={'When you write a complete policy that ' +
                    'specifies both the principal and the resource, it’s ' +
                    'referred to as a static policy. A static policy is ' +
                    'immediately ready for use in authorization decisions.'}
                />
            </p>
            <p>
                <CedarIntl
                    id='tutorial.templates.paragraph2'
                    defaultMessage={'However, sometimes you’ll want to use one ' +
                    'set of authorization rules and apply them to many different ' +
                    'principals and resources. For example, in a photo sharing ' +
                    'application, there might be a common action to share a photo ' +
                    'with someone. Performing this action creates a policy for the ' +
                    'specified principal and the specified resource. Everything else ' +
                    'about the policy is identical in all instance, such as these ' +
                    'two samples having the exact same list of actions.'}
                />
            </p>
            <ReadOnlyCode language='cedar' code={samplePolicy1} />
            <ReadOnlyCode language='cedar' code={samplePolicy2} />
            <p>
                <CedarIntl
                    id='tutorial.templates.paragraph3'
                    defaultMessage={'Using static policies in this way can result in ' +
                    'a lot of redundant policies that differ only in the principal and ' +
                    'resource elements. It also introduces a big issue If you ever ' +
                    'need to make a change in the underlying business logic of what ' +
                    'sharing a photo means. In that case you’d have to update every ' +
                    'one of the individual policies.'}
                />
            </p>
            <p>
                <CedarIntl
                    id='tutorial.templates.paragraph4.body'
                    defaultMessage={'Policy templates solve this issue by letting ' +
                    'you create policies from a template that uses {placeholders} ' +
                    'for the principal or resource, or both. After creating a policy ' +
                    'template, you can instantiate individual policies by referencing ' +
                    'the template and providing values for the specific principal ' +
                    'and resource to use. This template-linked policy then works just ' +
                    'like an static policy.'}
                    values={{
                        placeholders: <i><CedarIntl
                            id='tutorial.templates.paragraph4.italic'
                            defaultMessage='placeholders'
                        /></i>,
                    }}
                />
            </p>
            <p>
                <CedarIntl
                    id='tutorial.templates.paragraph5'
                    defaultMessage={'The placeholders in a template are simply the ' +
                    '{principal} and {resource} keywords with a leading ' +
                    '{questionMark} character. The following example shows a policy ' +
                    'template that implements the same permissions as shown in the ' +
                    'previous policy examples. We just don’t yet know what the ' +
                    'principals and resources will be.'}
                    values={{
                        principal: <code>principal</code>,
                        resource: <code>resource</code>,
                        questionMark: <code>?</code>,
                    }}
                />
            </p>
            <ReadOnlyCode language='cedar' code={policyTemplate} />
            <p>
                <CedarIntl
                    id='tutorial.templates.paragraph6.body'
                    defaultMessage={'Placeholders can appear {only} in the header ' +
                    'of a policy, and only on the right-hand side of the {equals} ' +
                    'or {in} operators. You can’t use a placeholder for {actions}, ' +
                    'and you can’t use a placeholder in a {when} or {unless} clause.'}
                    values={{
                        only: <i><CedarIntl
                            id='tutorial.templates.paragraph6.italic'
                            defaultMessage='only'
                        /></i>,
                        equals: <code>==</code>,
                        in: <code>in</code>,
                        actions: <code>actions</code>,
                        when: <code>when</code>,
                        unless: <code>unless</code>,
                    }}
                />
            </p>
            <p>
                <CedarIntl
                    id='tutorial.templates.paragraph7'
                    defaultMessage={'When you need to create a policy based on ' +
                    'that policy template, instead of providing static policy ' +
                    'text, you reference the policy template and provide the ' +
                    'specific values for each of the placeholders. Cedar then ' +
                    'generates a new policy linked to the template with the ' +
                    'specified entities.'}
                />
            </p>
            <p>
                <CedarIntl
                    id='tutorial.templates.paragraph8'
                    defaultMessage={'When Cedar instantiates the template, it ' +
                    'creates a template-based policy that fills in the placeholders ' +
                    'with the values provided by the request to instantiate the ' +
                    'policy. For example, an instantiated policy based on the ' +
                    'previous template, that specifies {alice} as the principal ' +
                    'and {pic} as the resource would behave just as if it had ' +
                    'been written as the following static policy.'}
                    values={{
                        alice: <code>alice</code>,
                        pic: <code>pic.jpg</code>,
                    }}
                />
            </p>
            <ReadOnlyCode language='cedar' code={instantiatedPolicy} />
            <h3>
                <CedarIntl
                    id='tutorial.moreResources'
                    defaultMessage='More resources:'
                />
            </h3>
            <ul>
                <LearningPathListItem
                    title={<CedarIntl
                        id='tutorial.templates.cedarLanguageGuide'
                        defaultMessage='Templates (Cedar Language Guide)'
                    />}
                    href='https://docs.cedarpolicy.com/policies/templates.html'
                    duration={{ minutes: 5 }}
                />
            </ul>
        </Box>
    );
}
