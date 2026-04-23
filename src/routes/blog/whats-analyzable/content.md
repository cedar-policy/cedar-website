# What's Analyzable?

Author: Andrew M. Wells, Applied Scientist, AWS

*November 13, 2024*

A core tenet of Cedar is that the language should be *analyzable*.
This concept is fundamental to understanding Cedar's value proposition.
When we talk about analyzing a program, we're referring to the ability to answer specific questions about its behavior without actually running it.
For example, we might want to determine whether the program:

```c
int count_chars(char *s, char c) {
  int count = 0;
  int idx = 0;
  while (s[idx] != '\0') {
    if (s[idx] == c) { count++; }
    idx++;
  }
  return count;
}
```

accesses uninitialized memory addresses, or whether it gives the correct result when `c = '\0'`.
It is important to distinguish between analyzing a program and executing it.
When you execute a program, you typically follow a single, deterministic path through its statements.
This path is determined by the specific inputs and conditions at runtime.
Analysis, on the other hand, requires a much broader perspective.
It involves reasoning about all possible executions of the program, considering potentially infinite variable assignments and execution paths.

Saying that a language is *analyzable* is saying that we can analyze all programs written in that language.
Church and Turing showed that for any sufficiently expressive language (this includes the vast majority of programming languages) analyzing some programs is impossible.
So making Cedar analyzable requires us to add clever restrictions.

Analyzability, in the context of Cedar, implies that a computer algorithm can answer specific questions about Cedar policies such as:
"Are two policy sets equivalent?",
"Does this change strictly reduce permissions?",
and "Can any policy allow temporary employees to access this folder?"
The goal is for the computer algorithm to answer these questions automatically, creating a powerful tool for ensuring correctly written policies.
This balance between expressiveness and analyzability is at the heart of Cedar's design philosophy, enabling powerful automated reasoning about policies and permissions.

What do the questions above have in common that lets a computer answer them automatically?
Before we answer that, let's look at a concrete example of how we can analyze a toy language based on Cedar.
Hopefully this will give some intuition of the sorts of language features and questions a computer can analyze.

### Analyzing CedarLite

