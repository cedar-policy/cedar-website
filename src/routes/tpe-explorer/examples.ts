// Sample schemas and policies for the TPE explorer.

export interface TpeExample {
    id: string;
    label: string;
    schema: string;
    policies: string;
}

export const TPE_EXAMPLES: TpeExample[] = [
    {
        id: 'photoapp',
        label: 'PhotoApp: groups, departments, and MFA',
        schema: `namespace PhotoApp {
  entity UserGroup;
  entity Album;

  entity User in [UserGroup] {
    meta: {
      dept: String,
      tier?: Long,
    },
    name: String,
    nickname?: String,
  } tags String;

  entity Photo in [Album] {
    owner_dept: String,
    private: Bool,
  };

  action view appliesTo {
    principal: User,
    resource: Photo,
    context: {
      authn_method: String,
      ip?: String,
    },
  };
}
`,
        policies: `@id("admin_override")
permit (
  principal in PhotoApp::UserGroup::"admins",
  action == PhotoApp::Action::"view",
  resource
);

@id("allow same dept")
permit (principal, action == PhotoApp::Action::"view", resource)
when { principal.meta.dept == resource.owner_dept };

@id("private requires mfa")
forbid (principal, action == PhotoApp::Action::"view", resource)
when { resource.private && !(context.authn_method == "mfa") };
`,
    },
    {
        id: 'docs',
        label: 'Docs: owners, tags, optional records, and IP ranges',
        schema: `namespace Docs {
  entity Team;
  entity User in [Team] {
    level: Long,
    profile?: {
      country: String,
      verified?: Bool,
    },
  } tags String;

  entity Folder in [Folder];
  entity Document in [Folder] {
    owner: User,
    labels: Set<String>,
    title: String,
  };

  action read, edit appliesTo {
    principal: User,
    resource: Document,
    context: {
      ip: ipaddr,
      mfa?: Bool,
    },
  };
}
`,
        policies: `@id("owner can do anything")
permit (principal, action, resource)
when { resource.owner == principal };

@id("team folder")
permit (principal in Docs::Team::"eng", action == Docs::Action::"read", resource in Docs::Folder::"eng-shared");

@id("senior verified editors")
permit (principal, action == Docs::Action::"edit", resource)
when { principal.level >= 5 && principal has profile && principal.profile has verified && principal.profile.verified }
unless { resource.labels.contains("locked") };

@id("drafts by title")
permit (principal, action == Docs::Action::"read", resource)
when { resource.title like "draft-*" && principal.hasTag("reviewer") && principal.getTag("reviewer") == "yes" };

@id("corp network only")
forbid (principal, action, resource)
unless { context.ip.isInRange(ip("10.0.0.0/8")) || (context has mfa && context.mfa) };
`,
    },
];
