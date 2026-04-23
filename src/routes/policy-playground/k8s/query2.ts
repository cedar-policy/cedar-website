import type { SampleAuthorizationQuery } from "../types";
import type { CedarEntity } from "../../../cedar-utils";

const entities: CedarEntity[] = [
  {
    uid: {
      type: "k8s::Group",
      id: "system:serviceaccounts",
    },
    parents: [],
    attrs: {
      name: "system:serviceaccounts",
    },
  },
  {
    uid: {
      type: "k8s::Group",
      id: "system:serviceaccounts:kube-system",
    },
    parents: [],
    attrs: {
      name: "system:serviceaccounts:kube-system",
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
      type: "k8s::Resource",
      id: "/api/v1/nodes/kind-control-plane/status",
    },
    parents: [],
    attrs: {
      apiGroup: "",
      name: "kind-control-plane",
      resource: "nodes",
      subresource: "status",
    },
  },
  {
    uid: {
      type: "k8s::ServiceAccount",
      id: "aa40b197-fd08-49a4-8898-f0d983c534a8",
    },
    parents: [
      {
        type: "k8s::Group",
        id: "system:serviceaccounts",
      },
      {
        type: "k8s::Group",
        id: "system:serviceaccounts:kube-system",
      },
      {
        type: "k8s::Group",
        id: "system:authenticated",
      },
    ],
    attrs: {
      extra: [
        {
          key: "authentication.kubernetes.io/pod-uid",
          values: ["40649764-5b5f-4d0f-b0da-7e2d32254950"],
        },
        {
          key: "authentication.kubernetes.io/credential-id",
          values: ["JTI=f6be2bf8-64bd-471a-bb5d-7f5832441290"],
        },
        {
          key: "authentication.kubernetes.io/node-uid",
          values: ["98a06a89-c3cf-4f19-8f5a-2e441381cb48"],
        },
        {
          key: "authentication.kubernetes.io/pod-name",
          values: ["csi-driver-57c5987fd4-rkgkw"],
        },
        {
          key: "authentication.kubernetes.io/node-name",
          values: ["kind-control-plane"],
        },
      ],
      name: "csi-driver",
      namespace: "kube-system",
    },
  },
];

export const query: SampleAuthorizationQuery = {
  queryTitle: "Access example csi-driver modifying its own node's status",
  principal: {
    type: "k8s::ServiceAccount",
    id: "aa40b197-fd08-49a4-8898-f0d983c534a8",
  },
  action: { type: "k8s::Action", id: "update" },
  resource: {
    type: "k8s::Resource",
    id: "/api/v1/nodes/kind-control-plane/status",
  },
  context: JSON.stringify({}),
  entities: JSON.stringify(entities, null, 4),
};
