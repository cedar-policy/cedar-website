# Validating Cedar policies with GitHub Actions

Chris Norman, CommonFate; Sept 18th, 2024

Cedar is an open source policy language created by AWS. Cedar allows you to write authorization policies defining what each user of your application is permitted to do and what resources they may access. AWS security services including [AWS Verified Access](https://aws.amazon.com/verified-access/) and [Amazon Verified Permissions](https://aws.amazon.com/verified-permissions/) use Cedar to define policies.

At [Common Fate](http://commonfate.io), authorization within our product is secured using Cedar policies. Our customers author their own Cedar policies to define roles and permissions. The Cedar policy language is expressive enough to model complex permissions while remaining performant.

Here’s an example policy in our product allowing elevated access to an AWS account, via [AWS IAM Identity Center](https://aws.amazon.com/iam/identity-center/), to be requested.

```cedar
@advice("You can request access because you're currently on-call.")
permit (
  principal in PagerDuty::OnCall::"PDXYZ123",
  action == Access::Action::"Request",
  resource is AWS::IDC::AccountEntitlement
)
when
{
    resource.role == AWS::IDC::PermissionSet::"arn:aws:sso:::permissionSet/ssoins-12345abcdef/ps-12345abcdef" &&
    resource.target in AWS::OrgUnit::"ou-123abc" &&
    resource.target.tags.contains({key: "department", value: "engineering"})
};

```

As a developer, writing Cedar policies is similar to writing application source code. You can use source code management systems like GitHub to store your policies, and use practices like [linting](https://en.wikipedia.org/wiki/Lint_(software)) and testing to verify your policies before deploying them to a production environment.

Common Fate has developed a [Validate Cedar Policies](https://github.com/marketplace/actions/validate-cedar-policies) GitHub Action, which can be used in your GitHub-based CI/CD pipelines to validate Cedar policies before they are deployed. The GitHub Action works with any application or service that uses Cedar policies. Our customers use our GitHub Action to validate their Cedar policies before they are written to a Common Fate deployment.

In this post, we will show you how to validate Cedar policies in GitHub Actions using the Validate Cedar Policies action.

## Prerequisites

To follow along with this walkthrough, make sure to complete the following prerequisites:

- Install a [Git](https://git-scm.com/) client on your computer.
- For local testing, set up a bash-compatible environment, such as Apple macOS, [Windows Subsystem for Linux (WSL)](https://learn.microsoft.com/en-us/windows/wsl/install), or [Git Bash](https://gitforwindows.org/).
- If you’d like to validate policies locally, you’ll need to [install Rust](https://www.rust-lang.org/tools/install), then install the Cedar CLI:
    
    ```bash
    cargo install cedar-policy-cli
    ```
    

## Validating locally

Cedar has support for type definitions, similar to programming languages like [TypeScript](https://www.typescriptlang.org/). In Cedar, you use a [schema file](https://docs.cedarpolicy.com/schema/schema.html) to define the principals, actions, and resources used for authorization.

Writing a schema is straightforward, but because we want to get stuck into validation you can use one we've prepared earlier. [Create a new GitHub respository based on our Cedar template repository here](https://github.com/new?template_name=cedar-github-actions-testing-example&template_owner=common-fate). Once you've created it, clone the repository to your local machine.

The repository contains a demo policy, allowing everyone to view `Document` resources:

```cedar
permit (
    principal,
    action == Action::"View",
    resource is Document
);
```

We can validate policies locally by running `cedar validate`:

```bash
❯ cedar validate --schema test.cedarschema.json --policies demo.cedar
  ☞ policy set validation passed
  ╰─▶ no errors or warnings
```

The output of the command shows that the policy is valid. Next, we will validate the policy using GitHub Actions.

## Validating in GitHub Actions

The [Validate Cedar Policies GitHub Action](https://github.com/marketplace/actions/validate-cedar-policies) allows you to check for invalid policies as part of your Continuous Integration (CI) pipelines. Our GitHub Action adds annotations to your Pull Requests showing precisely where issues are.

![screenshot of GitHub Pull Request showing Cedar validation annotations](/img/screenshot-pr-validation-annotations.png)

You can add the action to your GitHub Actions workflows by adding a `.github/workflows/cedar.yml` file containing the following:

```yaml
name: "Test"

on: [push]

jobs:
  cedar:
    name: Cedar
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Validate Policies
        uses: common-fate/cedar-validate-action@v1
        with:
          schema-file: ./example.cedarschema.json
          policy-files: "**/*.cedar"

```

Commit the file to the repository and push your changes, by running the following commands in a terminal window:

```bash
git commit -am "Add Cedar validation GitHub Actions workflow"
git push
```

Now, create a new branch called `invalid` and update the `demo.cedar` file to contain invalid policies:

```cedar
// this policy is valid
permit (
    principal,
    action == Action::"View",
    resource is Document
);

// this policy is invalid because it contains an action that is not in the Cedar schema.
permit (
    principal,
    action == Action::"Invalid",
    resource is Document
);

// this policy is invalid because it contains a resource that is not in the Cedar schema.
permit (
    principal,
    action == Action::"View",
    resource is Invalid
);

// this policy is invalid because it contains an attribute that is not in the Cedar schema.
permit (
    principal,
    action == Action::"View",
    resource is Document
)
when { resource.foo == "bar" };
```

Commit your changes and create a Pull Request. The GitHub Actions workflow will fail, and you’ll see annotations on the *files changed* view showing where the issues are.

![Screenshot of GitHub Pull Request, showing annotations of policy validation errors](/img/screenshot-pr-validation-errors.png)

Here’s an example Pull Request showing validation annotations: https://github.com/common-fate/cedar-github-actions-testing-example/pull/1/files.

## Next steps

If you'd like to learn more about our usage of Cedar policies in Common Fate, you can read our [technical documentation on developing authorization policies with continuous integration (CI)](https://docs.commonfate.io/authz/ci). To learn more about the Cedar policy language, see the [Cedar Policy Language Reference Guide](https://docs.cedarpolicy.com/) or browse the source code at the [cedar-policy](https://github.com/cedar-policy) organization on GitHub.