import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    Box,
    Button,
    FormField,
    Header,
    InputProps,
    Link,
    NonCancelableCustomEvent,
    Popover,
    Select,
    SelectProps,
    SpaceBetween,
    StatusIndicator,
    Tabs,
} from '@cloudscape-design/components';
import './styles.scss';
import { getSeedDataForApp } from './seedDataManager';
import {
    exportCedarPlaygroundDataToBase64,
    importCedarPlaygroundDataFromBase64,
    PLAYGROUND_URL_FRAG_PREFIX,
    CedarPlaygroundDataTransferObject,
    PlaygroundDataV1,
} from '../../playground-helpers';
import {
    avpAttributesToCedarRecord,
    avpEntitiesToCedarEntities,
} from '../../cedar-utils';
import { isAuthorized, getCedarVersion } from '@cedar-policy/cedar-wasm';
import { useTranslations } from '../../hooks/useTranslations';
import CedarIntl from '../../components/CedarIntl';
import type { ContextMap, EntityItem } from '../../types/cedar-data-types';
import {
    DecisionAndValidationOutputForUI,
    convertCedarAuthOutputToIntlOutput,
    getSchemaParseError,
} from '../../util/outputMappers';
import AuthQuery from './AuthQuery';
import SchemaAndPolicies from './SchemaAndPolicies';
import type { SampleAppName } from './types';
import { useNavigate } from 'react-router-dom';
import { getLocaleFromPath } from '../../util/intlHelpers';

const INNER_WIDTH = 1280;

type SampleApp = { value: SampleAppName; label: string };

export const SAMPLE_APPS: Record<SampleAppName, string> = {
    PhotoFlash: 'playground.apps.photoFlash',
    HealthCare: 'playground.apps.healthCare',
    Kubernetes: 'playground.apps.kubernetes',
    JITNA: 'playground.apps.jitna',
};

const sampleAppsArray = Object.entries(SAMPLE_APPS).map(([value, label]) => ({
    value,
    label,
}));
export interface PolicyPlaygroundState extends PlaygroundDataV1 {
  queryChoices: string[];
  sampleApp: SampleAppName;
  sampleQueryIndex: number;
}

