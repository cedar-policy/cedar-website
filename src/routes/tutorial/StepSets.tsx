import React from "react";
import TutorialStep from "./TutorialStep";
import { Header } from "@cloudscape-design/components";
import CedarIntl from "../../components/CedarIntl";
import type { CedarEntity } from "../../cedar-utils";

export default function StepSets() {
  const principal = { type: "User", id: "alice" };
  const action = { type: "Action", id: "view" };
  const resource = { type: "Photo", id: "VacationPhoto94.jpg" };
  const policy = `permit(
  principal == User::"alice", 
  action in [Action::"view", Action::"edit", Action::"delete"], 
  resource == Photo::"VacationPhoto94.jpg"
);`;
  const context: Record<string, any> = {};
  const entities: CedarEntity[] = [];
  return (
    <TutorialStep
      waterfordEditorHeight={120}
      initialPolicyBody={policy}
      principal={principal}
      action={action}
      resource={resource}
      context={context}
      entities={entities}
      prePolicySlot={
        <>
          <Header variant={"h2"}>
            <CedarIntl id="tutorial.sets.label" defaultMessage="Sets" />
          </Header>
          <p>
            <CedarIntl
              id="tutorial.sets.prePolicy.p1"
              defaultMessage={
                "So far, the example policies we’ve " +
                "considered have referenced a single principal, action and " +
                "resource. This would require us to write a separate policy " +
                "for every permitted combination of these three. Fortunately " +
                "the Cedar language enables us to write policies with a " +
                "broader scope. In the case of Actions, we can define a " +
                "permitted set of actions as part of our policy."
              }
            />
          </p>
        </>
      }
      postPolicySlot={
        <>
          <p>
            <CedarIntl
              id="tutorial.sets.postPolicy.p1"
              defaultMessage={
                "The above policy permits Alice to view, edit " +
                "and delete the photo called vacationPhoto94.jpg. As you might " +
                "expect, this evaluates to {allow} for the request below. " +
                "Within the policy scope you can define sets for actions, but " +
                "not principals or resources. You can not, for example, define " +
                "a scope for a set of principals."
              }
              values={{
                allow: <code>allow</code>,
              }}
            />
          </p>
        </>
      }
      postCodeSlot={
        <>
          <p>
            <CedarIntl
              id="tutorial.sets.postCode.p1"
              defaultMessage={
                "Does the order of  items in the set affect " +
                "the authorization decision? What error does the syntax checker " +
                "give if you edit the scope to be a set of Users for the " +
                "principal?"
              }
            />
          </p>
        </>
      }
    />
  );
}
