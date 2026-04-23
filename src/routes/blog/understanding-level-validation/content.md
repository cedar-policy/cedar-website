# Understanding Level Validation and Entity Slicing

Author: John Kastner, Sr. Applied Scientist, AWS

*July 30, 2025*

Cedar's Level Validation and Entity Slicing features (released in Cedar version 4.4) address a key challenge in efficiently using Cedar for authorization.
To make an authorization request, a user of Cedar must provide data describing the entities relevant to the request and policies, but it's not always obvious what entities are required.
Level validation helps you structure your policies in a way that makes this easy.
Level based entity slicing then takes advantage of this structure to soundly select a *slice* of entity data sufficient for a particular request.

## Why is this difficult? 

To make an authorization decision, Cedar evaluates policies against entities provided by the calling application.
These entities might include users, teams, lists, and other resources.
While Cedar handles policy evaluation, the calling application is responsible for storing its own entity data and collecting the required entity data before making an authorization request. 

The key challenge for the application is determining what entity data to provide Cedar.
Providing data for all entities will always be correct, but it becomes impractical as the application grows.
For most authorization requests and policies, only a small subset of entity data should be required to reach an authorization decision.
However, identifying this subset without accidentally excluding necessary entities is not straightforward.
Doing so incorrectly could result in incorrect authorization decisions.
Level Validation and Entity Slicing offer a solution to this problem by allowing applications to soundly select a small subset of entity data that is sufficient for evaluating a specific authorization request.

## What is Level Validation?

Level validation introduces the concept of a "level," a property of a policy set specifying the maximum depth from root entity variables (like `principal` and `resource`) at which an entity dereferencing operation may occur.
A policy set validates at a level if no policy will ever attempt to access data beyond this level.

![A level 2 Cedar expression, with subexpressions underlined to show what would be valid at level 0 and level 1](/img/expr-level-validation.png)

The level represents how many steps away from the root entities your policies can reference:

* At Level 0, policies can only perform basic operations without accessing the data for entities (attributes, data, and set of ancestor entities).
  They can compare entities for equality (e.g., `principal == User::"alice"`) and check entity types (e.g., `principal is User`).
* At Level 1, policies can include all operations allowed at level 0, plus accesses to the data for entities directly referenced in the request (principal, resource, and context entities).
* At Level 2, policies can include everything that was allowed at level 1, plus accesses to entity data for entities referenced by level 1 entities.

And so on for higher levels, with each successive level allowing access to entity data by one additional step through other entities attributes.

Entity dereferencing operations are the operation that require accessing an entity's data:

* **Entity Attribute operations**: Entity attribute access (`.`) and presence test (`has`) operations require entity data to inspect attributes.
* **Tag operations**: Tag access (`getTag`) and presence test (`hasTag`) operations require entity data to inspect tags.
* **Hierarchy membership**: The binary `in` operator needs to access the list of ancestor entities for its first operand.

All other operations are unrestricted by level validation.
For example, testing equality (e.g., `e1 == e2`) is *not* a dereferencing operation and so is always allowed.

