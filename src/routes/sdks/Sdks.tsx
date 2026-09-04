import React, { useEffect } from 'react';
import { Box, Button, Container, Header, SpaceBetween } from '@cloudscape-design/components';
import CedarIntl from '../../components/CedarIntl';
import { useTranslations } from '../../hooks/useTranslations';
import { CORE_SDKS, TOOLING, SdkEntry, LANGUAGE_ICONS } from './sdkData';
import './Sdks.scss';

function SdkCard({ entry }: { entry: SdkEntry }) {
    return (
        <Container
            header={
                <Header
                    variant="h2"
                    description={entry.language}
                    actions={
                        <Button href={entry.repo} target="_blank" iconAlign="right" iconName="external">
                            <CedarIntl id="sdks.viewOnGithub" defaultMessage="View on GitHub" />
                        </Button>
                    }
                >
                    <span className="sdk-card-title">
                        <img
                            className="sdk-card-icon"
                            src={LANGUAGE_ICONS[entry.languageIcon]}
                            alt=""
                            aria-hidden="true"
                        />
                        {entry.name}
                    </span>
                </Header>
            }
        >
            <SpaceBetween size="m">
                <Box>
                    <CedarIntl id={entry.descriptionId} defaultMessage={entry.descriptionDefault} />
                </Box>
                {entry.packageUrl && (
                    <Button
                        href={entry.packageUrl}
                        target="_blank"
                        iconAlign="right"
                        iconName="external"
                    >
                        <CedarIntl
                            id="sdks.getPackage"
                            defaultMessage="Get it on {registry}"
                            values={{ registry: entry.packageRegistry }}
                        />
                    </Button>
                )}
            </SpaceBetween>
        </Container>
    );
}

export default function Sdks() {
    const { t } = useTranslations();
    useEffect(() => {
        document.title = t('pageTitles.sdks');
    }, [t]);

    return (
        <Box margin={{ left: 'xxxl', vertical: 'm' }}>
            <div className="medium-container">
                <SpaceBetween size="l">
                    <div>
                        <h1>
                            <CedarIntl id="sdks.title" defaultMessage="SDKs & language bindings" />
                        </h1>
                        <p>
                            <CedarIntl
                                id="sdks.description"
                                defaultMessage={
                                    'Cedar is written in Rust, with official bindings for other languages and ' +
                                    'ready-made integrations for common platforms. All of these are open source ' +
                                    'and available under the Apache-2.0 license on GitHub.'
                                }
                            />
                        </p>
                    </div>

                    <div>
                        <h2>
                            <CedarIntl id="sdks.coreSection.title" defaultMessage="Core engine & bindings" />
                        </h2>
                        <SpaceBetween size="m">
                            {CORE_SDKS.map((entry) => (
                                <SdkCard key={entry.id} entry={entry} />
                            ))}
                        </SpaceBetween>
                    </div>

                    <div>
                        <h2>
                            <CedarIntl
                                id="sdks.toolingSection.title"
                                defaultMessage="Integrations & tooling"
                            />
                        </h2>
                        <SpaceBetween size="m">
                            {TOOLING.map((entry) => (
                                <SdkCard key={entry.id} entry={entry} />
                            ))}
                        </SpaceBetween>
                    </div>

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
