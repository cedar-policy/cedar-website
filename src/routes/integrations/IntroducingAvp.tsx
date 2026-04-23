import React from 'react';
import { Box, Link, SpaceBetween } from '@cloudscape-design/components';
import CedarIntl from '../../components/CedarIntl';
import { useNavigate } from 'react-router-dom';
import { getLocaleFromPath } from '../../util/intlHelpers';

export default function IntroducingAvp() {
    const navigate = useNavigate();
    const locale = getLocaleFromPath(window.location.pathname);

    return <Box margin={{ left: 'xxxl', vertical: 'm' }}>
        <div className='medium-container'>
            <SpaceBetween size='m'>
                <div>
                    <h1>
                        <CedarIntl
                            id='introducingAvp.header'
                            defaultMessage='Introducing Amazon Verified Permissions'
                        />
                    </h1>
                    <p>
                        <CedarIntl
                            id='introducingAvp.description.serviceInfo'
                            defaultMessage={'Amazon Verified Permissions is a fully managed service for storing and evaluating Cedar policies. Developers can build applications that use Verified Permissions to authorize each user action.'}
                        />
                    </p>
                    <i>
                        <p>
                            <CedarIntl
                                id='introducingAvp.description.openSource'
                                defaultMessage={'Note: The Cedar SDK is open source, which means you don\'t need to use Amazon Verified Permissions. Think of Amazon Verified Permissions as a tool to help you work with the Cedar SDK effectively.'}
                            />
                        </p>
                    </i>

                </div>
                <div>
                    <h2>
                        <CedarIntl
                            id='introducingAvp.whyUseAvp.title'
                            defaultMessage='Why would I use Amazon Verified Permissions?'
                        />
                    </h2>
                    <ul>
                        <li>
                            <CedarIntl
                                id='introducingAvp.whyUseAvp.secureStorage'
                                defaultMessage={'A secure place to store and manage Cedar schemas and policies.'}
                            />
                        </li>
                        <li>
                            <CedarIntl
                                id='introducingAvp.whyUseAvp.console'
                                defaultMessage={'Console wizards that help you build your Cedar schema and connect to different Identity Providers.'}
                            />
                        </li>
                        <li>
                            <CedarIntl
                                id='introducingAvp.whyUseAvp.protectedApis'
                                defaultMessage={'Protected APIs, so that only authorized parties can access and change policies.'}
                            />
                        </li>
                        <li>
                            <CedarIntl
                                id='introducingAvp.whyUseAvp.resilientService'
                                defaultMessage={'A resilient authorization service that scales to thousands of requests per second across multiple regions.'}
                            />
                        </li>
                        <li>
                            <CedarIntl
                                id='introducingAvp.whyUseAvp.authzInCloudtrail'
                                defaultMessage={'All authorization requests are logged in AWS CloudTrail, providing a complete record of who accessed what.'}
                            />
                        </li>
                        <li>
                            <CedarIntl
                                id='introducingAvp.whyUseAvp.managementInCloudtrail'
                                defaultMessage={'All management operations are logged in AWS CloudTrail, so you know who granted access and when.'}
                            />
                        </li>
                    </ul>
                </div>
                <div>
                    <h2>
                        <CedarIntl
                            id='introducingAvp.howToGetStarted.title'
                            defaultMessage='How do I get started?'
                        />
                    </h2>
                    <p>
                        <CedarIntl
                            id='introducingAvp.howToGetStarted.setupAccount.body'
                            defaultMessage={'Amazon Verified Permissions is an AWS service, which means you need an AWS account to use it. If you don\'t have an account, you can sign up {here}, and try out Verified Permissions.'}
                            values={{
                                here: <Link
                                    href="https://signin.aws.amazon.com/signup?request_type=register"
                                    external
                                    target="_blank"
                                >
                                    <CedarIntl
                                        id='introducingAvp.howToGetStarted.setupAccount.here'
                                        defaultMessage='here'
                                    />
                                </Link>,
                            }}
                        />
                    </p>
                    <p>
                        <CedarIntl
                            id='introducingAvp.howToGetStarted.startAvp.body'
                            defaultMessage={'Once you have an account set up, {followSteps}.'}
                            values={{
                                followSteps: <Link
                                    href={`/${locale}/integrations/getting-started-avp`}
                                    onFollow={(e) => {
                                        e.preventDefault();
                                        navigate(`/${locale}/integrations/getting-started-avp`);
                                    }}
                                >
                                    <CedarIntl
                                        id='introducingAvp.howToGetStarted.startAvp.followSteps'
                                        defaultMessage='follow these steps to create your first policy store'
                                    />
                                </Link>,
                            }}
                        />
                    </p>
                </div>
            </SpaceBetween>
        </div>
    </Box>;
}
