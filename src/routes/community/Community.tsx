import React, { useEffect } from 'react';
import { Box, Button, Container, Header, Icon, SpaceBetween } from '@cloudscape-design/components';
import CedarIntl from '../../components/CedarIntl';
import { useTranslations } from '../../hooks/useTranslations';
import './Community.scss';

interface CommunityLink {
    id: string;
    titleId: string;
    titleDefault: string;
    bodyId: string;
    bodyDefault: string;
    href: string;
    ctaId: string;
    ctaDefault: string;
    // Either a logo served from static/img/logos, or a built-in Cloudscape icon name.
    iconSrc?: string;
    iconName?: 'file' | 'security';
}

const LINKS: CommunityLink[] = [
    {
        id: 'slack',
        titleId: 'community.slack.title',
        titleDefault: 'Chat on Slack',
        bodyId: 'community.slack.body',
        bodyDefault:
            'Ask questions, share what you are building, and talk to the maintainers in the #cedar-general channel on the CNCF Slack.',
        href: 'https://cloud-native.slack.com/archives/C0AQXC9M4G1',
        ctaId: 'community.slack.cta',
        ctaDefault: 'Join Slack',
        iconSrc: '/img/logos/slack.svg',
    },
    {
        id: 'github',
        titleId: 'community.github.title',
        titleDefault: 'Contribute on GitHub',
        bodyId: 'community.github.body',
        bodyDefault:
            'Cedar is open source under Apache-2.0. File issues, open pull requests, and browse the code across the cedar-policy organization.',
        href: 'https://github.com/cedar-policy',
        ctaId: 'community.github.cta',
        ctaDefault: 'View on GitHub',
        iconSrc: '/img/logos/github.svg',
    },
    {
        id: 'rfcs',
        titleId: 'community.rfcs.title',
        titleDefault: 'Shape the language',
        bodyId: 'community.rfcs.body',
        bodyDefault:
            'Significant changes to Cedar go through a public RFC process. Read active proposals and weigh in on the future of the language.',
        href: 'https://github.com/cedar-policy/rfcs',
        ctaId: 'community.rfcs.cta',
        ctaDefault: 'Browse RFCs',
        iconName: 'file',
    },
    {
        id: 'security',
        titleId: 'community.security.title',
        titleDefault: 'Report a security issue',
        bodyId: 'community.security.body',
        bodyDefault:
            'If you discover a potential security issue, please notify us directly by email rather than opening a public issue.',
        href: 'mailto:cedar-policy-security@lists.cncf.io',
        ctaId: 'community.security.cta',
        ctaDefault: 'Email the security team',
        iconName: 'security',
    },
];

export default function Community() {
    const { t } = useTranslations();
    useEffect(() => {
        document.title = t('pageTitles.community');
    }, [t]);

    return (
        <Box margin={{ left: 'xxxl', vertical: 'm' }}>
            <div className="medium-container">
                <SpaceBetween size="l">
                    <div>
                        <h1>
                            <CedarIntl id="community.title" defaultMessage="Community" />
                        </h1>
                        <p>
                            <CedarIntl
                                id="community.description"
                                defaultMessage={
                                    'Cedar is an open source project and a Cloud Native Computing Foundation (CNCF) ' +
                                    'sandbox project. Here is how to get help, get involved, and follow along.'
                                }
                            />
                        </p>
                    </div>

                    {LINKS.map((link) => (
                        <Container
                            key={link.id}
                            header={
                                <Header variant="h2">
                                    <span className="community-card-title">
                                        {link.iconSrc ? (
                                            <img
                                                className="community-card-icon"
                                                src={link.iconSrc}
                                                alt=""
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            link.iconName && <Icon name={link.iconName} size="big" />
                                        )}
                                        <CedarIntl id={link.titleId} defaultMessage={link.titleDefault} />
                                    </span>
                                </Header>
                            }
                        >
                            <SpaceBetween size="m">
                                <Box>
                                    <CedarIntl id={link.bodyId} defaultMessage={link.bodyDefault} />
                                </Box>
                                <Button
                                    href={link.href}
                                    target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                                    iconAlign="right"
                                    iconName={link.href.startsWith('mailto:') ? 'envelope' : 'external'}
                                >
                                    <CedarIntl id={link.ctaId} defaultMessage={link.ctaDefault} />
                                </Button>
                            </SpaceBetween>
                        </Container>
                    ))}

                    <Box variant="small" color="text-body-secondary">
                        <CedarIntl
                            id="common.trademarkDisclaimer"
                            defaultMessage="Various trademarks held by their respective owners."
                        />
                    </Box>
                </SpaceBetween>
            </div>
        </Box>
    );
}
