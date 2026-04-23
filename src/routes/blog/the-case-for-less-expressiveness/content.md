# Less is more: The case for less expressiveness in authorization languages

Author: Craig Disselkoen, Sr. Applied Scientist, AWS

*January 9, 2025*

When building any web application, you need to implement authorization logic that controls who can take what actions on your application.
You can write this logic directly in your backend code using your existing backend language, or choose to use a dedicated authorization language.
There are many factors to consider when choosing a language for your authorization logic, including the security features of the language, how easy it is to use,
its accessibility to non-experts who need to audit your permissions, and of course its performance.
But one factor that is important, and closely intertwined with all of those other factors, is *expressiveness*.

Roughly, expressiveness means the ability to express more complex computations in a language.
For example, in HTML or CSS you can’t write loops or recursive functions, making them less expressive than JavaScript, which allows you to write more sophisticated computations.
For an authorization language, expressiveness might include the ability to write many different kinds of rules,
including *role-based rules* (RBAC) (“allow employees in a particular department to ...”),
*attribute-based rules* (ABAC) (“allow users who have authenticated with MFA to ...”),
and *relation-based rules* (ReBAC) (“allow doctors who have the `PrimaryCaregiver` relationship with the patient to ...”).

At face value, expressiveness is desirable — for instance, it is important to be able to write RBAC, ABAC, and ReBAC rules (all of the examples given above).
A [recent report by Gartner on “Should I Use OPA, OAuth, Zanzibar, Cedar or XACML for My Authorization Use Cases?“](https://www.gartner.com/en/documents/5624191)
seems to take as a given that more expressiveness is a good thing.
However, from our experience operating the AWS access management system (AWS IAM) at scale for over 15 years, we have learned that **more expressiveness is not always better** — and we’ll see why in the rest of this post.
The more expressive and complex the language gets, the harder it is to satisfy other must-have requirements around security, readability, analyzability, and performance.

Emphasizing this point, consider what [TrailOfBits says in a recent report](https://github.com/trailofbits/publications/blob/master/reports/Policy_Language_Security_Comparison_and_TM.pdf) about expressiveness in the authorization language Rego:
> Rego is an expressive policy language ... The flexible nature of the language, including the existence of side-effecting operations, presents security challenges for its deployers and policy writers, particularly in the areas of predicting performance and potential for language misuse or mis-evaluation.

Let’s look at three main reasons why less is more with respect to expressiveness in authorization languages.

## Predictable, bounded running times

Authorization decisions need to be made quickly and predictably, because code for making authorization decisions runs as part of almost every request to your application.
Thus, choosing a language with predictable and bounded running times is essential.
This often means a simpler language, as more complex languages with complex interpreters or runtimes tend to have less predictable performance.
For instance, a garbage-collected language has, broadly speaking, less predictable performance than a language like Rust, because operations in a garbage-collected language may be interrupted by a garbage collector at any time.
And JIT-compiled languages have performance that depends greatly on the previous inputs that have been executed, or how long the JIT has had to warm up.

More fundamentally, running times for authorization decisions should be tightly *bounded*.
General-purpose languages like Python, JavaScript, Rust, or C are [Turing-complete](https://en.wikipedia.org/wiki/Turing_completeness) — expressive enough to write nonterminating or exponential-time computations.
Unfortunately, this means it is difficult (impossible in the general case) to establish tight bounds on how long a program in those languages can run.
While Turing-complete languages are powerful and useful, for authorization languages it is much better to be able to establish tight bounds on running times — again, authorization decisions are part of almost every application request.
Thus, we think it is best for an authorization language to not be Turing-complete.
In a loop-free non-Turing-complete language, it is impossible to write authorization checks that run forever; evaluation of an authorization decision always terminates.
This is only possible by limiting the expressiveness of the authorization language.

## Avoiding anti-patterns

Another benefit of a less-expressive authorization language is that there are fewer opportunities for anti-patterns in your application’s authorization system.
For one example, choosing an authorization language that supports floating-point arithmetic adds expressiveness, but floating-point arithmetic has pitfalls that don’t mesh well with the goals of a high-assurance authorization language.
Floating-point has some nonobvious behaviors — for instance, you might expect that `0.1 + 0.2 == 0.3` is `true`, but in most programming languages it is not.
Or for another example, in 32-bit floating point, `262144.0 + 0.01 == 262144.0`.
Floating-point is great for many purposes, but we think it’s a bad idea to have critical authorization decisions depend on the sometimes-unintuitive results of floating-point calculations like these.

## Automated reasoning and analysis

Finally, it is great to be able to analyze authorization policies using [automated reasoning](https://aws.amazon.com/what-is/automated-reasoning/)
to answer questions like “who has access to what”, describe the effect of proposed changes to policies, and prove (mathematically) that critical security properties are upheld.
This allows developers to move quickly *and* safely, with confidence that automated reasoning tools will prevent costly mistakes.
At AWS, we’ve put these ideas into production: AWS uses automated reasoning to analyze IAM policies [a billion times a day](https://www.amazon.science/blog/a-billion-smt-queries-a-day).

By carefully limiting the expressiveness of a language, we amplify the power of automated reasoning tools.
Automated reasoning about general-purpose programming languages like Python or C is possible, but prone to poor performance, imprecision, timeouts, and false positives.
Automated reasoning about languages with carefully limited expressiveness can be much more performant, powerful, and precise (i.e., producing fewer false alarms).

## How does Cedar apply these learnings?

We took the above points into account when we designed Cedar: we intentionally controlled its expressiveness in order to enhance its security, readability, analyzability, and performance.

  1. **Cedar policy evaluation is not only predictable and bounded, but always terminates in polynomially-bounded time [\[1\]](https://dl.acm.org/doi/abs/10.1145/3649835)**.

  > *Cedar is not Turing-complete — you cannot use loops, recursion, or similar features in a Cedar policy.  As a result of this and other design decisions, we can formally guarantee that evaluation of a Cedar policy always terminates; and further, evaluation of a Cedar policy completes in polynomially-bounded time.  This means you cannot write nonterminating or exponential-time policies.*

  2. **Cedar intentionally omits some features that could be hard to use correctly or could too easily lead to security weaknesses in a high-assurance authorization system.**

  > *Unlike many other languages, Cedar supports only integers and decimal numbers with fixed precision — not floating-point arithmetic, which has the pitfalls discussed above.  For more details on this, see the blog post: [Why doesn’t Cedar support floating point numbers](https://cedarland.blog/design/why-no-float/content.html). And for some other features omitted from Cedar to avoid anti-patterns, see [Why doesn’t Cedar have regexes or string formatting operators](https://cedarland.blog/design/why-no-regex/content.html) and [Why doesn’t Cedar allow wildcards in Entity Ids](https://cedarland.blog/design/why-no-entity-wildcards/content.html).*

  3. **Cedar is amenable to (automated) policy analysis using automated reasoning.**

  > *Powerful, precise automated reasoning about Cedar policies is only possible due to principled decisions that limit the expressiveness of the Cedar language to features that are amenable to these analysis techniques.  For instance, dynamically bounded loops, heterogeneous sets, and ordered lists are all features omitted from Cedar as tradeoffs to make more powerful, precise, and performant policy analysis possible.  You can read more about this, and policy analysis in general, in [a previous post on the Cedar blog](https://www.cedarpolicy.com/blog/whats-analyzable), and also in [the paper we published on Cedar at OOPSLA’24](https://dl.acm.org/doi/abs/10.1145/3649835).*

## Conclusion

Expressiveness is only a positive quality for an authorization language to a certain extent.
The more expressive and complex the language gets, the harder it is to satisfy other requirements around security, readability, analyzability, and performance.
We saw how carefully-controlled expressiveness enables Cedar to provide predictable and bounded running times; to avoid anti-patterns in policy authoring; and to support powerful automated policy analysis.
When it comes to expressiveness, less is more.
