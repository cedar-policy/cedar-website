import React from 'react';
import { Box, Button, Container, SpaceBetween } from '@cloudscape-design/components';
import CedarIntl from '../../components/CedarIntl';
import { useNavigate } from 'react-router-dom';
import { getLocaleFromPath } from '../../util/intlHelpers';

export default function Integrations() {
    const navigate = useNavigate();
    const locale = getLocaleFromPath(window.location.pathname);
    return <Box margin={{ left: 'xxxl', vertical: 'm' }}>
        <div className='medium-container'>
            <SpaceBetween size='m'>
                <div>
                    <h1>
                        <CedarIntl
                            id='integrations.title'
                            defaultMessage='_Integrations'
                        />
                    </h1>
                    <p>
                        <CedarIntl
                            id='integrations.description'
                            defaultMessage={'_How are people using Cedar in production ' +
                            'today? Check out the products and services below to find out.'}
                        />
                    </p>
                </div>
                <Container
                    header={
                        <h2>
                            <CedarIntl
                                id='integrations.verifiedPermissions.header'
                                defaultMessage='Amazon Verified Permissions'
                            />
                        </h2>
                    }
                >
                    <SpaceBetween size='m'>
                        <Box>
                            <CedarIntl
                                id='integrations.verifiedPermissions.body2'
                                defaultMessage={'Amazon Verified Permissions is a fully managed service for storing and evaluating Cedar policies. Developers can build applications that use Verified Permissions to authorize each user action.'}
                            />
                        </Box>
                        <Button
                            href={`/${locale}/integrations/introducing-avp`}
                            onFollow={(e) => {
                                e.preventDefault();
                                navigate(`/${locale}/integrations/introducing-avp`);
                            }}
                        >
                            <CedarIntl
                                id='integrations.learnMore'
                                defaultMessage='Learn more'
                            />
                        </Button>
                    </SpaceBetween>
                </Container>
                <Container
                    header={
                        <h2>
                            <CedarIntl
                                id='integrations.verifiedAccess.header'
                                defaultMessage='_AWS Verified Access'
                            />
                        </h2>
                    }
                >
                    <SpaceBetween size='m'>
                        <Box>
                            <CedarIntl
                                id='integrations.verifiedAccess.body'
                                defaultMessage={'_AWS Verified Access validates each ' +
                                'and every application request before granting access. ' +
                                'Verified Access removes the need for a VPN, which ' +
                                'simplifies the remote connectivity experience for end ' +
                                'users and reduces the management complexity for IT ' +
                                'administrators.'}
                            />
                        </Box>
                        <Button
                            href="https://aws.amazon.com/verified-access/"
                            iconAlign="right"
                            iconName="external"
                            target="_blank"
                        >
                            <CedarIntl
                                id='integrations.learnMore'
                                defaultMessage='_Learn more'
                            />
                        </Button>
                    </SpaceBetween>
                </Container>
                <Container
                    header={
                        <h2>
                            <CedarIntl
                                id='integrations.janssen.header'
                                defaultMessage='Janssen Project Cedarling'
                            />
                        </h2>
                    }
                >
                    <SpaceBetween size='m'>
                        <Box>
                            <CedarIntl
                                id='integrations.janssen.body'
                                defaultMessage='The Cedarling is an embeddable Policy Decision Point (PDP) that handles logging, JWT validation, and claim mapping. Whether running via the sidecar, WASM or SDK, the Cedarling enables developers to harness the power of the Rust Cedar engine to implement low-latency access control.'
                            />
                        </Box>
                        <Button
                            href="https://gluu.co/from-cedarpolicy"
                            iconAlign="right"
                            iconName="external"
                            target="_blank"
                        >
                            <CedarIntl
                                id='integrations.learnMore'
                                defaultMessage='Learn more'
                            />
                        </Button>
                    </SpaceBetween>
                </Container>
                <Container
                    header={
                        <h2>
                            <CedarIntl
                                id='integrations.PermitIO.header'
                                defaultMessage='_Permit.io'
                            />
                        </h2>
                    }
                >
                    <SpaceBetween size='m'>
                        <Box>
                            <CedarIntl
                                id='integrations.PermitIO.body'
                                defaultMessage={'_Permit.io provides access ' +
                                'to Cedar as, a SaaS service, as well ' +
                                'as via OPAL its open-source project. A ' +
                                'key enabler for this is Cedar-agent, ' +
                                'an open-source project which provides ' +
                                'the ability to run Cedar as a ' +
                                'standalone agent.'}
                            />
                        </Box>
                        <Button
                            href="https://www.permit.io/blog/oss-aws-cedar-is-a-gamechanger-for-iam"
                            iconAlign="right"
                            iconName="external"
                            target="_blank"
                        >
                            <CedarIntl
                                id='integrations.learnMore'
                                defaultMessage='_Learn more'
                            />
                        </Button>
                    </SpaceBetween>
                </Container>
                <Container
                    header={
                        <h2>
                            <CedarIntl
                                id='integrations.kubernetes.header'
                                defaultMessage='Kubernetes'
                            />
                        </h2>
                    }
                >
                    <SpaceBetween size='m'>
                        <Box>
                            <CedarIntl
                                id='integrations.kubernetes.body'
                                defaultMessage={'Using Cedar access controls for Kubernetes, cluster administrators can dynamically create authorization policies that support features like request or user attribute based rules, label-based access controls, conditions, and denial policies.'}
                            />
                        </Box>
                        <Button
                            href="https://www.cedarpolicy.com/blog/cedar-for-kubernetes"
                            iconAlign="right"
                            iconName="external"
                            target="_blank"
                        >
                            <CedarIntl
                                id='integrations.learnMore'
                                defaultMessage='Learn more'
                            />
                        </Button>
                    </SpaceBetween>
                </Container>
                <Container
                    header={
                        <h2>
                            <CedarIntl
                                id='integrations.strongDM.header'
                                defaultMessage='StrongDM'
                            />
                        </h2>
                    }
                >
                    <SpaceBetween size='m'>
                        <Box>
                            <CedarIntl
                                id='integrations.strongDM.body'
                                defaultMessage={'StrongDM is a universal zero trust access platform, providing seamless connectivity, control, and compliance for cloud-native, hybrid, and multi-cloud infrastructure and applications. StrongDM uses Cedar to authorize fine-grained actions across critical infrastructure protocols, including HTTP requests, Kubernetes, interactive shells, and database queries.'}
                            />
                        </Box>
                        <Button
                            href="https://www.strongdm.com/"
                            iconAlign="right"
                            iconName="external"
                            target="_blank"
                        >
                            <CedarIntl
                                id='integrations.learnMore'
                                defaultMessage='Learn more'
                            />
                        </Button>
                    </SpaceBetween>
                </Container>
            </SpaceBetween>
        </div>
    </Box>;
}
