import React, { useState } from 'react';
import { useTranslations } from '../../hooks/useTranslations';
import { CedarPolicyEditor, CedarSchemaEditor } from '@cedar-policy/cedar-monaco-editor';
import { validate } from '@cedar-policy/cedar-wasm';
import DecisionAndValidationAlert from '../../components/DecisionAndValidationAlert';
import {
    Box,
    Button,
    Container,
    Header,
    Link,
} from '@cloudscape-design/components';
import CedarIntl from '../../components/CedarIntl';
import {
    DecisionAndValidationOutputForUI,
    convertCedarValidationOutputToIntlOutput,
    getSchemaParseError,
} from '../../util/outputMappers';
import LearningPathListItem from '../../components/LearningPathListItem';

const EDITOR_LINE_HEIGHT_PX = 19;

const initialSchema: string = JSON.stringify(
    {
        PhotoApp: {
            commonTypes: {
                PersonType: {
                    type: 'Record',
                    attributes: {
                        age: { type: 'Long' },
                        name: { type: 'String' },
                    },
                },
                ContextType: {
                    type: 'Record',
                    attributes: {
                        ip: {
                            type: 'Extension',
                            name: 'ipaddr',
                        },
                    },
                },
            },
            entityTypes: {
                User: {
                    shape: {
                        type: 'Record',
                        attributes: {
                            employeeId: { type: 'String', required: true },
                            personInfo: { type: 'PersonType' },
                        },
                    },
                    memberOfTypes: ['UserGroup'],
                },
                UserGroup: {
                    shape: {
                        type: 'Record',
                        attributes: {},
                    },
                },
                Photo: {
                    shape: {
                        type: 'Record',
                        attributes: {},
                    },
                    memberOfTypes: ['Album'],
                },
                Album: {
                    shape: {
                        type: 'Record',
                        attributes: {},
                    },
                },
            },
            actions: {
                viewPhoto: {
                    appliesTo: {
                        principalTypes: ['User', 'UserGroup'],
                        resourceTypes: ['Photo'],
                        context: { type: 'ContextType' },
                    },
                },
                createPhoto: {
                    appliesTo: {
                        principalTypes: ['User', 'UserGroup'],
                        resourceTypes: ['Photo'],
                        context: { type: 'ContextType' },
                    },
                },
                listPhotos: {
                    appliesTo: {
                        principalTypes: ['User', 'UserGroup'],
                        resourceTypes: ['Photo'],
                        context: { type: 'ContextType' },
                    },
                },
            },
        },
    },
    null,
    4,
);

const initialPolicy = `// Jane's friends can view all photos in her trips album

permit(
    principal in PhotoApp::UserGroup::"janeFriends",
    action in [PhotoApp::Action::"viewPhoto", PhotoApp::Action::"listPhotos"], 
    resource in PhotoApp::Album::"janeTrips"
);`;