export default function PolicyPlayground() {
    const { t } = useTranslations();
    const [uiState, setUiState] = useState<PolicyPlaygroundState>(
        getStateFromHashOrDefault(),
    );
    const [output, setOutput] = useState<
    DecisionAndValidationOutputForUI | undefined
  >(undefined);
    const [shareLinkError, setShareLinkError] = useState<string | undefined>(
        undefined,
    );
    const navigate = useNavigate();
    const locale = getLocaleFromPath(window.location.pathname);

    // clears output whenever they change anything
    useEffect(() => {
        setOutput(undefined);
    }, [uiState]);

    // Load state from URL on page load, add event listener for hash changes
    useEffect(() => {
        const updateStateFromHash = () => setUiState(getStateFromHashOrDefault());
        window.addEventListener('hashchange', updateStateFromHash);
        return () => {
            window.removeEventListener('hashchange', updateStateFromHash);
        };
    }, []);

    const updateStateWithMerge = (
        partialNewState: Partial<PolicyPlaygroundState>,
    ) => {
        setUiState((oldState: PolicyPlaygroundState) => ({
            ...oldState,
            ...partialNewState,
        }));
    };

    const updateSampleApp = (newSampleApp: SampleApp) => {
        setUiState(getSeedDataForApp(newSampleApp.value, 0));
    };

    const updateSampleQueryIndex = (index: number) => {
        setUiState(getSeedDataForApp(uiState.sampleApp, index));
    };

    const evaluateInput = () => {
        const { policy, entities, context, principal, action, resource, schema } =
      uiState;
        const start = performance.now();
        let parsedSchema; // cedar-wasm Schema (JSON form)
        let parsedEntities;
        let parsedContext;
        try {
            parsedSchema = JSON.parse(schema);
        } catch (e) {
            setOutput(getSchemaParseError(t));
            return;
        }
        try {
            parsedEntities = JSON.parse(entities);
            parsedContext = JSON.parse(context);
        } catch (e) {
            // Fall through: let wasm produce the error if JSON is invalid.
            parsedEntities = [];
            parsedContext = {};
        }
        const result = isAuthorized({
            principal,
            action,
            resource,
            context: parsedContext,
            entities: parsedEntities,
            policies: { staticPolicies: policy },
            schema: parsedSchema,
            validateRequest: !!parsedSchema,
        });
        console.log('Finished isAuthorized. Duration:', performance.now() - start);
        console.log('Result:', result);
        setOutput(convertCedarAuthOutputToIntlOutput(result, t));
    };

  const cedarVersion: string = getCedarVersion();

    return (
        <div>
            <Box margin={'l'}>
                <SpaceBetween size={'m'} direction={'vertical'}>
                    <Header
                        variant={'h1'}
                        description={`${t('playground.cedarVersion')}${cedarVersion}`}
                    >
                        <CedarIntl id="playground.title" defaultMessage="Playground" />
                    </Header>
                    <div>
                        <CedarIntl
                            id={'playground.description'}
                            defaultMessage={
                                "This page has two examples for how Cedar policies can be used to describe and authorize an application’s permissions. The first is a photo-sharing application where Cedar policies determine which users can view particular photos. The second is a Healthcare application where Cedar policies determine who can make, document, and update healthcare appointments, based on their role and attributes."
                            }
                        />
                    </div>
                    <div>
                        <CedarIntl
                            id={'playground.avpCallout'}
                            defaultMessage={'You can also try this with {avp}.'}
                            values={{
                                avp: (
                                    <Link
                                        href={`/${locale}/integrations/getting-started-avp`}
                                        onFollow={(e) => {
                                            e.preventDefault();
                                            navigate(`/${locale}/integrations/getting-started-avp`);
                                        }}
                                    >
                                        <CedarIntl
                                            id="common.avp"
                                            defaultMessage="Amazon Verified Permissions"
                                        />
                                    </Link>
                                ),
                            }}
                        />
                    </div>
                    <div>
                        <SpaceBetween direction="horizontal" size="s">
                            <div style={{ minWidth: 400 }}>
                                <FormField
                                    label={
                                        <CedarIntl
                                            id="playground.appLabel"
                                            defaultMessage="Sample application"
                                        />
                                    }
                                >
                                    <Select
                                        selectedOption={{
                                            label: t(SAMPLE_APPS[uiState.sampleApp]),
                                            value: uiState.sampleApp,
                                        }}
                                        options={sampleAppsArray.map((app) => {
                                            return { ...app, label: t(app.label) };
                                        })}
                                        onChange={({ detail }) => {
                                            updateSampleApp(detail.selectedOption as SampleApp);
                                        }}
                                        selectedAriaLabel={t('playground.apps.selectedAriaLabel')}
                                    />
                                </FormField>
                            </div>
                            <div style={{ minWidth: 300 }}>
                                <FormField
                                    label={
                                        <CedarIntl
                                            id="playground.queryLabel"
                                            defaultMessage="Example authorization request"
                                        />
                                    }
                                    data-testid="access-selector"
                                >
                                    <Select
                                        selectedOption={{
                                            value: `${uiState.sampleQueryIndex}`,
                                            label: uiState.queryChoices[uiState.sampleQueryIndex],
                                        }}
                                        options={uiState.queryChoices.map((q, idx) => ({
                                            label: q,
                                            value: `${idx}`,
                                        }))}
                                        onChange={({ detail }) => {
                                            const selectedIndex = Number(detail.selectedOption.value);
                                            if (!isNaN(selectedIndex)) {
                                                updateSampleQueryIndex(selectedIndex);
                                            }
                                        }}
                                    />
                                </FormField>
                            </div>
                        </SpaceBetween>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <Popover
                            dismissButton={false}
                            position="top"
                            size="medium"
                            triggerType="custom"
                            content={
                                <StatusIndicator
                                    type={shareLinkError === undefined ? 'success' : 'error'}
                                >
                                    {shareLinkError === undefined ? (
                                        <CedarIntl
                                            id="playground.copyLink.success"
                                            defaultMessage="Link copied to clipboard."
                                        />
                                    ) : (
                                        <>
                                            <CedarIntl
                                                id="playground.copyLink.error"
                                                defaultMessage="Could not copy shareable link: "
                                            />
                                            {shareLinkError}
                                        </>
                                    )}
                                </StatusIndicator>
                            }
                        >
                            <Button
                                iconName="copy"
                                onClick={() => {
                                    const playgroundExport = exportCedarPlaygroundDataToBase64(
                                        getDTOFromUiState(uiState, cedarVersion),
                                    );
                                    if ('error' in playgroundExport) {
                                        setShareLinkError(playgroundExport.error);
                                        return;
                                    }
                                    const { protocol, host, pathname } = window.location;
                                    const hash = `#${PLAYGROUND_URL_FRAG_PREFIX}${playgroundExport.result}`;
                                    try {
                                        const outputUrl = new URL(
                                            `${protocol}//${host}${pathname}${hash}`,
                                        );
                                        navigator.clipboard
                                            .writeText(outputUrl.toString())
                                            .then(() => {
                                                setShareLinkError(undefined);
                                                console.log(`Copied ${outputUrl} to clipboard`);
                                            })
                                            .catch((e) => {
                                                setShareLinkError(
                                                    t('playground.copyLink.clipboardFailed'),
                                                );
                                                console.log(
                                                    `Could not copy ${outputUrl} to clipboard: ${e}`,
                                                );
                                            });
                                        window.location.hash = hash;
                                    } catch (error) {
                                        setShareLinkError(t('playground.copyLink.clipboardFailed'));
                                        console.log(`Could not copy URL to clipboard: ${error}`);
                                    }
                                }}
                            >
                                <CedarIntl
                                    id="playground.copyLink.button"
                                    defaultMessage="Copy inputs as shareable link"
                                />
                            </Button>
                        </Popover>
                    </div>
                </SpaceBetween>
            </Box>
            <div className={'grey-bg'}>
                <Box padding={'xl'} data-testid={'policy-playground'}>
                    <Tabs
                        tabs={[
                            {
                                label: t('playground.query.header'),
                                id: 'auth-query',
                                content: (
                                    <div style={{ maxWidth: INNER_WIDTH }}>
                                        <AuthQuery
                                            evaluateInput={evaluateInput}
                                            principal={uiState.principal}
                                            action={uiState.action}
                                            resource={uiState.resource}
                                            context={uiState.context}
                                            entities={uiState.entities}
                                            schema={uiState.schema}
                                            onChangePAR={(
                                                property: 'principal' | 'action' | 'resource',
                                                field: 'type' | 'id',
                                            ) =>
                                                (
                                                    e: NonCancelableCustomEvent<InputProps.ChangeDetail>,
                                                ) => {
                                                    updateStateWithMerge({
                                                        [property]: {
                                                            ...uiState[property],
                                                            [field]: e.detail.value,
                                                        },
                                                    });
                                                }}
                                            onChangeContext={(newContext: string) =>
                                                updateStateWithMerge({ context: newContext })
                                            }
                                            onChangeEntities={(entities) =>
                                                updateStateWithMerge({ entities })
                                            }
                                            output={output}
                                        />
                                    </div>
                                ),
                            },
                            {
                                label: t('playground.schemaAndPolicies.tabLabel'),
                                id: 'schema-and-policies',
                                content: (
                                    <div style={{ maxWidth: INNER_WIDTH }}>
                                        <SchemaAndPolicies
                                            policyBody={uiState.policy}
                                            updatePolicy={(policy) => {
                                                updateStateWithMerge({ policy });
                                            }}
                                            schema={uiState.schema}
                                            updateSchema={(schema) => {
                                                updateStateWithMerge({ schema });
                                            }}
                                        />
                                    </div>
                                ),
                            },
                        ]}
                    />
                </Box>
            </div>
        </div>
    );
}

