import React from 'react';
import { Box, ExpandableSection, Link, SpaceBetween } from '@cloudscape-design/components';
import CedarIntl from '../../components/CedarIntl';
import { useTranslations } from '../../hooks/useTranslations';

export default function GettingStartedAvp() {
    const { t } = useTranslations();
    return <Box margin={{ left: 'xxxl', vertical: 'm' }}>
        <div className='medium-container'>
            <SpaceBetween size='m'>
                <div>
                    <h1>
                        <CedarIntl
                            id='gettingStartedAvp.header'
                            defaultMessage='Getting started with Amazon Verified Permissions'
                        />
                    </h1>
                </div>
                <div>
                    <h2>
                        <CedarIntl
                            id='gettingStartedAvp.createPolicyStore.title'
                            defaultMessage='Create your first policy store'
                        />
                    </h2>
                    <p>
                        <CedarIntl
                            id='gettingStartedAvp.createPolicyStore.signIn.body'
                            defaultMessage={'Sign in to the AWS console and navigate to the {avpPage}.'}
                            values={{
                                avpPage: <Link
                                    href="https://aws.amazon.com/verified-permissions/"
                                    external
                                    target="_blank"
                                >
                                    <CedarIntl
                                        id='gettingStartedAvp.createPolicyStore.signIn.avpPage'
                                        defaultMessage='Amazon Verified Permissions page'
                                    />
                                </Link>,
                            }}
                        />
                    </p>
                    <p>
                        <CedarIntl
                            id='gettingStartedAvp.createPolicyStore.startWizard'
                            defaultMessage={'Click \'Get started with Verified Permissions\', and then click \'Create policy store\'.'}
                        />
                    </p>
                    <p>
                        <CedarIntl
                            id='gettingStartedAvp.createPolicyStore.makeSamplePStore'
                            defaultMessage={'Select \'Start from a sample policy store\', choose \'\'{PhotoFlash}\'\', and click \'Create policy store\'. Once creation finishes, click \'Go to overview\' at the top of the screen.'}
                            values={{
                                PhotoFlash: 'PhotoFlash',
                            }}
                        />
                    </p>
                    <p>
                        <CedarIntl
                            id='gettingStartedAvp.createPolicyStore.navToCreatePolicy'
                            defaultMessage={'Select \'Policies\' from the sidebar menu on the left. Click on \'Create policy\', and choose \'Create static policy\'.'}
                        />
                    </p>
                    <p>
                        <CedarIntl
                            id='gettingStartedAvp.createPolicyStore.policyScope'
                            defaultMessage={'Define the policy scope as:'}
                        />
                    </p>
                    <ul>
                        <li>
                            <CedarIntl
                                id='gettingStartedAvp.createPolicyStore.principal'
                                defaultMessage={'Specific principal, type = \'\'{type}\'\', identifier = \'\'{id}\'\'.'}
                                values={{
                                    type: 'PhotoFlash::User',
                                    id: 'Alice',
                                }}
                            />
                        </li>
                        <li>
                            <CedarIntl
                                id='gettingStartedAvp.createPolicyStore.resource'
                                defaultMessage={'Specific resource, type = \'\'{type}\'\', identifier = \'\'{id}\'\'.'}
                                values={{
                                    type: 'PhotoFlash::Photo',
                                    id: 'vacationPhoto.jpg',
                                }}
                            />
                        </li>
                        <li>
                            <CedarIntl
                                id='gettingStartedAvp.createPolicyStore.action'
                                defaultMessage={'Specific set of actions, check \'\'{action}\'\'.'}
                                values={{
                                    action: 'ViewPhoto',
                                }}
                            />
                        </li>
                    </ul>
                    <ExpandableSection headerText={<CedarIntl
                        id='gettingStartedAvp.sampleScreenshot'
                        defaultMessage='Sample screenshot'
                    />}>
                        <img src={'/img/avp-policy-example.png'} alt={t('gettingStartedAvp.sampleScreenshot')} width={'100%'}/>
                    </ExpandableSection>
                    <p>
                        <CedarIntl
                            id='gettingStartedAvp.createPolicyStore.finishPolicyCreation'
                            defaultMessage={'Click \'Next\' at the bottom of the page. Add a policy description (optional) and click \'Create Policy\'.'}
                        />
                    </p>
                </div>
                <div>
                    <h2>
                        <CedarIntl
                            id='gettingStartedAvp.testPolicyStore.title'
                            defaultMessage='Test your policy store'
                        />
                    </h2>
                    <p>
                        <CedarIntl
                            id='gettingStartedAvp.testPolicyStore.navToTestBench'
                            defaultMessage={'Select \'Test bench\' from the sidebar menu on the left.'}
                        />
                    </p>
                    <p>
                        <CedarIntl
                            id='gettingStartedAvp.testPolicyStore.authzRequest'
                            defaultMessage={'Define the authorization request as:'}
                        />
                    </p>
                    <ul>
                        <li>
                            <CedarIntl
                                id='gettingStartedAvp.testPolicyStore.principal'
                                defaultMessage={'Principal: type = \'\'{type}\'\', identifier = \'\'{id}\'\', Account: {account}'}
                                values={{
                                    type: 'PhotoFlash::User',
                                    id: 'Alice',
                                    account: 'PhotoFlash::Account::"12345678"',
                                }}
                            />
                        </li>
                        <li>
                            <CedarIntl
                                id='gettingStartedAvp.testPolicyStore.resource'
                                defaultMessage={'Resource: type = \'\'{type}\'\', identifier = \'\'{id}\'\'.'}
                                values={{
                                    type: 'PhotoFlash::Photo',
                                    id: 'vacationPhoto.jpg',
                                }}
                            />
                        </li>
                        <li>
                            <CedarIntl
                                id='gettingStartedAvp.testPolicyStore.action'
                                defaultMessage={'Action: \'\'{action}\'\'.'}
                                values={{
                                    action: 'PhotoFlash::Action::"ViewPhoto"',
                                }}
                            />
                        </li>
                    </ul>
                    <ExpandableSection headerText={<CedarIntl
                        id='gettingStartedAvp.sampleScreenshot'
                        defaultMessage='Sample screenshot'
                    />}>
                        <img src={'/img/avp-test-example.png'} alt={t('gettingStartedAvp.sampleScreenshot')} width={'100%'}/>
                    </ExpandableSection>
                    <p>
                        <CedarIntl
                            id='gettingStartedAvp.testPolicyStore.runAuthorization'
                            defaultMessage={'At the top of the page, click \'Run authorization request\'.'}
                        />
                    </p>
                    <p>
                        <CedarIntl
                            id='gettingStartedAvp.testPolicyStore.expectedResult'
                            defaultMessage={'Based on the policy you created, Verified Permissions should evaluate this request and return a decision of \'Allow\' in a message bar at the top of the page.'}
                        />
                    </p>
                </div>
            </SpaceBetween>
        </div>
    </Box>;
}
