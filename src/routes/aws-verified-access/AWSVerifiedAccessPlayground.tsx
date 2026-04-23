import React, { useState, useEffect } from 'react';
import {
    DecisionAndValidationOutputForUI,
    convertCedarAuthOutputToIntlOutput,
} from '../../util/outputMappers';
import {
    Box,
    Button,
    Container,
    Form,
    FormField,
    Grid,
    Header,
    Link,
    Select,
    SpaceBetween,
} from '@cloudscape-design/components';
import {
    getInitialTestCase,
    VERIFIED_ACCESS_TEST_CASES,
    VerifiedAccessTestCaseDefinition,
    testCaseToSelectOption,
} from './seedData';
import './styles.scss';
import DecisionAndValidationAlert from '../../components/DecisionAndValidationAlert';
import { useTranslations } from '../../hooks/useTranslations';
import CedarIntl from '../../components/CedarIntl';
import { CedarPolicyEditor, CedarJsonEditor } from '@cedar-policy/cedar-monaco-editor';
import { isAuthorized, getCedarVersion } from '@cedar-policy/cedar-wasm';

const EDITOR_LINE_HEIGHT_PX = 19;

const dummyValue = { type: 'Dummmy', id: 'x' };

export default function AWSVerifiedAccessPlayground() {
    const initialTestCase = getInitialTestCase(
        new URLSearchParams(window.location.hash),
    );
    const [testCase, setSelectedTestCase] =
    useState<VerifiedAccessTestCaseDefinition>(initialTestCase);
    const [policy, setPolicy] = useState<string>(initialTestCase.policyBody);
    const [authContext, setAuthContext] = useState(initialTestCase.context);
    const [output, setOutput] = useState<
    DecisionAndValidationOutputForUI | undefined
  >(undefined);
    const { t } = useTranslations();

    useEffect(() => {
        document.title = t('pageTitles.avaPlayground');
    }, []);

    // resets output to "..." whenever an input is changed
    useEffect(() => {
        setOutput(undefined);
    }, [policy, authContext]);

    const evaluateInput = () => {
        let parsedContext;
        try {
            parsedContext = JSON.parse(authContext);
        } catch (e) {
            parsedContext = {};
        }
        const result = isAuthorized({
            principal: dummyValue,
            action: dummyValue,
            resource: dummyValue,
            context: parsedContext,
            entities: [],
            policies: { staticPolicies: policy },
        });
        setOutput(convertCedarAuthOutputToIntlOutput(result, t));
    };

    const loadTestCase = (testCase: VerifiedAccessTestCaseDefinition) => {
        setSelectedTestCase(testCase);
        setPolicy(testCase.policyBody);
        setAuthContext(testCase.context);
        setOutput(undefined);
    };

  const cedarVersion: string = getCedarVersion();

    return (
        <Box>
            <Box padding={{ top: 'xxl', bottom: 'l', left: 'xxl', right: 'xxl' }}>
                <Header variant={'h1'}>
                    <CedarIntl
                        id="avaPlayground.title"
                        defaultMessage="Permissions Playground for AWS Verified Access"
                    />
                </Header>
                <Box variant={'p'}>
                    <CedarIntl
                        id="avaPlayground.description"
                        defaultMessage={
                            "Use this permissions playground to experiment " +
              'with evaluation of {serviceLink} permission policies.'
                        }
                        values={{
                            serviceLink: (
                                <Link
                                    external
                                    href="https://console.aws.amazon.com/vpc/home#VerifiedAccessInstances"
                                >
                                    <CedarIntl
                                        id="avaPlayground.serviceLink"
                                        defaultMessage="AWS Verified Access"
                                    />
                                </Link>
                            ),
                        }}
                    />
                </Box>
                <div style={{ maxWidth: 360 }}>
                    <Select
                        selectedOption={testCaseToSelectOption(testCase, t)}
                        onChange={(e) => {
                            const newTestCase = VERIFIED_ACCESS_TEST_CASES.find(
                                (testCase) => testCase.id === e.detail.selectedOption.value,
                            );
                            console.log(newTestCase);
                            if (!newTestCase) {
                                return;
                            }
                            loadTestCase(newTestCase);
                        }}
                        options={VERIFIED_ACCESS_TEST_CASES.map((testCase) =>
                            testCaseToSelectOption(testCase, t),
                        )}
                    />
                </div>
            </Box>
            <div className="main-container">
                <Box padding={'xl'}>
                    <form
                        data-testid={'policy-playground'}
                        onSubmit={(e) => e.preventDefault()}
                    >
                        <Form
                            actions={
                                <SpaceBetween size={'xs'}>
                                    <Button variant="primary" onClick={evaluateInput}>
                                        <CedarIntl
                                            id="avaPlayground.evaluateButton"
                                            defaultMessage="Evaluate"
                                        />
                                    </Button>
                                </SpaceBetween>
                            }
                        >
                            <Grid
                                id={'sandbox-grid'}
                                gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}
                            >
                                <Container
                                    header={
                                        <Header
                                            variant="h1"
                                            description={`${t('avaPlayground.cedarVersion')}${cedarVersion}`}
                                        >
                                            <CedarIntl
                                                id="avaPlayground.policy.header"
                                                defaultMessage="Permission Policy"
                                            />
                                        </Header>
                                    }
                                >
                                    <SpaceBetween direction="vertical" size="l">
                                        <FormField stretch label={t('avaPlayground.policy.label')}>
                                            <CedarPolicyEditor
                                                value={policy}
                                                onChange={setPolicy}
                                                height={`${20 * EDITOR_LINE_HEIGHT_PX}px`}
                                            />
                                        </FormField>
                                    </SpaceBetween>
                                </Container>

                                <Container
                                    header={
                                        <Header
                                            variant="h1"
                                            description={t('avaPlayground.context.description')}
                                        >
                                            <CedarIntl
                                                id="avaPlayground.context.header"
                                                defaultMessage="Authorization Context"
                                            />
                                        </Header>
                                    }
                                >
                                    <SpaceBetween direction="vertical" size="l">
                                        <FormField stretch>
                                            <CedarJsonEditor
                                                value={authContext}
                                                onChange={(newContent: string) =>
                                                    setAuthContext(newContent)
                                                }
                                                mode={{ type: 'json' }}
                                                height={`${12 * EDITOR_LINE_HEIGHT_PX}px`}
                                            />
                                        </FormField>
                                        {output && <DecisionAndValidationAlert output={output} />}
                                    </SpaceBetween>
                                </Container>
                            </Grid>
                        </Form>
                    </form>
                </Box>
            </div>
        </Box>
    );
}
