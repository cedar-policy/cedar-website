export const schema = `namespace k8s {
  type ExtraAttribute = {
    key: String,
    values: Set<String>
  };

  type FieldRequirement = {
    field: String,
    operator: String,
    value: String
  };

  type LabelRequirement = {
    key: String,
    operator: String,
    values: Set<String>
  };

  entity Extra = {
    key: String,
    values?: Set<String>
  };

  entity Group = {
    name: String
  };

  entity Node in [Group] = {
    extra?: Set<ExtraAttribute>,
    name: String
  };

  entity NonResourceURL = {
    path: String
  };

  entity PrincipalUID;

  entity Resource = {
    apiGroup: String,
    fieldSelector?: Set<FieldRequirement>,
    labelSelector?: Set<LabelRequirement>,
    name?: String,
    namespace?: String,
    resource: String,
    subresource?: String
  };

  entity ServiceAccount in [Group] = {
    extra?: Set<ExtraAttribute>,
    name: String,
    namespace: String
  };

  entity User in [Group] = {
    extra?: Set<ExtraAttribute>,
    name: String
  };

  action "approve" appliesTo {
    principal: [Group, Node, ServiceAccount, User],
    resource: [Resource],
    context: {}
  };

  action "attest" appliesTo {
    principal: [Group, Node, ServiceAccount, User],
    resource: [Resource],
    context: {}
  };

  action "bind" appliesTo {
    principal: [Group, Node, ServiceAccount, User],
    resource: [Resource],
    context: {}
  };

  action "create" appliesTo {
    principal: [Group, Node, ServiceAccount, User],
    resource: [Resource],
    context: {}
  };

  action "delete" appliesTo {
    principal: [Group, Node, ServiceAccount, User],
    resource: [NonResourceURL, Resource],
    context: {}
  };

  action "deletecollection" appliesTo {
    principal: [Group, Node, ServiceAccount, User],
    resource: [Resource],
    context: {}
  };

  action "escalate" appliesTo {
    principal: [Group, Node, ServiceAccount, User],
    resource: [Resource],
    context: {}
  };

  action "get" in [Action::"readOnly"] appliesTo {
    principal: [Group, Node, ServiceAccount, User],
    resource: [NonResourceURL, Resource],
    context: {}
  };

  action "head" appliesTo {
    principal: [Group, Node, ServiceAccount, User],
    resource: [NonResourceURL],
    context: {}
  };

  action "impersonate" appliesTo {
    principal: [Group, Node, ServiceAccount, User],
    resource: [Extra, Group, Node, PrincipalUID, ServiceAccount, User],
    context: {}
  };

  action "list" in [Action::"readOnly"] appliesTo {
    principal: [Group, Node, ServiceAccount, User],
    resource: [Resource],
    context: {}
  };

  action "options" appliesTo {
    principal: [Group, Node, ServiceAccount, User],
    resource: [NonResourceURL],
    context: {}
  };

  action "patch" appliesTo {
    principal: [Group, Node, ServiceAccount, User],
    resource: [NonResourceURL, Resource],
    context: {}
  };

  action "post" appliesTo {
    principal: [Group, Node, ServiceAccount, User],
    resource: [NonResourceURL],
    context: {}
  };

  action "put" appliesTo {
    principal: [Group, Node, ServiceAccount, User],
    resource: [NonResourceURL],
    context: {}
  };

  action "readOnly" appliesTo {
    principal: [Group, Node, ServiceAccount, User],
    resource: [Resource],
    context: {}
  };

  action "sign" appliesTo {
    principal: [Group, Node, ServiceAccount, User],
    resource: [Resource],
    context: {}
  };

  action "update" appliesTo {
    principal: [Group, Node, ServiceAccount, User],
    resource: [Resource],
    context: {}
  };

  action "use" appliesTo {
    principal: [Group, Node, ServiceAccount, User],
    resource: [Resource],
    context: {}
  };

  action "watch" appliesTo {
    principal: [Group, Node, ServiceAccount, User],
    resource: [Resource],
    context: {}
  };
}`;
