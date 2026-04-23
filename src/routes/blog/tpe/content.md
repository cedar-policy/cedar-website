# Type-Aware Partial Evaluation of Cedar Policies

**Author: Shaobo He, Applied Scientist, AWS**

*November 03, 2025*
  
Cedar [4.6.0](https://crates.io/crates/cedar-policy/4.6.0) brings a new capability called [Type-Aware Partial Evaluation](https://github.com/cedar-policy/rfcs/blob/main/text/0095-type-aware-partial-evaluation.md) (TPE). TPE simplifies Cedar policies by incorporating known information about authorization inputs upfront. When you need to run many authorization checks that share common elements, like checking different permissions for the same user, TPE speeds up processing. Instead of evaluating the full policy set each time, it creates streamlined "residual policies" that  incorporate the known information. This optimization is particularly useful in scenarios like determining all resources a specific user can access, or all principals who can access a specific resource.

## Why Type-Aware Partial Evaluation?

Given a policy set, users submit authorization requests to see if a specific principal can act on a specific resource, e.g., if user `Alice` can view document `123`. Cedar evaluates these requests against the policy set and an entity store to determine whether to allow or deny access. Users often need to answer broader authorization questions, like listing all the documents that Alice can view.  We call this set of extended authorization questions permission queries.

A general algorithm to answer permission queries is via filtering. That is, we iterate over all possible entities of certain type and find those that lead to an allow decision. TPE serves as a significant optimization to this algorithm: it produces simpler result-preserving policies and thus speeds up the iteration. Let’s use the following example to better illustrate the idea.

```cedar
// Users can view public documents.
permit (
  principal,
  action == Action::"View",
  resource
) when {
  resource.isPublic
};

// Users can view owned documents if they are mfa-authenticated.
permit (
  principal,
  action == Action::"View",
  resource
) when {
  context.hasMFA &&
  resource.owner == principal
};

// Users can delete owned documents if they are mfa-authenticated
// and on the company network.
permit (
  principal,
  action == Action::"Delete",
  resource
) when {
  context.hasMFA &&
  resource.owner == principal &&
  context.srcIP.isInRange(ip("1.1.1.0/24"))
};
```

```cedar
entity User;

entity Document  = {
  "isPublic": Bool,
  "owner": User
};

action View appliesTo {
  principal: [User],
  resource: [Document],
  context: {
    // User's MFA authentication status
    "hasMFA": Bool,
  }
};

action Delete appliesTo {
  principal: [User],
  resource: [Document],
  context: {
    // User's MFA authentication status
    "hasMFA": Bool,
    // User's IP
    "srcIP": ipaddr
  }
};
```

Let’s say we want to find out what documents Alice can view. That is, we want to list all possible entities of type `Document` that along with `User::"Alice"` and `Action::"View"` satisfy at least one of the permit policies. Note that the third policy is never satisfied because the action constraint is never met. Besides, if Alice passed MFA, the `hasMFA` field in all request contexts should be true, meaning that we don’t need to evaluate the `and`  operation in the second policy since its left-hand side is always true.

TPE leverages concrete information in the partial request (principal: `User::Alice`, action: `Action::"View"`, and context: `{"hasMFA": true}` ) and partially evaluate the policy set into the following much simpler residual policies.

```cedar
permit (principal, action, resource)
when {
  resource.isPublic
};

permit (principal, action, resource)
when {
  resource.owner == User::"Alice"
};
```

This means the iterative algorithm runs much faster since we now have two policies, each of which contains fewer expressions compared to its original counterpart.

I will next introduce components of TPE and how you can run it using the Rust SDK.

## Using TPE

### Required Inputs

TPE requires three validated components:

* Static policies
* Partial requests
* Partial entities

Cedar users are already familiar with policy validation, which ensures adherence to the schema and prevents type errors during evaluation. Here, we focus on construction of partial requests and partial entities using the example schema and policies above:

#### Partial Requests

Partial requests extend regular requests by allowing certain components to be unknown or unspecified. A partial request must include:

* A fully-specified action
* Both a principal and a resource, where each:

    * Must specify an entity type
    * May optionally specify an entity ID
* An optional context

When either the principal or resource lacks an entity ID, it is considered "unknown" in the request. Similarly, the context can be either specified or left unknown. Cedar enforces validation when constructing a partial request, which includes checks like if principal and resource types are consistent with the action specification in the schema.

A partial request for the example permission query above contains concrete principal and action, and unknown resource entity ID. Here's how we can use the Rust SDK to construct such a partial request:

```rust
let request = PartialRequest::new(
    // Principal is fully specified and has value User::"Alice"
    PartialEntityUid::new("User".parse().unwrap(), Some(EntityId::new("Alice"))),
    // Action must be fully specified and has value Action::"View"
    r#"Action::"View""#.parse().unwrap(),
    // Resource is unknown
    PartialEntityUid::new("Document".parse().unwrap(), None),
    // Context is fully specified and has value {"hasMFA": true}
    Some(Context::from_pairs([("hasMFA".into(), RestrictedExpression::new_bool(true))]).unwrap()),
    // The schema used for validation
    &schema,
).expect("request should validate");
```

#### Partial Entities

Partial entities resemble regular entities but allow unknown ancestors, attributes, or tags. Similar to TPE’s partial request context, these components must also be fully specified or left unknown. The Rust SDK currently only allows construction of partial entities from JSON values, with missing fields (`parents`, `attributes`, or `tags`) representing unknown values. In other words, you need to explicitly express empty values for these fields when they are not unknown.

Here is an example to use the Rust SDK to construct partial entities containing a single partial entity `User::"Alice"`  from JSON. The partial entity has empty attributes, empty direct ancestors, and unknown tags.

```rust
let entities = PartialEntities::from_json_value(serde_json::json!(
    [
        {
         "uid": { "type": "User", "id": "Alice" },
         // Known empty attribute record
         "attrs": { },
         // Known empty parent list
         "parents": [ ],
         // Tags are unknown
        }
    ]),
    // The schema used for validation
    &schema).expect("partial entities should be valid");
```

Note: Entities with unknown ancestors cannot themselves have descendants, as this would complicate or prevent transitive closure computation required for evaluating `in` expressions efficiently. The construction of partial entities performs this check as well as regular checks such as if the fields in partial entities are consistent with the schema.

### Partial evaluation

TPE on a partial request, partial entities, and a set of static policies produces a partial response, which may contain an authorization decision when e.g., a forbid policy is satisfied by the partial inputs. You can also get residual policies from a partial response, which are policies with unconstrained scopes. TPE cannot obtain a concrete authorization decision for the example above because none of the permit policies are satisfied.

```rust
let response = policies.tpe(
    &request,
    &entities,
    &schema).expect("TPE should succeed");
assert!(response.decision().is_none());

for p in response.residual_policies() {
    println!("{p}");
}
```

We will add TPE to the CLI in Cedar 4.8.0. You can use it like the following to inspect the residual policies.

```shell
cedar tpe \
--principal-type User \
--principal-eid Alice \
--action 'Action::"View"' \
--resource-type Document \
--policies sample-data/tpe_rfc/policies.cedar \
--schema sample-data/tpe_rfc/schema.cedarschema \
--entities sample-data/tpe_rfc/entities.json
```

### Reauthorization

Residual policies allow efficient reauthorization once unknowns become concrete, significantly reducing computation costs compared to the original policies. Reauthorizing residual policies requires validated requests and entities that are consistent with the partial requests and partial entities used by TPE to produce the residuals. The Rust SDK method `TpeResponse::reauthorize` implements reauthorization.

## Applications

### Permission Queries

TPE primarily serves to answer permission queries like what resources can a principal perform an action on. The Rust SDK currently provides two APIs to perform permission queries over an in-memory entity store:

* `PolicySet::query_resource` : Determine what resources a principal can perform an action on
* `PolicySet::query_principal` : Determine what principals can perform an action on a particular resource

### Translation to SQL

Residual policies can be translated into database queries to identify entities that allow authorization. Suppose that there is a relational DB table called `Documents` that stores documents and has columns `isPublic` and `owner`. We can visit the conditions of the residual policies above and translate them into the following SQL query.

```sql
SELECT id FROM Documents
WHERE isPublic = true OR owner = '53f202eb-90e8-4c0f-a6f3-05a0d88f4502'
```

Note: While the Rust SDK currently lacks policy AST traversal APIs, you can either:

* Convert residual policies to the JSON format and traverse the JSON values
*  Use the `cedar-policy-core` package for direct AST access, though it doesn't follow [semantic versioning](https://semver.org/)

## Conclusion

Cedar Type-Aware Partial Evaluation efficiently answers permission queries like determining which resources a principal can access. It leverages type-safety guarantees from the validator to aggressively yet safely propagate known authorization input information, producing high-quality residual policies that enable efficient reauthorization. You can also convert residual policies to SQL queries for answering permission queries if you store entity data in a relational database.

TPE APIs are available in Cedar Rust SDK version 4.6 under the experimental feature flag `tpe` and in the CLI as of version 4.8 under the same flag. We encourage you to try it and share your feedback.
