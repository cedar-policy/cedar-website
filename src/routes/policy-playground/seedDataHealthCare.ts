import type { CedarEntity } from "../../cedar-utils";
import type { SampleApp } from "./types";

export const context: string = JSON.stringify(
  {
    referrer: {
      __entity: {
        type: "HealthCareApp::User",
        id: "DrSeuz",
      },
    },
  },
  null,
  2,
);

// String of one or more Waterford policies written in the Cedar language
const policy = `// Users can edit their own info, admins can edit anyone's info
permit (
    principal,
    action,
    resource in HealthCareApp::InfoType::"accountinfo"
)
when {
    resource.patient == principal ||
    principal in HealthCareApp::Role::"admin"
};

//A patient may create an appointment for themselves, or an administrator can do it
permit (
    principal,
    action == HealthCareApp::Action::"createAppointment",
    resource
)
when {
    (context.referrer in HealthCareApp::Role::"doctor"  && resource.patient == principal) ||
    principal in HealthCareApp::Role::"admin"
};
`;

const schema = {
  HealthCareApp: {
    entityTypes: {
      User: {
        shape: {
          type: "Record",
          attributes: {},
        },
        memberOfTypes: ["Role"],
      },
      Role: {
        shape: {
          type: "Record",
          attributes: {},
        },
        memberOfTypes: [],
      },
      Info: {
        shape: {
          type: "Record",
          attributes: {
            provider: {
              type: "Entity",
              name: "User",
            },
            patient: {
              type: "Entity",
              name: "User",
            },
          },
        },
        memberOfTypes: ["InfoType"],
      },
      InfoType: {
        shape: {
          type: "Record",
          attributes: {},
        },
        memberOfTypes: [],
      },
    },
    actions: {
      createAppointment: {
        appliesTo: {
          principalTypes: ["User"],
          resourceTypes: ["Info"],
          context: {
            type: "Record",
            attributes: {
              referrer: {
                type: "Entity",
                name: "User",
              },
            },
          },
        },
      },
      updateAppointment: {
        appliesTo: {
          principalTypes: ["User"],
          resourceTypes: ["Info"],
          context: {
            type: "Record",
            attributes: {},
          },
        },
      },
      deleteAppointment: {
        appliesTo: {
          principalTypes: ["User"],
          resourceTypes: ["Info"],
          context: {
            type: "Record",
            attributes: {},
          },
        },
      },
      listAppointments: {
        appliesTo: {
          principalTypes: ["User"],
          resourceTypes: ["Info"],
          context: {
            type: "Record",
            attributes: {},
          },
        },
      },
    },
  },
};

const query1Entities: CedarEntity[] = [
  {
    uid: {
      type: "HealthCareApp::User",
      id: "Victor",
    },
    attrs: {},
    parents: [
      {
        type: "HealthCareApp::Role",
        id: "admin",
      },
    ],
  },
  {
    uid: {
      type: "HealthCareApp::Info",
      id: "apointment003",
    },
    attrs: {
      provider: {
        __entity: {
          type: "HealthCareApp::User",
          id: "DrSeuz",
        },
      },
      patient: {
        __entity: {
          type: "HealthCareApp::User",
          id: "Victor",
        },
      },
    },
    parents: [
      {
        type: "HealthCareApp::InfoType",
        id: "appointment",
      },
    ],
  },
  {
    uid: {
      type: "HealthCareApp::InfoType",
      id: "appointment",
    },
    attrs: {},
    parents: [],
  },
  {
    uid: {
      type: "HealthCareApp::Role",
      id: "admin",
    },
    attrs: {},
    parents: [],
  },
];

const query2Entities: CedarEntity[] = [
  {
    uid: {
      type: "HealthCareApp::User",
      id: "Sarah",
    },
    attrs: {},
    parents: [],
  },
  {
    uid: {
      type: "HealthCareApp::User",
      id: "DrSeuz",
    },
    attrs: {},
    parents: [
      {
        type: "HealthCareApp::Role",
        id: "doctor",
      },
    ],
  },
  {
    uid: {
      type: "HealthCareApp::Role",
      id: "doctor",
    },
    attrs: {},
    parents: [],
  },
  {
    uid: {
      type: "HealthCareApp::Info",
      id: "appointment7865",
    },
    attrs: {
      patient: {
        __entity: {
          id: "Sarah",
          type: "HealthCareApp::User",
        },
      },
      provider: {
        __entity: {
          id: "DrSeuz",
          type: "HealthCareApp::User",
        },
      },
    },
    parents: [],
  },
];

export const healthCareSampleApp: SampleApp = {
  name: "HealthCare",
  policy,
  schema: JSON.stringify(schema, null, 4),
  queries: [
    {
      queryTitle: "Access example based on admin role",
      principal: { type: "HealthCareApp::User", id: "Victor" },
      action: { type: "HealthCareApp::Action", id: "createAppointment" },
      resource: { type: "HealthCareApp::Info", id: "apointment003" },
      context: context,
      entities: JSON.stringify(query1Entities, null, 4),
    },
    {
      queryTitle: "Access example based on referral",
      principal: { type: "HealthCareApp::User", id: "Sarah" },
      action: { type: "HealthCareApp::Action", id: "createAppointment" },
      resource: { type: "HealthCareApp::Info", id: "appointment7865" },
      context: context,
      entities: JSON.stringify(query2Entities, null, 4),
    },
  ],
};
