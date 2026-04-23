import type { SampleAuthorizationQuery } from "../types";
import type { CedarEntity } from "../../../cedar-utils";

const entities: CedarEntity[] = [
  {
    uid: {
      type: "k8s::Resource",
      id: "/api/v1/namespaces/default/configmaps",
    },
    parents: [],
    attrs: {
      apiGroup: "",
      resource: "configmaps",
      labelSelector: [
        {
          key: "owner",
          operator: "=",
          values: ["engineer-erin"],
        },
      ],
    },
  },
  {
    uid: {
      type: "k8s::Group",
      id: "system:authenticated",
    },
    parents: [],
    attrs: {
      name: "system:authenticated",
    },
  },
  {
    uid: {
      type: "k8s::Group",
      id: "self-configmaps-only",
    },
    parents: [],
    attrs: {
      name: "self-configmaps-only",
    },
  },
  {
    uid: {
      type: "k8s::Group",
      id: "developers",
    },
    parents: [],
    attrs: {
      name: "developers",
    },
  },
  {
    uid: {
      type: "k8s::User",
      id: "engineer-erin-d74cea23a74f",
    },
    parents: [
      {
        type: "k8s::Group",
        id: "developers",
      },
      {
        type: "k8s::Group",
        id: "self-configmaps-only",
      },
      {
        type: "k8s::Group",
        id: "system:authenticated",
      },
    ],
    attrs: {
      extra: [
        {
          key: "user-uid",
          values: ["engineer-erin-d74cea23a74f"],
        },
      ],
      name: "engineer-erin",
    },
  },
];

export const query: SampleAuthorizationQuery = {
  queryTitle: "Access example with label-based selection",
  principal: { type: "k8s::User", id: "engineer-erin-d74cea23a74f" },
  action: { type: "k8s::Action", id: "list" },
  resource: {
    type: "k8s::Resource",
    id: "/api/v1/namespaces/default/configmaps",
  },
  context: JSON.stringify({}),
  entities: JSON.stringify(entities, null, 4),
};
