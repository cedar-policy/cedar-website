import React from "react";
import {
  Button,
  Container,
  FormField,
  Header,
  Input,
  InputProps,
  SpaceBetween,
  TextareaProps,
} from "@cloudscape-design/components";
import CedarIntl from "../../components/CedarIntl";
import { useTranslations } from "../../hooks/useTranslations";
import { DecisionAndValidationOutputForUI } from "../../util/outputMappers";
import DecisionAndValidationAlert from "../../components/DecisionAndValidationAlert";
import { CedarJsonEditor } from "@cedar-policy/cedar-monaco-editor";
import type { CedarEntityIdObj } from "../../cedar-utils";
import { NonCancelableEventHandler } from "@cloudscape-design/components/internal/events";

const EDITOR_LINE_HEIGHT_PX = 19;

interface AuthQuerySectionProps {
  evaluateInput: () => void;
  principal: CedarEntityIdObj;
  action: CedarEntityIdObj;
  resource: CedarEntityIdObj;
  context: string;
  entities: string;
  schema: string;
  onChangePAR: (
    property: "principal" | "action" | "resource",
    field: "type" | "id",
  ) => NonCancelableEventHandler<
    InputProps.ChangeDetail | TextareaProps.ChangeDetail
  >;
  onChangeContext: (newContext: string) => void;
  onChangeEntities: (entitiesStr: string) => void;
  output: DecisionAndValidationOutputForUI | undefined;
}

export default function AuthQuery(props: AuthQuerySectionProps) {
  const {
    evaluateInput,
    principal,
    action,
    resource,
    context,
    entities,
    schema,
    onChangePAR,
    onChangeEntities,
    output,
  } = props;
  const { t } = useTranslations();
  return (
    <Container
      header={
        <Header
          variant="h2"
          description={<CedarIntl id="playground.query.description" />}
          actions={
            <Button
              variant="primary"
              onClick={evaluateInput}
              data-testid="evaluate-button"
            >
              <CedarIntl
                id="playground.evaluateButton"
                defaultMessage="Evaluate"
              />
            </Button>
          }
        >
          <CedarIntl
            id="playground.query.header"
            defaultMessage="Policy and Entities Definition"
          />
        </Header>
      }
    >
      <SpaceBetween direction="vertical" size="l">
        {output && <DecisionAndValidationAlert output={output} />}
        <EntityIDEditor
          label={t("playground.query.principal.label")}
          description={t("playground.query.principal.description")}
          entityId={principal}
          onChangeType={onChangePAR("principal", "type")}
          onChangeId={onChangePAR("principal", "id")}
          testIdPrefix="principal"
        />
        <EntityIDEditor
          isAction
          label={t("playground.query.action.label")}
          description={t("playground.query.action.description")}
          entityId={action}
          onChangeType={onChangePAR("action", "type")}
          onChangeId={onChangePAR("action", "id")}
        />
        <EntityIDEditor
          label={t("playground.query.resource.label")}
          description={t("playground.query.resource.description")}
          entityId={resource}
          onChangeType={onChangePAR("resource", "type")}
          onChangeId={onChangePAR("resource", "id")}
        />
        <FormField
          data-testid="context"
          stretch
          description={t("playground.query.context.description")}
          label={
            <CedarIntl
              id="playground.query.context.label.body"
              defaultMessage="Context {optional}"
              values={{
                optional: (
                  <i>
                    <CedarIntl
                      id="playground.query.context.label.italic"
                      defaultMessage="- optional"
                    />
                  </i>
                ),
              }}
            />
          }
        >
          <CedarJsonEditor
            value={context}
            onChange={(newContent: string) => props.onChangeContext(newContent)}
            mode={{
              type: "context",
              action: { actionType: action.type, id: action.id },
            }}
            schema={schema}
            height={`${3 * EDITOR_LINE_HEIGHT_PX}px`}
          />
        </FormField>
        <FormField
          data-testid="entities"
          stretch
          label={t("playground.query.entities.label")}
          description={t("playground.query.entities.description")}
        >
          <CedarJsonEditor
            value={entities}
            onChange={(newContent: string) => onChangeEntities(newContent)}
            mode={{ type: "entities" }}
            schema={schema}
            height={`${12 * EDITOR_LINE_HEIGHT_PX}px`}
          />
        </FormField>
      </SpaceBetween>
    </Container>
  );
}

interface EntityIDEditorProps {
  label: React.ReactNode;
  description: React.ReactNode;
  entityId: CedarEntityIdObj;
  onChangeType: NonCancelableEventHandler<
    InputProps.ChangeDetail | TextareaProps.ChangeDetail
  >;
  onChangeId: NonCancelableEventHandler<
    InputProps.ChangeDetail | TextareaProps.ChangeDetail
  >;
  testIdPrefix?: string;
  isAction?: boolean;
}

function EntityIDEditor(props: EntityIDEditorProps) {
  const { t } = useTranslations();
  return (
    <FormField label={props.label} description={props.description}>
      <SpaceBetween direction="horizontal" size="s">
        <div
          className="entity-type-field"
          data-testid={
            props.testIdPrefix ? `${props.testIdPrefix}-type` : undefined
          }
        >
          <Input
            value={props.entityId.type}
            onChange={props.onChangeType}
            placeholder={
              props.isAction
                ? t("playground.query.actionType")
                : t("playground.query.entityType")
            }
            ariaRequired
          />
        </div>
        <div
          className="entity-id-field"
          data-testid={
            props.testIdPrefix ? `${props.testIdPrefix}-id` : undefined
          }
        >
          <Input
            value={props.entityId.id}
            onChange={props.onChangeId}
            placeholder={
              props.isAction
                ? t("playground.query.actionId")
                : t("playground.query.entityId")
            }
            ariaRequired
          />
        </div>
      </SpaceBetween>
    </FormField>
  );
}
