import React from "react";
import TutorialStep from "./TutorialStep";
import { Header } from "@cloudscape-design/components";
import CedarIntl from "../../components/CedarIntl";
import type { CedarEntity } from "../../cedar-utils";

export default function StepForbid() {
  const principal = { type: "User", id: "alice" };
  const action = { type: "Action", id: "view" };
  const resource = { type: "Photo", id: "VacationPhoto94.jpg" };
  const context: Record<string, any> = {};
  const policy = `permit(
  principal == User::"alice", 
  action    == Action::"view", 
  resource  == Photo::"VacationPhoto94.jpg"
);

forbid(
  principal == User::"alice", 
  action    == Action::"view", 
  resource  == Photo::"VacationPhoto94.jpg"
);`;
  const entities: CedarEntity[] = [];

  return (
    <TutorialStep
      waterfordEditorHeight={240}
      initialPolicyBody={policy}
      principal={principal}
      action={action}
      resource={resource}
      context={context}
      entities={entities}
      prePolicySlot={
        <>
          <Header variant={"h2"}>
            <CedarIntl
              id="tutorial.forbid.label"
              defaultMessage="Forbid policies"
            />
          </Header>
          <p>
            <CedarIntl
              id="tutorial.forbid.prePolicy.p1"
              defaultMessage={
                "By default, in the absence of an applicable " +
                "permit policy, the authorization decision will be DENY. " +
                "Additionally you can create policies that explicitly forbid " +
                "certain requests. Forbid polices override permit policies. " +
                "Hence forbid policies can act as guard rails ensuring that " +
                "certain requests will always be denied regardless of any " +
                "permit policies."
              }
            />
          </p>
        </>
      }
      postPolicySlot={
        <>
          <p>
            <CedarIntl
              id="tutorial.forbid.postPolicy.p1"
              defaultMessage={
                "The policy set expressed above illustrates " +
                "this point. We see two policies with exactly the same scope, " +
                "but different effects. The first permits alice to view the " +
                "photo `VacationPhoto94.jpg`, the second forbids her. When we " +
                "submit the the authorization request below, we expect " +
                "authorization to be denied."
              }
            />
          </p>
        </>
      }
      postCodeSlot={
        <p>
          <CedarIntl
            id="tutorial.forbid.postCode.p1"
            defaultMessage={
              "The sequence in which policies are arranged has " +
              "no impact on the outcome of the evaluation. Try rearranging the " +
              "order of the policies above, and confirm that the decision is " +
              "remains the same. For the rest of this tutorial we will use " +
              "examples of permit policies, but remember that all of the " +
              "concepts that we introduce using permit policies can also be used " +
              "with forbid policies."
            }
          />
        </p>
      }
    />
  );
}
