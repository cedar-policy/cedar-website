import React, { useEffect } from 'react';
import { Box, Button, Link, SpaceBetween, ColumnLayout } from '@cloudscape-design/components';
import './styles.scss';
import { useNavigate } from 'react-router-dom';
import { getLocaleFromPath } from '../../util/intlHelpers';
import CedarIntl from '../../components/CedarIntl';
import { useTranslations } from '../../hooks/useTranslations';
import { isMobile } from '../../util/miscHelpers';

export default function Overview() {
    const { t } = useTranslations();
    const navigate = useNavigate();
    const locale = getLocaleFromPath(window.location.pathname);
    const mobile = isMobile();
    useEffect(() => {
        document.title = t('pageTitles.cedarLang');
    }, []);
    return (
        <div>
            <section className={'hero-section page-section'}>
                <Box padding={'xxl'}>
                    <div>
                        <h1 className='header-font'>
                            <CedarIntl
                                id='overview.intro.title'
                                defaultMessage='Fast, scalable access control'
                            />
                        </h1>
                        <p>
                            <CedarIntl
                                id='overview.intro.body2'
                                defaultMessage={'Cedar is a language for defining permissions as policies, and a specification for evaluating those policies. Use Cedar to define who is authorized to do what within your application. Cedar is open source.'}
                            />
                        </p>
                        <SpaceBetween size={'xl'} direction={'horizontal'}>
                            <div className='primary-button'>
                                <Button variant={'primary'} onClick={() => navigate(`/${locale}/learn`)}>
                                    <CedarIntl
                                        id='overview.intro.learnLink'
                                        defaultMessage='Learn Cedar'
                                    />
                                </Button>
                            </div>
                            <Button variant={'link'} onClick={() => navigate(`/${locale}/tutorial`)}>
                                <CedarIntl
                                    id='overview.intro.tutorialLink'
                                    defaultMessage='Do the tutorial'
                                />
                            </Button>
                            <Button variant={'link'} onClick={() => navigate(`/${locale}/playground`)}>
                                <CedarIntl
                                    id='overview.intro.playgroundLink'
                                    defaultMessage='Try it out in playground'
                                />
                            </Button>
                        </SpaceBetween>
                    </div>
                </Box>
            </section>
            <section className='page-section announcement-bar'>
                <Box padding={{ horizontal: 'xxl', vertical: 's' }}>
                    <span className='announcement-text'>
                        <b><CedarIntl
                            id='overview.announcement.date'
                            defaultMessage='February 9, 2026:'
                        /></b>
                        &nbsp;
                        <CedarIntl
                            id='overview.announcement.body'
                            defaultMessage={'Cedar 4.9 is now released, with refinements to type-aware partial evaluation and additional support for working with FFI types.'}
                        />
                        &nbsp;
                        <a
                            target={'_blank'}
                            rel="noopener noreferrer"
                            href='https://github.com/cedar-policy/cedar/releases/tag/v4.9.0'
                        ><CedarIntl
                                id='overview.announcement.learnMore'
                                defaultMessage='To learn more view the Cedar change log here.'
                            /></a>
                    </span>
                </Box>
            </section>
            <section className={'page-section light-grey'}>
                <Box
                    padding='l'
                >
                    <ColumnLayout columns={(mobile) ? 1 : 4} borders='vertical'>
                        <ColumnWithIcon
                            mobile={mobile}
                            iconPath='/brushes.svg'
                            iconAltText={t('overview.description.expressive.iconAltText')}
                        >
                            <h2>
                                <CedarIntl
                                    id='overview.description.expressive.title'
                                    defaultMessage='Expressive'
                                />
                            </h2>
                            <p>
                                <CedarIntl
                                    id='overview.description.expressive.body'
                                    defaultMessage={'Cedar is a simple yet expressive language that is ' +
                                    'purpose-built to support authorization use cases for common ' +
                                    'authorization models such as RBAC and ABAC.'}
                                />
                            </p>
                        </ColumnWithIcon>
                        <ColumnWithIcon
                            mobile={mobile}
                            iconPath='/gauge.svg'
                            iconAltText={t('overview.description.performant.iconAltText')}
                        >
                            <h2>
                                <CedarIntl
                                    id='overview.description.performant.title'
                                    defaultMessage='Performant'
                                />
                            </h2>
                            <p>
                                <CedarIntl
                                    id='overview.description.performant.body'
                                    defaultMessage={'Cedar is fast and scalable. The policy structure is designed ' +
                                    'to be indexed for quick retrieval and to support fast and scalable real-time ' +
                                    'evaluation, with bounded latency.'}
                                />
                            </p>
                        </ColumnWithIcon>
                        <ColumnWithIcon
                            mobile={mobile}
                            iconPath='/search_magnifier.svg'
                            iconAltText={t('overview.description.analyzable.iconAltText')}
                        >
                            <h2>
                                <CedarIntl
                                    id='overview.description.analyzable.title'
                                    defaultMessage='Analyzable'
                                />
                            </h2>
                            <p>
                                <CedarIntl
                                    id='overview.description.analyzable.body'
                                    defaultMessage={'Cedar is designed for analysis using Automated Reasoning. ' +
                                    'This enables analyzer tools capable of optimizing your policies and ' +
                                    'proving that your security model is what you believe it is.'}
                                />
                            </p>
                        </ColumnWithIcon>
                        <ColumnWithIcon
                            mobile={mobile}
                            iconPath='/open_source.svg'
                            iconAltText={t('overview.description.open.iconAltText')}
                        >
                            <h2>
                                <CedarIntl
                                    id='overview.description.open.title'
                                    defaultMessage='Open'
                                />
                            </h2>
                            <p>
                                <CedarIntl
                                    id='overview.description.open.body'
                                    defaultMessage={'The Cedar language specification, the Cedar SDK, and much more are available from our GitHub repo, under the terms of the Apache-2.0 license.'}
                                />
                            </p>
                        </ColumnWithIcon>
                    </ColumnLayout>
                </Box>
            </section>
            <section className="page-section white">
                <Box padding={'xxl'}>
                    <SpaceBetween size='m'>
                        <div>
                            <h2>
                                <CedarIntl
                                    id='overview.callToAction.title'
                                    defaultMessage='Take control of your security posture'
                                />
                            </h2>
                            <p>
                                <CedarIntl
                                    id='overview.callToAction.unifyCode'
                                    defaultMessage={'Stop using slightly different authorization code for every service ' +
                                    'you deploy, or every single use case.'}
                                />
                                &nbsp;
                                <CedarIntl
                                    id='overview.callToAction.useCedar'
                                    defaultMessage={'With Cedar, you can build it once and deploy it anywhere, with ' +
                                    'minimal code repetition across services. Offload the access controls to us.'}
                                />
                            </p>
                        </div>
                        <div>
                            <h2>
                                <CedarIntl
                                    id='overview.otherLinks.integrations.title2'
                                    defaultMessage='Managed solutions and other integrations'
                                />
                            </h2>
                            <p>
                                <CedarIntl
                                    id='overview.otherLinks.integrations.body2'
                                    defaultMessage={'Learn about {avp}, a fully managed AWS service for storing and evaluating Cedar policies. Find out how more companies and services in different verticals are building {integrations} with Cedar today.'}
                                    values={{
                                        avp: <Link
                                            href={`/${locale}/integrations/introducing-avp`}
                                            onFollow={(e) => {
                                                e.preventDefault();
                                                navigate(`/${locale}/integrations/introducing-avp`);
                                            }}
                                        >
                                            <CedarIntl
                                                id='common.avp'
                                                defaultMessage='Amazon Verified Permissions'
                                            />
                                        </Link>,
                                        integrations: <Link
                                            href={`/${locale}/integrations`}
                                            onFollow={(e) => {
                                                e.preventDefault();
                                                navigate(`/${locale}/integrations`);
                                            }}
                                        >
                                            <CedarIntl
                                                id='overview.otherLinks.integrations.link'
                                                defaultMessage='integrations'
                                            />
                                        </Link>,
                                    }}
                                />
                            </p>
                        </div>
                        <div>
                            <h2>
                                <CedarIntl
                                    id='overview.otherLinks.security.title'
                                    defaultMessage='Security questions'
                                />
                            </h2>
                            <p>
                                <CedarIntl
                                    id='overview.otherLinks.security.body'
                                    defaultMessage={'If you discover a potential security issue in this project we ' +
                                    'ask that you notify AWS/Amazon Security via our {page} or directly via email to ' +
                                    'aws-security@amazon.com.'}
                                    values={{
                                        page: <Link href='http://aws.amazon.com/security/vulnerability-reporting/' external>
                                            <CedarIntl
                                                id='overview.otherLinks.security.vulnerabilityPage'
                                                defaultMessage='vulnerability reporting page'
                                            />
                                        </Link>,
                                    }}
                                />
                            </p>
                        </div>
                        <div>
                            <h2>
                                <CedarIntl
                                    id='overview.getInvolved.title'
                                    defaultMessage='Get Involved'
                                />
                            </h2>
                            <p>
                                <Link href={'https://cloud-native.slack.com/archives/C0AQXC9M4G1'} external>
                                    <CedarIntl
                                        id='overview.getInvolved.joinSlack'
                                        defaultMessage='Join Slack'
                                    />
                                </Link>
                            </p>
                            <p>
                                <Link href={'https://github.com/cedar-policy'} external>
                                    <CedarIntl
                                        id='overview.getInvolved.contribute'
                                        defaultMessage='Contribute'
                                    />
                                </Link>
                            </p>
                        </div>
                    </SpaceBetween>
                </Box>
            </section>
        </div>
    );
}

interface ColumnWithIconProps extends React.PropsWithChildren{
    mobile: boolean;
    iconPath: string;
    iconAltText: string;
}

function ColumnWithIcon(props: ColumnWithIconProps) {
    const { mobile, iconPath, iconAltText, children } = props;
    return (
        <Box padding={{ horizontal: 'm' }}>
            <div style={{ display: 'flex', flexDirection: (mobile) ? 'row' : 'column' }}>
                <img src={iconPath} alt={iconAltText} style={{ width: 'min-content', height: 'min-content' }} />
                <Box padding = {mobile ? { left: 'm' } : {}}>
                    {children}
                </Box>
            </div>
        </Box>
    );
}
