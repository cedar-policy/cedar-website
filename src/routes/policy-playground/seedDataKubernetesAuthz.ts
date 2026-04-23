import type { SampleApp } from './types';
import { schema } from './k8s/schema';
import { query as query1 } from './k8s/query1';
import { query as query2 } from './k8s/query2';

// String of one or more Waterford policies written in the Cedar language
const policy = `// developers can list configmaps
permit (
    principal in k8s::Group::"developers",
    action in [k8s::Action::"list", k8s::Action::"watch"],
    resource is k8s::Resource
) when {
    resource.resource == "configmaps" &&
    resource.apiGroup == ""
};

// prevent users in self-configmaps-only from listing configmaps
// unless they specify a label selector of owner=principal.name
forbid (
    principal is k8s::User in k8s::Group::"self-configmaps-only",
    action in [k8s::Action::"list", k8s::Action::"watch"],
    resource is k8s::Resource
) when {
    resource.resource == "configmaps" &&
    resource.apiGroup == ""
} unless {
    resource has labelSelector &&
    resource.labelSelector.contains({
        "key": "owner",
        "operator": "=",
        "values": [principal.name]})
};

// A Kubernetes service account can get and update the node status only for the node it runs on
permit (
    principal is k8s::ServiceAccount,
    action in [
        k8s::Action::"get",
        k8s::Action::"update",
        k8s::Action::"patch"],
    resource is k8s::Resource
) when {
    principal.name == "csi-driver" &&
    principal.namespace == "kube-system" &&
    resource.apiGroup == "" &&
    resource.resource == "nodes" &&
    resource has subresource &&
    resource.subresource == "status" &&
    principal has extra &&
    resource has name &&
    principal.extra.contains({
        "key": "authentication.kubernetes.io/node-name",
        "values": [resource.name]})
};`;

export const kubernetesApp: SampleApp = {
    name: 'Kubernetes',
    policy: policy,
    schema: JSON.stringify(schema, null, 4),
    queries: [
        query1,
        query2,
    ],
};
