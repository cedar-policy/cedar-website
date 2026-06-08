import React, { useState } from 'react';
import { Button, Container, Header, SpaceBetween } from '@cloudscape-design/components';
import CedarIntl from '../../components/CedarIntl';
import DecisionAndValidationAlert from '../../components/DecisionAndValidationAlert';
import { useTranslations } from '../../hooks/useTranslations';
import { CedarPolicyEditor, CedarSchemaEditor } from '@cedar-policy/cedar-monaco-editor';
import { checkParsePolicySet, validate } from '@cedar-policy/cedar-wasm';
import {
    DecisionAndValidationOutputForUI,
    convertCedarValidationOutputToIntlOutput,
} from '../../util/outputMappers';

const EDITOR_LINE_HEIGHT_PX = 19;

interface SchemaAndPoliciesProps {
    policyBody: string;
    updatePolicy: (p: string) => void;
    schema: string;
    updateSchema: (s: string) => void;
}

export default function SchemaAndPolicies(props: SchemaAndPoliciesProps) {
    const { t } = useTranslations();
    const [output, setOutput] = useState<DecisionAndValidationOutputForUI | undefined>(undefined);

    return (
        <SpaceBetween size={'xxl'} direction={'vertical'}>
            <Container
                data-testid="policies"
                header={
                    <Header
                        variant="h2"
                        description={t('playground.schemaAndPolicies.descriptionPolicies')}
                        actions={
                            <Button
                                variant="primary"
                                onClick={() => {
                                    const parsingResult = checkParsePolicySet({
                                        staticPolicies: props.policyBody,
                                    });
                                    if (parsingResult.type === 'failure') {
                                        const { errors } = parsingResult;
                                        setOutput({
                                            status: 'error',
                                            message: 'waterfordRust.parse.invalid',
                                            errors: errors.map((e) => e.message),
                                            warnings: [],
                                        });
                                    } else {
                                        const validationResult = validate({
                                            validationSettings: { mode: 'strict' },
                                            schema: props.schema,
                                            policies: { staticPolicies: props.policyBody },
                                        });
                                        setOutput(convertCedarValidationOutputToIntlOutput(validationResult, t));
                                    }
                                }}
                                data-testid="validate-button"
                            >
                                <CedarIntl id="playground.schemaAndPolicies.validateButton" defaultMessage="Validate" />
                            </Button>
                        }
                    >
                        <CedarIntl
                            id="playground.schemaAndPolicies.headerPolicies"
                            defaultMessage="Policy and Entities Definition"
                        />
                    </Header>
                }
            >
                <SpaceBetween direction="vertical" size="l">
                    {output && <DecisionAndValidationAlert output={output} />}
                    <CedarPolicyEditor
                        value={props.policyBody}
                        onChange={(p) => {
                            setOutput(undefined);
                            props.updatePolicy(p);
                        }}
                        schema={{ type: 'cedarFormat', value: props.schema }}
                        height={`${12 * EDITOR_LINE_HEIGHT_PX}px`}
                    />
                </SpaceBetween>
            </Container>
            <Container
                data-testid="schema"
                disableContentPaddings={true}
                header={
                    <Header variant={'h2'} description={t('playground.schemaAndPolicies.descriptionSchema')}>
                        <CedarIntl id={'general.schema'} defaultMessage={'Schema'} />
                    </Header>
                }
            >
                <CedarSchemaEditor
                    value={props.schema}
                    onChange={(newSchema: string) => {
                        setOutput(undefined);
                        props.updateSchema(newSchema);
                    }}
                    height={`${12 * EDITOR_LINE_HEIGHT_PX}px`}
                />
            </Container>
        </SpaceBetween>
    );
}
