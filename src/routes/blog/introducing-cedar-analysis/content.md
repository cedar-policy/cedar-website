# Introducing Cedar Analysis: Open Source Tools for Verifying Authorization Policies

Authors: Spencer Erickson, Sr. Product Manager Technical, AWS & Liana Hadarean, Principal Applied Scientist, AWS

*June 16, 2025*

Today, we're excited to announce Cedar Analysis, a new open source toolkit for developers that makes it easier for everyone to verify the behavior of their Cedar policies. 

[Cedar](https://www.cedarpolicy.com/en) is an open source authorization system that enables developers to implement fine-grained access controls in their applications. With ~1.17 million downloads and growing adoption, Cedar is quickly gaining traction in the developer community. It's both a language for writing authorization policies and a system for evaluating those policies to make access control decisions. Rather than embedding authorization logic directly into application code, Cedar allows developers to define standalone policies that specify who can do what within their applications. Cedar has attracted contributions from notable organizations such as MongoDB and StrongDM, with these and other companies already using Cedar in production environments. This widespread adoption underscores Cedar's reliability and effectiveness in real-world scenarios. 

Authorization becomes more complex as applications scale, making it crucial to have robust tools for managing and verifying access policies. While most development teams rely on testing specific scenarios like "Can Alice view this document?" or "Can Bob edit that folder?", this approach only catches obvious issues through sample test cases. Organizations need a more comprehensive way to understand how policy changes will affect access across their entire system, especially as their applications grow and evolving security requirements demand policy updates.

Cedar was built with analysis in mind from the start, using automated reasoning techniques to understand policies and check all possible access scenarios, not just test cases. This approach helps catch unexpected changes in permissions before they make it to production.

The new Cedar Analysis toolkit provides powerful tools and automated reasoning capabilities to comprehensively analyze and validate authorization policies, ensuring they work as intended across all scenarios. 

With Cedar Analysis, you can answer questions such as:

* Are these two policies equivalent?
* Does this change to my policies grant any new, unintended permissions?
* Will this policy refactoring break any existing access patterns?
* Are any of my policies ineffective or conflicting?
* Could my newly added policy accidentally deny all access?

Whether you're refactoring a complex policy, adding new conditions, or seeking a deeper understanding of your policies, Cedar Analysis provides the tools you need to evolve your authorization policies alongside your growing application.

## What are we releasing as open source?

Today's release includes two key components:

1. **Cedar Symbolic Compiler**:  A compiler that translates Cedar policies into mathematical formulas that can be automatically analyzed. We've mathematically proven this translation is correct, ensuring that analysis results exactly match how your policies will behave in production. 
2. **Cedar Analysis CLI:** A command-line tool that demonstrates how to leverage the Cedar Symbolic Compiler for policy analysis. It implements two example analysis capabilities: comparing policy sets to understand permission changes, and analyzing individual policy sets to identify inconsistencies, redundancies, and logical errors. These implementations showcase how to build analysis tools using the symbolic encoding primitive provided by the compiler.

The CLI serves as a reference implementation to demonstrate possible analysis approaches using Cedar's symbolic encoding. While it implements useful baseline checks, it represents just a subset of potential analysis capabilities that could be built on top of the symbolic encoding primitive. We encourage developers to use the CLI for hands-on learning, exploration, and proof-of-concept work, and hope it inspires the community to build more sophisticated analysis tools tailored to their specific needs.

## What is the technology behind Cedar Analysis?

### Leveraging SMT Solvers

At its core, Cedar Analysis uses [Satisfiability Modulo Theories (SMT)](http://theory.stanford.edu/~barrett/pubs/BT18.pdf) to reason about policies. It translates your Cedar policies into mathematical formulas that capture every possible request the policy could allow. These formulas are then analyzed by specialized SMT solvers like [CVC5](https://github.com/cvc5/cvc5).

For example, consider this simple policy:

```cedar
// Allow users to view and comment on resources they own.
permit(
    principal,
    action in [Action::"view", Action::"comment"],
    resource
) when {
    principal == resource.owner
};

```

The Cedar Symbolic Compiler converts this into a [mathematical formula that precisely describes the allowed requests](https://www.cedarpolicy.com/blog/whats-analyzable). The SMT solver can then answer complex questions about the policy's behavior, such as "Could this policy ever allow someone who isn't the owner to view a resource?"

### Formal Verification with Lean

The Cedar Symbolic Compiler is implemented in [Lean](https://lean-lang.org/), which is both a functional programming language and a proof assistant. This dual nature allows us not only to implement the compiler but also to mathematically prove its correctness. As a result we can ensure two things:

1. **Soundness**:  When Cedar Analysis confirms that your policies satisfy a specific property (e.g., "no unauthorized access"), it guarantees this holds true for all possible scenarios. The underlying SMT solver constructs a mathematical proof to verify this. 
2. **Completeness**: If Cedar Analysis reports that your policies don't satisfy a property, it means there exists at least one scenario where the property is violated. The analysis provides precise results without false positives. 

These mathematical proofs provide confidence that the analysis results accurately reflect how your policies will behave in production. For researchers and academics, this formal verification aspect makes Cedar Analysis particularly valuable as a foundation for further research into authorization policy analysis.

## What are the Cedar Analysis CLI Capabilities?

#### 1) Comparing Policy Sets

The Cedar Analysis CLI helps you understand relationships between policy sets by categorizing how their permissions compare:

* **Equivalent**: Both policy sets allow exactly the same requests.
* **More Permissive**: The new policy set allows everything the old policy set did, plus more.
* **Less Permissive:** The new policy set is more restrictive than the old policy set.
* **Incomparable:** Each policy set allows some requests that the other doesn't.

####  2) Detecting Policy Conflicts and Redundancies 

The Cedar Analysis CLI can also identify common issues within a single policy set:

* **Shadowed Permits:** When one permit statement has no effect because another permit already allows all its requests
* **Impossible Conditions:** When a permit can never allow any requests due to contradictory conditions
* **Forbid Overrides:** when a permit has no effect, because a forbid denies all requests allowed by a permit
* **Complete Denials**: When a policy set denies all requests for certain action signatures

## Cedar Analysis in Action: Policy Refactoring

Let's examine a practical example of how Cedar Analysis can help you refactor policies with confidence. Imagine you have a photo-sharing application with this policy:

```cedar
permit(
    principal,
    action in [Action::"view", Action::"comment"],
    resource
) when {
    principal == resource.owner ||
    ((resource.filename like "*.png" ||
    resource.filename like "*.jpg") && !resource.private)
};
```

This policy allows users to:

* View or comment on photos they own
* View or comment on public PNG or JPEG files

As your application grows, you might want to split this into separate policies for improved readability and maintainability:

```cedar
// Allow owners to view and comment on their resources
permit(
    principal,
    action in [Action::"view", Action::"comment"],
    resource
) when {
    principal == resource.owner
};

// Allow access to image files
permit(
    principal,
    action in [Action::"view", Action::"comment"],
    resource
) when {
    resource.filename like "*.png" ||
    resource.filename like "*.jpg"
};

// Block access to private files
forbid(
    principal,
    action in [Action::"view", Action::"comment"],
    resource
) when {
    resource.private
};

```

These policies appear equivalent, but are they truly? Let's use the Cedar Analysis CLI to find out:

```shell
cedar-lean-cli analyze compare \
    refactored_policy_set.cedar \
    original_policy_set.cedar \
    photo_app.cedarschema
```

The output reveals:

| PrincipalType | ActionName | ResourceType | Result |
| ---	| ---	| ---	| ---	|
| User | view | Photo | Less Permissive |
| User | comment | Photo | Less Permissive |

Surprisingly, the new policies are more restrictive. The issue is that the forbid statement now prevents owners from accessing their own private photos, which wasn't the case in the original policy.

### Refining the Policies

We can address this by using an `unless` clause instead of a separate forbid:

```cedar
// Allow owners to view and comment on their resources
permit(
    principal,
    action in [Action::"view", Action::"comment"],
    resource
) when {
    principal == resource.owner
};

// Allow users to view and comment on public photos
permit(
    principal,
    action in [Action::"view", Action::"comment"],
    resource
) when {
    resource.filename like "*.png" ||
    resource.filename like "*.jpg"
} unless {
    resource.private
};

```

Running the comparison again:

| PrincipalType | ActionName | ResourceType | Result |
| ---	| ---	| ---	| ---	|
|User	|view	| Photo	|Equivalent	|
|User	|comment	|Photo	|Equivalent	|

Now our policies are proven equivalent.  This example illustrates how Cedar Analysis can catch subtle differences in policy behavior that might otherwise go undetected until they cause issues in production.

## Why are we releasing Cedar Analysis as open source?

An open source Cedar Symbolic Compiler provides a valuable research platform for those contributing to Cedar. Key aspects that might be of particular interest include:

1. **Formal Correctness Proofs**: The Cedar Symbolic Compiler comes with proofs of its soundness and completeness, implemented in Lean. These proofs demonstrate how formal methods can be applied to real-world authorization systems.
2. **SMT Encoding Techniques**: The translation from Cedar policies to SMT formulas involves sophisticated encoding strategies to handle Cedar's rich feature set, including hierarchical entities, pattern matching, and more.
3. **Decision Procedures**: Researchers interested in SMT solving and decision procedures can study how we encode Cedar's semantics and potentially develop more efficient or expressive techniques.
4. **Policy Language Design**: Cedar's design prioritizes analyzability. Studying the interplay between language features and analyzability can inform future policy language designs.

We look forward to seeing how the Cedar community might extend Cedar Analysis with new capabilities, optimizations, or theoretical contributions.

## Conclusion

With Cedar Analysis now available as open source, developers can independently verify their Cedar policies, ensuring they behave as intended across all possible scenarios. The compiler and CLI are open source and available on [Cedar GitHub repository](https://github.com/cedar-policy/cedar-spec) under the Apache 2.0 license. This release reflects our commitment to Cedar as an open source project and to the principle that security tools should be transparent and verifiable.

Releasing Cedar Symbolic Compiler and its formal proofs as open source allows the community to inspect, contribute to, and build upon our work. The Cedar Analysis CLI demonstrates how these tools can be used in practice to build powerful policy analysis capabilities.

Whether you're a developer looking to ensure the correctness of your authorization policies or a researcher exploring formal methods for policy analysis, Cedar Analysis provides a powerful set of tools for reasoning about authorization in a systematic way. To learn more about Cedar and try it using the language playground, visit [https://www.cedarpolicy.com/](https://www.cedarpolicy.com/en). Feel free to submit questions, comments, and suggestions via the public Cedar Slack workspace, [https://cedar-policy.slack.com](https://cedar-policy.slack.com/). 

