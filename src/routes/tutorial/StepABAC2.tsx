import React from "react";
import TutorialStep from "./TutorialStep";
import { Header } from "@cloudscape-design/components";
import CedarIntl from "../../components/CedarIntl";
import type { CedarEntity } from "../../cedar-utils";

export default function StepABAC2() {
  const principal = { type: "User", id: "alice" };
  const action = { type: "Action", id: "view" };
  const resource = { type: "Photo", id: "VacationPhoto94.jpg" };
  const entities: CedarEntity[] = [
    {
      uid: {
        type: "Photo",
        id: "VacationPhoto94.jpg",
      },
      attrs: {
        dept: "cosmic",
        owner: "alice",
      },
      parents: [],
    },
    {
      uid: {
        type: "User",
        id: "alice",
      },
      attrs: {
        id: "alice",
        dept: "chaos",
      },
      parents: [],
    },
  ];
  const policy = `permit(
  principal, 
  action in [Action::"view", Action::"edit", Action::"delete"], 
  resource 
)
when {
  resource.owner == principal.id
};
`;
  const context: Record<string, any> = {};
  return (
    <TutorialStep
      waterfordEditorHeight={160}
      initialPolicyBody={policy}
      principal={principal}
      action={action}
      resource={resource}
      context={{}}
      entities={entities}
      prePolicySlot={
        <>
          <Header variant={"h2"}>
            <CedarIntl
              id="tutorial.abacPt2.header"
              defaultMessage="Attribute-based access control (part 2)"
            />
          </Header>
          <p>
            <CedarIntl
              id="tutorial.abacPt2.prePolicy.p1"
              defaultMessage={
                "In prior examples our conditions have all " +
                "been evaluated against static values. Cedar also lets you " +
                "define conditions that compare the values of different " +
                "attributes. The example policy below permits any principal " +
                "to view, edit or delete, any resource, with the condition " +
                "that the resource owner is the principal."
              }
            />
          </p>
        </>
      }
      postPolicySlot={
        <p>
          <CedarIntl
            id="tutorial.abacPt2.postPolicy.p1"
            defaultMessage={
              "Note that in this case the resource " +
              "VacationPhoto94.jpg is described in {entities} as having an " +
              'attribute of type String called Owner with a value of "alice". ' +
              "The policy compares this attribute to ID of the principal, which " +
              'is also a string with the value "alice".'
            }
            values={{
              entities: <code>entities</code>,
            }}
          />
        </p>
      }
      postCodeSlot={
        <>
          <p>
            <CedarIntl
              id="tutorial.abacPt2.postCode.p1"
              defaultMessage={
                "The authorization request in the above " +
                "example also defines values for the attribute {dept} for " +
                "both the resource and the principal. Try adding an additional " +
                "condition to the policy based on this attribute."
              }
              values={{
                dept: <code>dept</code>,
              }}
            />
          </p>
        </>
      }
    />
  );
}