export default function SchemaTutorialStep() {
    const { t } = useTranslations();
    const [schema, setSchema] = useState(initialSchema);
    const [policy, setPolicy] = useState(initialPolicy);
    const [output, setOutput] = useState<
    DecisionAndValidationOutputForUI | undefined
  >(undefined);

    return (
        <Box>
            <Header variant={'h2'}>
                <CedarIntl id="tutorial.schema.title" defaultMessage="Schema" />
            </Header>
            <p>
                <CedarIntl
                    id="tutorial.schema.paragraph1"
                    defaultMessage={
                        "As soon as your application adds more than a small number of principal and resource entity " +
            'types, or when you introduce an entity type that has several attributes, you introduce the ' +
            'risk of errors if your policies and your entities don’t agree on the structure or the names ' +
            'of those elements.'
                    }
                />
            </p>
            <p>
                <CedarIntl
                    id={'tutorial.schema.paragraph2'}
                    defaultMessage={
                        "A schema is a formal declaration of the names and structure of your entity types. You " +
            'declare the name of each type of principal, resource, and action that your application ' +
            'supports. The definition of those entities can also include a list of the attributes that ' +
            'define an entity of that type, with each attribute specifying a name and a data type.'
                    }
                />
            </p>
            <p>
                <CedarIntl
                    id={'tutorial.schema.paragraph3'}
                    defaultMessage={
                        'A schema is defined by using JSON. Schemas have three main properties:'
                    }
                />
            </p>
            <ul>
                <li>
                    <b>
                        <CedarIntl id={'general.namespace'} defaultMessage={'Namespace'} />
                    </b>
          :&nbsp;
                    <CedarIntl
                        id={'tutorial.schema.namespaceListItem'}
                        defaultMessage={
                            "uniquely identifies the schema. The namespace helps you distinguish between elements " +
              'with the same name from multiple schemas, for example HRApp::File and ' +
              'MedicalRecordsApp::File. The namespace is expressed as the top level key of the schema. ' +
              'Within each namespace, there is a JSON object defining entityTypes, ' +
              'actions, and types.'
                        }
                    />
                </li>
                <li>
                    <b>entityTypes</b>:&nbsp;
                    <CedarIntl
                        id={'tutorial.schema.entityTypesListItem'}
                        defaultMessage={
                            "defines the principal types and resource types supported by your application. Each " +
              'entity type defines a shape that describes its characteristics. The shape must specify ' +
              'a Cedar supported data type, and define the structure for the more complex types ' +
              'like records or sets. The entity can also specify an optional memberOf attribute to ' +
              'describe how this type can participate in a hierarchy, like files can be in folders, ' +
              'users can be members of groups, or photos can be organized in albums. Note that if ' +
              'you specify that an entity can be a member of its own type, then you are specifying ' +
              'that you can nest them, such as placing folders in other folders.'
                        }
                    />
                </li>
                <li>
                    <b>actions</b>:&nbsp;
                    <CedarIntl
                        id={'tutorial.schema.actionsListItem'}
                        defaultMessage={
                            "defines the operations that the principals can potentially perform on the resources. " +
              'Each action defines a name for the action, and a list of the resources and principals to which the action can apply.'
                        }
                    />
                </li>
                <li>
                    <b>commonTypes</b>:&nbsp;
                    <CedarIntl
                        id={'tutorial.schema.typesListItem'}
                        defaultMessage={
                            "defines type aliases for complex record types in the schema. Pre-defining types allows " +
              'for code re-usability whenever the same type is referenced in multiple entities. ' +
              'This key is optional.'
                        }
                    />
                </li>
            </ul>
            <p></p>
            <Container
                data-testid="schema"
                disableContentPaddings={true}
                header={
                    <Header variant={'h2'}>
                        <CedarIntl id={'general.schema'} defaultMessage={'Schema'} />
                    </Header>
                }
            >
                <CedarSchemaEditor
                    value={schema}
                    onChange={(newSchema: string) => {
                        setOutput(undefined);
                        setSchema(newSchema);
                    }}
                    height={`${20 * EDITOR_LINE_HEIGHT_PX}px`}
                />
            </Container>
            <p>
                <CedarIntl
                    id={'tutorial.schema.prePolicy1'}
                    defaultMessage={
                        'Cedar can validate policies against the schema. This lets you ensure that you are testing ' +
            'the correct structure and use the correct names, including the correct capitalization.'
                    }
                />
            </p>
            <p>
                <CedarIntl
                    id={'tutorial.schema.prePolicy2'}
                    defaultMessage={
                        "If you change any of the actions, or change the principal type from Group or the resource " +
            'type from Album, then the policy may no longer validate if the entity names no ' +
            'longer match the schema. Give it a try yourself, add entities and play with the policy.'
                    }
                />
            </p>
            <Box margin={{ bottom: 'l' }}>
                <Container
                    data-testid="cedar"
                    disableContentPaddings={true}
                    header={
                        <Header
                            variant={'h2'}
                            actions={
                                <Button
                                    variant={'primary'}
                                    onClick={() => {
                                        let parsedSchema;
                                        try {
                                            parsedSchema = JSON.parse(schema);
                                        } catch (e) {
                                            setOutput(getSchemaParseError(t));
                                            return;
                                        }
                                        const wasmResult = validate({
                                            validationSettings: { mode: 'strict' },
                                            schema: parsedSchema,
                                            policies: { staticPolicies: policy },
                                        });
                                        setOutput(
                                            convertCedarValidationOutputToIntlOutput(wasmResult, t),
                                        );
                                    }}
                                >
                                    <CedarIntl
                                        id={'tutorial.schema.primaryActionBtn'}
                                        defaultMessage={'Validate'}
                                    />
                                </Button>
                            }
                        >
                            <CedarIntl id={'general.cedar'} defaultMessage={'Cedar'} />
                        </Header>
                    }
                >
                    <CedarPolicyEditor
                        value={policy}
                        onChange={(p) => {
                            setOutput(undefined);
                            setPolicy(p);
                        }}
                        height={`${12 * EDITOR_LINE_HEIGHT_PX}px`}
                    />
                </Container>
                {output && (
                    <Box margin={{ top: 'xxl' }}>
                        <DecisionAndValidationAlert output={output} />
                    </Box>
                )}
            </Box>
            <h3>
                <CedarIntl
                    id="tutorial.moreResources"
                    defaultMessage="More resources:"
                />
            </h3>
            <ul>
                <LearningPathListItem
                    title={
                        <CedarIntl
                            id="tutorial.schema.cedarLanguageGuide"
                            defaultMessage="Schema (Cedar Language Guide)"
                        />
                    }
                    href="https://docs.cedarpolicy.com/schema/schema.html"
                    duration={{ minutes: 10 }}
                />
                <LearningPathListItem
                    title={
                        <CedarIntl
                            id="tutorial.schema.cedarcraftCliVideo.title"
                            defaultMessage="Cedarcraft video on Validating Cedar Policies at the Command Line"
                        />
                    }
                    href="https://youtu.be/HN6r4tbh0nc?si=0_NZ_1Tc77IzVUSx"
                    duration={{ minutes: 10 }}
                >
                    <CedarIntl
                        id="tutorial.schema.cedarcraftCliVideo.description"
                        defaultMessage="This video describes why and how to do schema based validation using the CLI application."
                    />
                </LearningPathListItem>
                <LearningPathListItem
                    title={
                        <CedarIntl
                            id="tutorial.schema.cedarcraftVsCodeVideo.title"
                            defaultMessage="Cedarcraft video on Cedar VS Code Extension for Easy Policy Validation"
                        />
                    }
                    href="https://youtu.be/n95_HMPPn1c?si=4KgPhF2FSOZ85uRb"
                    duration={{ minutes: 10 }}
                >
                    <CedarIntl
                        id="tutorial.schema.cedarcraftVsCodeVideo.description"
                        defaultMessage="This video describes why and how to do schema based validation using the VS Code extension. See the {blog} for the full set of Cedarcraft videos from {ztatlock}."
                        values={{
                            blog: (
                                <Link
                                    external
                                    href="https://www.cedarpolicy.com/blog/introducing-cedarcraft"
                                >
                                    <CedarIntl
                                        id="tutorial.schema.cedarcraftVsCodeVideo.blog"
                                        defaultMessage="Cedarcraft blog"
                                    />
                                </Link>
                            ),
                            ztatlock: (
                                <Link external href="https://ztatlock.net/">
                  Zachary Tatlock
                                </Link>
                            ),
                        }}
                    />
                </LearningPathListItem>
                <LearningPathListItem
                    title={
                        <CedarIntl
                            id="tutorial.schema.validationGithubAction.title"
                            defaultMessage="Validating Cedar policies with GitHub Actions"
                        />
                    }
                    href="https://www.cedarpolicy.com/blog/validating-policies-with-github-actions"
                    duration={{ minutes: 15 }}
                >
                    <CedarIntl
                        id="tutorial.schema.validationGithubAction.description"
                        defaultMessage="This blog describes a GitHub Action that can be used by anyone storing Cedar policies in GitHub to validate those policies against a Cedar schema."
                    />
                </LearningPathListItem>
            </ul>
        </Box>
    );
}