function convertStringifiedAVPEntitiesAndContextToCedar(
    stringifiedAVPEntities: string,
    stringifiedAVPContext: string,
): { entities: string; context: string } | undefined {
    let errorKey = 'entityHelpers.conversion.entityJsonError';
    try {
        const avpEntitiesObj = JSON.parse(stringifiedAVPEntities) as EntityItem[];
        errorKey = 'entityHelpers.conversion.contextJsonError';
        const avpContextObj = JSON.parse(stringifiedAVPContext) as ContextMap;
        errorKey = 'entityHelpers.conversion.entityError';
        const simplifiedEntities = avpEntitiesToCedarEntities(avpEntitiesObj);
        errorKey = 'entityHelpers.conversion.contextError';
        const simplifiedContext = avpAttributesToCedarRecord(avpContextObj);
        return {
            entities: JSON.stringify(simplifiedEntities, null, 4),
            context: JSON.stringify(simplifiedContext, null, 4),
        };
    } catch (e) {
        toast.error('Error converting Entities or Context: ' + e);
    }
}

function isSampleApp(sampleApp: string): sampleApp is SampleAppName {
    return Object.keys(SAMPLE_APPS).includes(sampleApp);
}

function getSampleApp(sampleApp = ''): SampleAppName {
    const isSupported = isSampleApp(sampleApp);
    return isSupported ? sampleApp : 'PhotoFlash';
}

