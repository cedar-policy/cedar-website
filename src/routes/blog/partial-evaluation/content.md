# A Quick Guide To Partial Evaluation 

If you'd like to chat further about any of the features described in this post, join us in the [Cedar Slack channel](https://cloud-native.slack.com/archives/C0AQXC9M4G1).

## Enabling partial evaluation

Partial evaluation is released as an “experimental” feature. This means two things

1. We don’t have a formal model or proof of correctness 
2. We expect the API to change somewhat as customers experiment with the feature. (This means we welcome feedback!) Specifically this means we will not respect semver for APIs under the `partial-eval` feature flag.

To enable partial evaluation, let’s start a new cargo project with the following `Cargo.toml`

```toml
[package]
name = "pe_example"
version = "0.1.0"
edition = "2021"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[dependencies]
cedar-policy = { features = ["partial-eval"], version = "3.2" }
itertools = "0.13.0" # Not strictly needed, but nice to work with
```

This enables the `partial-eval` experimental feature.

## Using partial evaluation

Partial evaluation exposes one key new function on the `Authorizer` struct: `is_authorized_partial`. ([docs](https://docs.rs/cedar-policy/latest/cedar_policy/struct.Authorizer.html#method.is_authorized_partial)) This takes the same arguments as `is_authorized`, but has a different return type. Where `is_authorized` is guaranteed to always return either `Allow` or `Deny`, `is_authorized_partial` can return `Allow`, `Deny`, or a “residual”: the set of policies it was unable to evaluate.

## A quick demo

Let’s create a quick demo application that reads a policy set and context off of disk and attempts to authorize:

```rust
use cedar_policy::{PolicySet, Authorizer, Request, Context, Entities};
use std::io::prelude::*;

fn main() {

    let policies_src = std::fs::read_to_string("./policies.cedar").unwrap();
    let policies : PolicySet = policies_src.parse().unwrap();

    let f = std::fs::File::open("./context.json").unwrap();
    let context = Context::from_json_file(f, None).unwrap();

    let auth = Authorizer::new();
    let r = Request::new(Some(r#"User::"Alice""#.parse().unwrap()), 
                         Some(r#"Action::"View""#.parse().unwrap()),
                         Some(r#"Box::"A""#.parse().unwrap()), 
                         context,
                         None).unwrap();
    let answer = auth.is_authorized(&r, &policies, &Entities::empty());
    println!("{:?}", answer);
}
```

Let’s try it with a simple `policies.cedar` :

```cedar
permit(principal,action,resource);
```

and the empty context in `context.json`:

```json
{}
```

Running it, we see:

```shell
aeline@88665a58d3ad example % cargo r
   Compiling example v0.1.0 (/Users/aeline/src/example)
    Finished dev [unoptimized + debuginfo] target(s) in 0.54s
     Running `target/debug/example`
Response { decision: Allow, 
           diagnostics: Diagnostics { reason: {PolicyId(PolicyID("policy0"))}, 
           errors: {} } }
```

We get `Allow`, as expected, since the policy should match anything. Let’s try now by changing the line with `is_authorized` to use `is_authorized_partial` :

```rust
    let answer = auth.is_authorized_partial(&r, &policies, &Entities::empty());
```

Running it:

```shell
aeline@88665a58d3ad example % cargo r
   Compiling example v0.1.0 (/Users/aeline/src/example)
    Finished dev [unoptimized + debuginfo] target(s) in 0.56s
     Running `target/debug/example`
PartialResponse(PartialResponse { satisfied_permits: {PolicyID("policy0"): Annotations({})}, false_permits: {}, residual_permits: {}, satisfied_forbids: {}, false_forbids: {}, residual_forbids: {}, errors: [], true_expr: Expr { expr_kind: Lit(Bool(true)), source_loc: None, data: () }, false_expr: Expr { expr_kind: Lit(Bool(false)), source_loc: None, data: () } })
```

Now we get a pretty different answer, we get back this `PartialResponse`
thing. This is a structure that tracks lots of information about how
partial evaluation was able to proceed given (potentially) incomplete information.
The simplest thing we can do is ask it "with the information you were
given, could you arrive at an authorization decision?". We can ask that
with the following snippet:
```rust
println!("Decision: {:?}", answer.decision());
```
Running this now:
```shell
    Finished dev [unoptimized + debuginfo] target(s) in 0.74s
     Running `target/debug/pe-testing`
PartialResponse(PartialResponse { satisfied_permits: {PolicyID("policy0"): Annotations({})}, false_permits: {}, residual_permits: {}, satisfied_forbids: {}, false_forbids: {}, residual_forbids: {}, errors: [], true_expr: Expr { expr_kind: Lit(Bool(true)), source_loc: None, data: () }, false_expr: Expr { expr_kind: Lit(Bool(false)), source_loc: None, data: () } })
Decision: Some(Allow)
```
We see that it outputs `Some(Allow)` as the decision, meaning that it
was indeed able to reach a decision, and that decision is `Allow`. This
is expected, we gave the partial evaluator complete information, so it
should reach the same answer as the regular evaluator.



### Our First Residual

Let’s try a new `policies.cedar`:

```cedar
forbid(principal, action, resource) unless {
    context.secure
};

permit(principal == User::"Alice", action, resource) when {
    context.location == "Baltimore"
};
```

and `context.json` :

```json
{
    "secure" : true,
    "location" : { "__extn" : {
        "fn" : "unknown",
        "arg" : "location"
    }}
}
```

This is our first example of giving the partial evaluator incomplete
information.
Here, we set the value of the `location` field to a call to the `extension` function `unknown`. 
`unknown` values are “holes” that the partial evaluator cannot further reduce, and ultimately can lead to evaluation not producing a concrete answer.

Let’s try evaluating our request with these new inputs:

```shell
aeline@88665a58d3ad example % cargo r
    Finished dev [unoptimized + debuginfo] target(s) in 0.14s
     Running `target/debug/pe-testing`
PartialResponse(PartialResponse .... 
Decision: None
```

Our `PartialResponse` structure got a lot more complex, but ignoring that
for a second, we can see that the Decision is now `None`, meaning that
the partial evaluator was not able to reach a decision.


The debug printer displays loads of unnecessary information in a hard to read format. 
Let's extract out the info we want:

First:

```rust
let satisfied_ids = answer
    .definitely_satisfied() // Extract every policy that evaluated to true
    .map(|policy| policy.id().to_string())
    .join(",");
println!("Satisfied set: {{ {satisfied_ids} }}");
```
This will give us the list of every policy id that evaluated to `true`.


Secondly:

```rust
println!("Residuals:");
for residual in answer.non_trivial_residuals() {
    println!("{residual}");
}
```

This will print out every policy that didn't evaluate to either `true`
or `false` (ie: the ones that got stuck because there was not enough
information).

Re-running with this new printer gives us: 

```shell
    Finished dev [unoptimized + debuginfo] target(s) in 0.38s
     Running `target/debug/pe-testing`
Decision: None
Satisfied set: {  }
Residuals:
permit(
  principal,
  action,
  resource
) when {
  true && (unknown("location") == "Baltimore")
};
```

We can see that we only get one residual, and no policies were
satisfied. That means that the `forbid` policy must've evaluated to
`false`, which is because `context.secure` was fully known.
The permit policy is stuck as a residual, as `context.location` was
unknown.

If we change our `context.json` to set `context.secure` to be `false`, and re-run, we get:

```shell
    Finished dev [unoptimized + debuginfo] target(s) in 0.31s
     Running `target/debug/pe-testing`
Decision: Some(Deny)
Satisfied set: { policy0 }
Residuals:
permit(
  principal,
  action,
  resource
) when {
  true && (unknown("location") == "Baltimore")
};
```

Now our decision is `Some(Deny)` and the forbid policy is part of the
satisfied set. Even though there is a residual (`context.location` is
still unknown), a single `forbid` policy being satisfied is enough to
know what the final decision will be. It doesn't matter what
`context.location` is, for any substitution, the authorization decision
will always be false.

## A simple application

Let’s use a simple document application as a demo for how one could use Partial Evaluation in a real application.
In this application there will be two kinds of entities: `User`s and `Document`s. Every document has two attributes: `isPublic` and `owner`. There are two actions: `View` and `Delete`. Requests pass a `context` with two values: the request’s source IP address, `src_ip`, and whether or not the request was authenticated with multiple factors, `mfa_authed`. Here are our policies for this application:

```cedar
// Users can access public documents
permit (
    principal,
    action == DocCloud::Action::"View",
    resource
) when { 
    resource.isPublic
};

// Users can access owned documents if they are mfa-authenticated
permit (
    principal,
    action == DocCloud::Action::"View",
    resource
) when {
    context.mfa_authed && 
    resource.owner == principal 
};

// Users can only delete documents they own, and they both come from the company network and are mfa-authenticated
permit (
    principal,
    action == DocCloud::Action::"Delete",
    resource
) when {
    context.src_ip.isInRange(ip("1.1.1.0/24")) &&
    context.mfa_authed &&
    resource.owner == principal
};
```

### What can Alice access?

Concrete evaluation works for answering the question “Can Alice access Document ABC?”. But it doesn’t work well for answering the question “What documents can Alice access?”. Partial evaluation can help us answer this question by extracting the residual policies around an unknown `resource` that would evaluate to `Allow`, ignoring/folding away constraints that don’t matter or are common to all resources.

We’ll change our simple `main` to the following:

```rust
fn main() {
    let policies_src = std::fs::read_to_string("./policies.cedar").unwrap();
    let policies: PolicySet = policies_src.parse().unwrap();

    let f = std::fs::File::open("./context.json").unwrap();
    let context = Context::from_json_file(f, None).unwrap();

    let auth = Authorizer::new();

    let r = RequestBuilder::default()
        .principal(Some(r#"DocCloud::User::"Alice""#.parse().unwrap()))
        .action(Some(r#"DocCloud::Action::"View""#.parse().unwrap()))
        .context(context)
        .build();

    let answer = auth.is_authorized_partial(&r, &policies, &Entities::empty());

    match answer.decision() {
        Some(d) => println!("{:?}", d),
        None => {
            println!("Residuals:");
            for residual in answer.nontrivial_residuals() {
                println!("{residual}");
            }
        }
    }
}
```

This is mostly the same as last time, but with one important difference: We have dropped `.resource()` from our `RequestBuilder`. This sets `resource` to be an `unknown` value.

Running this with the following `context.json`:

```json
{
        "mfa_authed" : true,
        "src_ip" : { "__extn" : {
          "fn" : "ip",
          "arg" : "1.1.1.0/24"
        }
}
```

Yields:

```shell
dev-dsk-aeline-1d-f2264f25 % cargo r
    Finished dev [unoptimized + debuginfo] target(s) in 0.08s
     Running `target/debug/pe_example`
Residuals:

permit(
  principal,
  action,
  resource
) when {
  true && (true && ((unknown(resource)["owner"]) == DocCloud::User::"Alice"))
};


permit(
  principal,
  action,
  resource
) when {
  true && (unknown(resource)["isPublic"])
};
```

Here are some interesting things about this residual set:

1. The policy governing `Delete` is gone. It evaluates to `false` and so is dropped from the residual.
2. The constraint that `action` must equal `View` is gone from the two remaining policies, since it is always `true` for this request.
3. The constraint on `context.mfa_authed` is also gone since it is also `true`, always.

Let’s try a few more scenarios. First we’ll change our `context.json` to: 

```json
{
        "mfa_authed" : false,
        "src_ip" : { "__extn" : {
          "fn" : "ip",
          "arg" : "1.1.1.0/24"
        }
}
```

Re-running:

```shell
dev-dsk-aeline-1d-f2264f25 % cargo r
    Finished dev [unoptimized + debuginfo] target(s) in 0.08s
     Running `target/debug/pe_example`
Residuals:
permit(
  principal,
  action,
  resource
) when {
  true && (unknown(resource)["isPublic"])
};
```

Now we only get the one residual policy. No matter who owns a document, principals without MFA can view only public documents.

Let’s now try changing our `Action` in the request (defined in `main.rs`) to `DocCloud::Action::"Delete"`:

```shell
dev-dsk-aeline-1d-f2264f25 % cargo r
    Finished dev [unoptimized + debuginfo] target(s) in 0.08s
     Running `target/debug/pe_example`
Response { decision: Deny, diagnostics: Diagnostics { reason: {}, errors: [] } }
```

Now we simply get `Deny`! Even with the `resource` fully unknown, there is no way for any rule involving `Delete` to ever evaluate to true given our `context` .

### What to do with the residuals?

What now?
Our original goal was to answer the question:
Which resources does Alice have access to?
We have shown the simplified policies that would grant access to Alice, but we are not all the way there.
The residual policies are essentially constraints that represent Alice’s set of viewable documents.
Any documents that meets those constraints, i.e., ones in which replacing `unknown(resource)` with the document entity ID causes a residual policy to evaluate to true, are included in the set.
What you would like to do is use these constraints to efficiently fetch the list of viewable documents.
Since Cedar does not have any way of knowing how your specific application stores data, it can’t do this on its own.

Fortunately, the Cedar language is pretty small, so it’s easy to convert it into another language that can be used to do that. Let’s imagine that for this sample application, our document metadata is stored in a relational database. We could translate our remaining Cedar residual into a SQL query we can submit to the database. If our metadata is in a table called `documents`, with the columns `id`, `is_public`, and `owner` , then we can translate our first residual into the following query:

```sql
SELECT id FROM documents WHERE 
(true AND true AND owner == 'DocCloud::User::"Alice"') 
|| 
(true AND is_public);
```

And our second residual would become:

```sql
SELECT id FROM documents WHERE (true AND is_public);
```

These queries could then be submitted to a database in order to retrieve the set of documents that Alice is authorized to access. Importantly, partial evaluation has already evaluated all of the authorization info that the database is unable to answer, such as whether or not the request was authenticated with MFA.

## Caveats

One missing feature of partial evaluation is being able to make a guarantee to the partial evaluator that an unknown will be filled with a value of a certain type. This why the residuals above contain items like `true && unknown(resource)["isPublic"]` . The partial evaluator can’t guarantee that `resource.isPublic` is always a boolean, so it has to leave the `&&` un-evaluated to preserve the error behavior if `isPublic` is a non-boolean. It would be ideal if `true && unknown` would partially evaluate to `unknown`. Expressions could be more aggressively constant-folded down to values if more type information was known. This remains an area for future work.
