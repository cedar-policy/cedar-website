import { Box } from "@cloudscape-design/components";
import StaticIsAuthorizedRequestWidget from "../../components/StaticIsAuthorizedRequestWidget";
import ReadOnlyCode from "../../components/ReadOnlyCode";
import React, { ReactNode, useCallback, useState } from "react";
import DecisionAndValidationAlert from "../../components/DecisionAndValidationAlert";
import { useTranslations } from "../../hooks/useTranslations";
import { CedarPolicyEditor } from "@cedar-policy/cedar-monaco-editor";
import { isAuthorized } from "@cedar-policy/cedar-wasm";
import {
  DecisionAndValidationOutputForUI,
  convertCedarAuthOutputToIntlOutput,
} from "../../util/outputMappers";
import { renderRustCode } from "./helpers";
import { type TypeAndId, type Context } from "@cedar-policy/cedar-wasm";
import type { CedarEntity } from "../../cedar-utils";

const EDITOR_LINE_HEIGHT_PX = 19;

interface TutorialStepProps {
  prePolicySlot: ReactNode;
  postPolicySlot: ReactNode;
  postCodeSlot: ReactNode;
  initialPolicyBody: string;
  principal: TypeAndId;
  action: TypeAndId;
  resource: TypeAndId;
  context: Context;
  entities: CedarEntity[];
  waterfordEditorHeight: number;
}

interface TutorialStepState {
  policyBody: string;
  output?: DecisionAndValidationOutputForUI;
}

export default function TutorialStep(props: TutorialStepProps) {
  const { t } = useTranslations();
  const [state, setState] = useState<TutorialStepState>({
    policyBody: props.initialPolicyBody,
  });
  const { principal, action, resource, context, entities } = props;

  const updatePolicy = useCallback(
    (newPolicyBody: string) => {
      setState(() => ({
        policyBody: newPolicyBody,
        output: undefined,
      }));
    },
    [state.policyBody],
  );

  const onPrimaryAction = useCallback(() => {
    // cedar-wasm auto-initializes on first call; no readiness gating needed.
    const result = isAuthorized({
      principal,
      action,
      resource,
      context,
      entities,
      policies: { staticPolicies: state.policyBody },
    });
    setState((prevState) => ({
      ...prevState,
      output: convertCedarAuthOutputToIntlOutput(result, t),
    }));
  }, [state.policyBody]);

  return (
    <Box>
      {props.prePolicySlot}
      <CedarPolicyEditor
        value={state.policyBody}
        onChange={updatePolicy}
        height={`${12 * EDITOR_LINE_HEIGHT_PX}px`}
      />
      {props.postPolicySlot}
      {state.output && (
        <Box margin={{ bottom: "xxl" }}>
          <DecisionAndValidationAlert output={state.output} />
        </Box>
      )}
      <StaticIsAuthorizedRequestWidget
        code={{
          rust: (
            <ReadOnlyCode
              language={"rust"}
              code={renderRustCode(
                principal,
                action,
                resource,
                context,
                state.policyBody,
                entities,
              )}
            />
          ),
        }}
        buttonDisabled={false}
        onClickPrimaryAction={onPrimaryAction}
      />

      {props.postCodeSlot}
    </Box>
  );
}