To apply level validation to your policies, you can either call the [`Validator::validate_with_level`](https://docs.rs/cedar-policy/latest/cedar_policy/struct.Validator.html#method.validate_with_level) function in the `cedar_policy` crate or pass the `--level` flag to the `cedar validate` CLI command.
These will succeed only if your policies validate according to Cedar's regular rules *and* do not exceed the maximum number of dereferencing operations specified by the level.

## TinyTodo: A Practical Example

Let's examine a concrete example using policies from TinyTodo, a simple task list management application that has featured in prior blogposts.
Users can create Lists with tasks, and list owners can share lists with Users or Teams as readers or editors.

Here are some TinyTodo policies:

```cedar
// Policy 1: A User can perform any action on a List they own
permit (
  principal,
  action,
  resource is List
)
when { resource.owner == principal };

// Policy 2: A User can see a List if they are either a reader or editor
permit (
  principal,
  action == Action::"GetList",
  resource
)
when { principal in resource.readers || principal in resource.editors };
```

These policies are valid at level 1 because they only directly dereference the root entities.
In policy 1, `resource.owner == principal` directly dereferences `resource` to access its `owner` attribute, but the `==` comparison doesn't require additional dereferences.
In policy 2, `principal in resource.readers` directly dereferences both `principal` and `resource`.
Using `principal` with an `in` expression requires accessing its ancestor data while accessing an attribute of `resource` requires attribute data.
Even though the expression `resource.readers` appears as the second operand to an `in`, this policy is still valid at level 1 because `in` only requires entity data for the first operand.
Because these policies validate at level 1, applications only need to provide entity data for entities directly referenced in the request.

Now consider this additional policy:

```cedar
// Policy 6: No access if not high rank and at location DEF, or at resource's owner's location
forbid(
    principal,
    action,
    resource is List
) unless {
    principal.joblevel > 6 && principal.location like "DEF*" ||
    principal.location == resource.owner.location
};
```

Up to this point, TinyTodo has been enforcing that all policies must validate at level 1, and accordingly applying entity slicing at level 1, but there's a problem.
This policy doesn't validate at level 1! The expression `resource.owner.location`, dereferences the `resource` to get its `owner`, and then dereferences the owner entity to access its `location` attribute. If we tried to use level 1 entity slicing in an authorization request with this policy, the Cedar evaluator would error while trying to the owner's location, causing it to ignore this policy.
Fortunately, TinyTodo can validate policies at level 1 before making any changes to its policy set.
We would then see a level validation error when adding this policy, telling us that it requires at least level 2 access to entity data, and avoiding an error during authorization.

From here we have two choices, we can either rewrite the policy to reduce the required access level, perhaps having each resource directly store its owner's location rather than requiring an extra level of indirection, or we can increase the maximum allowed level for our policy set until level validation succeeds.
If we start allowing higher level policies we need to be careful to make the same change to the level of entity slicing applied so that we continue to select a sufficient amount of entities.

## How Entity Slicing Works

For policies validated using a specific level, level-based slicing computes a subset of entity data sufficient for a sound authorization decision.
Entity slicing starts at the root entities referenced in the request and collects entities by traversing their attributes up to the specified level, ensuring all potentially accessible entity data is included in the slice.
Accessing any entity not in the slice requires more consecutive attribute accesses than allowed at the given level.

Let's consider how entity slicing applies at different levels to a concrete authorization request made to the TinyTodo application asking whether alice can access her shopping list.
The binding for the request variables are the following.
```
principal = User::"alice"
action = Action::"GetList"
resource = List::"shopping"
context = {}
```

### Level One Slicing

To slice at level one, we start with the root entities in the authorization request `User::"alice"`, `Action::"GetList"`, and `List::"shopping"` (plus any entities in the context, but this is always empty in TinyTodo).
We then gather their entity data and return it as the entity slice for this request. In other words, at level one, we retrieve exactly the entity data for entities mentioned directly in the request, and nothing more.

Implemented as part of TinyTodo in Rust, level one slicing might look something like this.
The function as shown assumes that there is a `get_entity` function available to retrieve the data for an entity.
The exact implementation of this procedure for a particular application will depend on how entity data is stored.
In most cases this will be a database query, but TinyTodo stores all of its data in memory.

```rust
pub fn level_one_slice(
    &self,
    principal: &EntityUid,
    resource: &EntityUid,
    schema: &Schema,
) -> Result<Entities, Error> {
    let principal = self.get_entity(principal)?;
    let resource = self.get_entity(resource)?;
    Ok(Entities::from_entities([principal, resource], Some(schema)).unwrap())
}
```

This is simpler than slicing might be in some other application due to a simplify assumption based on TinyTodo's schema.
We know that no actions have context referencing any entities, so this implementation ignores the context entirely.
We also don't explicitly handle the request action.
We do need the action in the slice, but the `Entities` constructor provided by the Cedar Rust library will automatically populate the actions from the schema for us.

### Level Two Slicing

Our first two example policies from TinyTodo validated at level one.
If these were our only policies, we could stop now and confidently use an authorization decision made using only this data.
But what if we want to include the third policy which validates at level two? Now we need to examine the attribute data for the entities we collected at level one and retrieve the data for any referenced entities.

In this case, `List::"shopping"` is the only entity that references other entities. In the Cedar entity data JSON format, it looks like:

```json
  {
    "uid": { "__entity": { "type": "List", "id": "shopping" } },
    "attrs": {
      "owner": { "__entity": { "type": "User", "id": "aaron" } },
      "readers": { "__entity": { "type": "Team", "id": "temp" } },
      "editors": { "__entity": { "type": "Team", "id": "admin" } },
      "name": "Shopping List",
      "tasks": []
    },
    "parents": [
      { "__entity": { "type": "Application", "id": "TinyTodo" } }
    ]
  }
```

The `owner`, `readers`, and `editors` attributes all reference other entities.
A policy that validates at level two can contain an expression like `resource.owner.location`, so we need to gather the entity data for each of these and add it to the level one slice before making an authorization decision.
The final level two slice will contain entity data for `User::"alice"`, `Action::"GetList"`, and `List::"shopping"` from the request, plus `User::"aaron"`, `Team::"temp"`, and `Team::"admin"` collected from the attributes from `List::"shopping"`.

The level 2 slicing implementation is only slightly more complex than at level one.

```rust
pub fn level_two_slice(
    &self,
    principal: &EntityUid,
    resource: &EntityUid,
    schema: &Schema,
) -> Result<Entities, Error> {
    let mut entities = Vec::new();
    entities.push(self.get_entity(principal)?);
    for euid in self.get_referenced_uids(principal)? {
        entities.push(self.get_entity(&euid)?);
    }
    entities.push(self.get_entity(resource)?);
    for euid in self.get_referenced_uids(resource)? {
        entities.push(self.get_entity(&euid)?);
    }
    Ok(Entities::from_entities(entities, Some(schema)).unwrap())
}
```

We now need to call a new `get_referenced_uids` function to retrieve the entities referenced by the root entities.
Like the `get_entity` function before, the implementation will depend on how entity data is stored and be different for each particular application.

### Generalizing the Algorithm

So far we've shown how to apply entity slicing at two specific levels by effectively unrolling a general entity slicing algorithm.
For level one and two policies, these procedures are simple enough to be preferable to implementing the general algorithm, but if the traversal goes deeper or you want to support slicing at multiple different levels, it will be nice to a have a single function to implement all entity slicing.
This algorithm is essentially a breadth-first search bounded by the level of slicing.

Implemented in Rust, and again assuming that the specific application defines the functions `get_entity` and `get_referened_uids`, this might look like:

```rust
pub fn slice_at_level(
    &self,
    mut level: u32,
    principal: &EntityUid,
    resource: &EntityUid,
    schema: &Schema,
) -> Result<Entities, Error> {
    let mut entities = Vec::new();
    let mut work_set = vec![principal.clone(), resource.clone()];
    let mut next_work_set = Vec::new();

    while level != 0 {
        next_work_set.clear();
        for euid in &work_set {
            entities.push(self.get_entity(euid)?);
            next_work_set.extend(self.get_referenced_uids(euid)?);
        }
        std::mem::swap(&mut work_set, &mut next_work_set);
        level = level - 1;
    }

    Ok(Entities::from_entities(entities, Some(schema)).unwrap())
}
```

## Conclusion

Cedar's Level Validation and Entity Slicing feature provides an elegant solution to the challenge of efficiently determining which entity data is needed for authorization decisions.
This feature is particularly valuable for applications with large entity stores or complex entity relationships, where retrieving all entity data would be prohibitively expensive.
By validating policies against a specific level and using the corresponding slicing algorithm, applications can ensure they provide enough entity data needed for sound authorization without wasted work in gathering unneeded data.
Get started with policy level validation by using the [`Validator::validate_with_level`](https://docs.rs/cedar-policy/latest/cedar_policy/struct.Validator.html#method.validate_with_level) function in the `cedar_policy` crate or the `--level` flag to the `cedar validate` CLI command to find the level where your policies validate.

*To learn more about this feature, see [Cedar Policy Level Validation](https://docs.cedarpolicy.com/policies/level-validation.html).* 