/**
 * The data format for compressed playground data may change. This helper should take whatever is decoded from the hash
 * and handle the distinctions between the different versions of the DTO, converting them into an update for the playground UI state.
 */
function getStateFromHashOrDefault(): PolicyPlaygroundState {
    const defaultApp = getSeedDataForApp('PhotoFlash', 0);
    if (!window.location.hash) {
        return defaultApp;
    }
    const hashPrefix = `#${PLAYGROUND_URL_FRAG_PREFIX}`;
    const startOfHash = window.location.hash.slice(0, hashPrefix.length);
    if (startOfHash !== hashPrefix) {
        return defaultApp;
    }
    const base64 = window.location.hash.slice(hashPrefix.length);
    const importedData = importCedarPlaygroundDataFromBase64(base64);
    if ('error' in importedData) {
        toast.error('Error importing state from URL: ' + importedData.error);
        return defaultApp;
    }

    const dataTransferObject = importedData.result;

    switch (dataTransferObject.interfaceVersion) {
        case 1: {
            let { entities, context, isAVPFormat } =
        dataTransferObject.playgroundData;
            if (isAVPFormat) {
                // Attempt to convert from AVP to Cedar
                const conversion = convertStringifiedAVPEntitiesAndContextToCedar(
                    entities,
                    context,
                );
                if (conversion) {
                    entities = conversion.entities;
                    context = conversion.context;
                }
            }
            const sampleApp = getSampleApp(
                dataTransferObject.playgroundData.sampleApp,
            );
            const sampleQueryIndex =
        dataTransferObject.playgroundData.sampleQueryIndex ?? 0;
            return {
                ...dataTransferObject.playgroundData,
                isAVPFormat: false,
                entities,
                context,
                sampleApp,
                sampleQueryIndex,
                queryChoices: getSeedDataForApp(sampleApp, sampleQueryIndex ?? 0)
                    .queryChoices,
            };
        }
        default: {
            toast.error('Unrecognized interfaceVersion in imported Cedar data!');
            return defaultApp;
        }
    }
}

/**
 * Makes the latest version of `CedarPlaygroundDataTransferObject` based on the `PolicyPlaygroundState`.
 */
function getDTOFromUiState(
    policyPlaygroundState: PolicyPlaygroundState,
    cedarVersion: string,
): CedarPlaygroundDataTransferObject {
    const {
        action,
        context,
        entities,
        isAVPFormat,
        policy,
        principal,
        resource,
        schema,
        sampleApp,
        sampleQueryIndex,
    } = policyPlaygroundState;
    return {
        cedarVersion,
        interfaceVersion: 1,
        playgroundData: {
            action,
            context,
            entities,
            isAVPFormat,
            policy,
            principal,
            resource,
            schema,
            sampleApp,
            sampleQueryIndex: sampleQueryIndex ?? 0,
        },
    };
}