Analyzing programs is not a new problem.
People write general tools to analyze programs, and these tools have standardized input language called [SMT-LIB](https://smt-lib.org/papers/smt-lib-reference-v2.6-r2017-07-18.pdf).
We implement analysis by reducing Cedar policies to SMT-LIB.
To get an idea of how this works, let's look at a simplified language loosely based on Cedar.
We'll call this CedarLite.

In CedarLite, policies are all `permit` policies.
Principals are always `User`s with the shape `{name: String, level: int}` and resources are all `File`s with the shape `{owner_name: String, is_secret: Bool}`.
The only action is `Action::"access"`.
Unlike Cedar, CedarLite has no sets, no `in` operator and no entities (Principal and Resource are records).

Suppose we have the policy `Policy0 = permit(principal, action, resource) when {principal.level > 5 && !resource.is_secret};`.
We are considering adding the policy `Policy1 = permit(principal, action, resource) when {principal.level > 7};` and we want to check that `Policy1` adds *new* permissions to the policy set (because CedarLite doesn't have `forbid` policies, new policies cannot reduce permissions).
To check if this is true, we'll need to translate the semantics of our CedarLite policies to SMT-LIB.

First, a brief introduction to SMT-LIB, the input language for SMT solvers.
We use SMT-LIB to write logical formulas.
The solver then checks if these logical formulas have a *model*---a binding from variables to values that makes the formula true. SMT-LIB is written using s-expressions.
S-expressions look like `(function arg1 arg2 ...)` and are read as "apply `function` to `arg1`, `arg2`, ...". For example to write `(2+1)` as an s-expression, we write: `(+ 2 1)`.

So to capture the semantics of `Policy0` in SMT-LIB, we’ll do the following.

First, we declare variables with the appropriate types, corresponding to the attributes for principal and resource (for technical reasons, free variables are called "symbolic constants" in SMT-LIB):

```
(declare-const principalName String)
(declare-const principalLevel Int)
(declare-const resourceOwnerName String)
(declare-const resourceIsSecret Bool)
```

(As an aside, you can see why Cedar analysis requires a schema.
SMT-LIB needs to know the shape of the data.)

Next, we write functions that capture the semantics of each policy.
For `Policy0` we write:

```
(define-fun Policy0Holds () Bool
 (and (> principalLevel 5) (not resourceIsSecret)))
```

For `Policy1` we write:

```
(define-fun Policy1Holds () Bool
 (> principalLevel 7))
```

Now to see if adding `Policy1` makes our policy set more permissive, we want to see if there are any models where P1 holds and P0 does not hold.
In other words, we want to see if there is a model that satisfies `P1 && !P0`:

```
(assert (and Policy1Holds (not Policy0Holds)))
```

Putting this all together, we have

```
(set-logic ALL)
(declare-const principalName String)
(declare-const principalLevel Int)
(declare-const resourceOwnerName String)
(declare-const resourceIsSecret Bool)
(define-fun Policy0Holds () Bool
 (and (> principalLevel 5) (not resourceIsSecret)))
(define-fun Policy1Holds () Bool
 (> principalLevel 7))
(assert (and Policy1Holds (not Policy0Holds)))
(check-sat)
(get-model)
```

You can run this at: <https://cvc5.github.io/app/#temp_de49555e-2c2b-41c5-9fdc-fa8cbb6120ac> (note if you play with new examples, to use `(get-model)` you'll need to add the `produce-models` argument).

This outputs:

```
sat
(
(define-fun principalName () String "")
(define-fun principalLevel () Int 8)
(define-fun resourceOwnerName () String "")
(define-fun resourceIsSecret () Bool true)
)
```

The first line is telling us that `(check-sat)` returns `sat`.
This tells us that there is at least one input where `Policy1` holds and `Policy0` does not.
So `Policy1` is adding new permissions.

The remaining lines are from `(get-model)`.
They give us an example.
(Note, if `(check-sat)` returns `unsat`, no example exists so `(get-model)` obviously wouldn't work.)

This is telling us that `Principal = {name: "", level: 8}, Resource = {owner_name: "", is_secret: true}` is a concrete input where `Policy1` will permit, but `Policy0` will not.

The SMT-LIB language has things like Ints, Bools, Strings, if-expressions, Boolean operators and Arithmetic operators.
It does not have things like loops.
In many cases, it's obvious how Cedar language constructs map to SMT-LIB (and this is by design).

### So what's analyzable?

With that example out of the way, we can answer our original question.
In order to remain analyzable, Cedar language features must be reducible to SMT-LIB.
Additionally, this reduction must not require quantifiers, because even though some theories in SMT-LIB are decidable with quantifiers (e.g., Presburger arithmetic), Cedar already requires rich enough theories that adding quantifiers will make analysis impossible.
So a concrete example of a language feature we cannot add to Cedar while maintaining analyzability would be generalized versions of the `any?` and `all?` operators (RFC 21), which requires quantifiers.

## Impact on Cedar

Earlier we said that we want Cedar to be analyzable.
This lets us answer questions about Cedar policies, which in turn allows us to build tools that ensure policies are written correctly.
You now have some understanding of what being analyzable means in theory.
In practice, even if a theory is decidable, a decision procedure needs to be implemented and it needs to be implemented in combination with the other theories Cedar uses.
This effectively means Cedar is limited to features that can be compiled to SMT-LIB.
(This isn’t quite accurate.
Cedar uses unstandardized features, specifically the theory of finite sets in CVC5.)
Being able to encode Cedar policies as SMT formulae lets us use SMT solvers to answer questions about Cedar policies, taking advantage of decades of work improving SMT solvers to answer these questions efficiently.

In particular, Cedar uses the theories of Equality and Uninterpreted Functions, Strings, Bitvectors, Algebraic Data Types and finite sets.
Any new language features that can be expressed in these theories—without requiring quantifiers—will be decidable.
And new language features that require a new theory that can be combined with these theories (again without quantifiers) are also allowed, provided an SMT solver implements a decision procedure for that theory and the ones currently needed.

## Conclusion

The concept of analyzability in Cedar, while fundamental to its design, isn't always as clear-cut as one might expect.
Even the Cedar maintainers occasionally find themselves grappling with the nuanced distinction between analyzable and non-analyzable features.
This complexity underscores the challenging nature of language design, particularly when aiming for both expressiveness and analyzability.
At its core, however, the principle guiding Cedar's analyzability is fairly straightforward.
The key lies in restricting Cedar to language features that can be expressed within a decidable fragment of SMT-LIB.
By ensuring analyzability, Cedar opens the door to powerful error prevention mechanisms.
These analyses act as a safety net, catching potential issues before they can manifest in real-world scenarios.
For Cedar users, this translates into a invaluable sense of confidence.
When making changes to their policies, users can rest assured that the modifications they're implementing are precisely the ones they intended.

As we continue to explore and develop Cedar, this principle of analyzability will remain a guiding light.
It challenges us to think creatively about language design, always seeking that sweet spot between expressiveness and verifiability.
And while the exact boundaries may sometimes be blurry, the goal remains clear:
to provide users with a powerful, reliable tool for policy management, backed by the assurance that comes from robust, automated analysis.
