# Working with the Datetime Extension

**Author: Adrian Palacios, Applied Scientist, AWS**

*April 25, 2025*

Time is a crucial dimension in access control. Today, we're introducing the Cedar datetime extension, which allows users to define policy rules based on date and time. This enables policies that can automatically revoke permissions after a certain date or grant access to sensitive resources only during business hours. In this post, we'll walk you through the extension and demonstrate its use with a self-contained example.

## Types and Methods

The `datetime` extension introduces two new types:

* `datetime`: represents an instant of time
* `duration`: represents a span of time

Both types support millisecond precision and have constructors matching their names. For example, `datetime("2024-04-16T10:35:00Z")` represents the instant corresponding to April 16th, 2024 at 10:35AM UTC, and `duration("2h30m")` represents a duration of two hours and thirty minutes. See the [documentation](https://docs.cedarpolicy.com/policies/syntax-datatypes.html#datatype-extension) for a complete list of valid string formats for these constructors.

The `datetime` extension also includes 9 new functions for working with these types and supports comparison operators for  `datetime` or `duration` values. While our example will demonstrate some of these functions, you can find the complete list in the [Operators and Functions](https://docs.cedarpolicy.com/policies/syntax-operators.html) documentation.

## An example using time-based rules

Let's explore an example using the `datetime` extension. We'll implement the authorization logic for a simple streaming service that has two types of users: `Subscriber`s with paid subscriptions and `FreeMember`s with free subscriptions.

The streaming service offers two tiers for paid subscriptions: `standard` and `premium`. The resources in this example are `Movie`s and `Show`s, which users can access (watch) according to these general rules:

```cedar
// Subscriber Content Access (Shows)
@id("subscriber-content-access/show")
permit (
  principal is Subscriber,
  action == Action::"watch",
  resource is Show
)
unless
{ resource.isEarlyAccess && context.now.datetime < resource.releaseDate };

// Subscriber Content Access (Movies)
@id("subscriber-content-access/movie")
permit (
  principal is Subscriber,
  action == Action::"watch",
  resource is Movie
)
unless { resource.needsRentOrBuy };

// Free Content Access
@id("free-content-access")
permit (
  principal is FreeMember,
  action == Action::"watch",
  resource
)
when { resource.isFree };
```

In summary:

* `Subscriber`s can watch any content unless it's early-access content before the release date, or offered through the Rent/Buy option [^note-independent-options].
* `FreeMember`s can watch any content as long as it's free.

To demonstrate the capabilities of the `datetime` extension, let's add three more time-based rules to our authorization logic:

* Allow premium subscribers to watch shows 24 hours earlier than the official release date.
* Allow subscribers to rent or buy Oscar-nominated movies one month before the Oscars.
* Don’t allow subscribers with a kid profile to watch anything during bedtime.

In the following sections, we'll implement these rules step-by-step using the `datetime` extension.

### Rule #1: Early access for premium subscribers

>Allow premium subscribers to watch shows 24 hours earlier than the official release date


Let's start with a rule similar to `subscriber-content-access/show`, but we'll use `when` and check `principal.subscription.tier == "premium"` to target only premium subscribers:

```cedar
permit (
  principal is Subscriber,
  action == Action::"watch",
  resource is Show
)
when
{
  resource.isEarlyAccess &&
  principal.subscription.tier == "premium" &&
  // time-based conditions will go here
};
```

For all rules in this example, we assume that our application adds a Cedar record named `now` to `context` with a `datetime` field. Thus, `context.now.datetime` will represent the current Unix timestamp according to our application (as a `datetime` value, not a `Long`).

To implement the “24 hours earlier” condition, we will use the [`offset`](https://docs.cedarpolicy.com/policies/syntax-operators.html#function-offset.title) function. This function takes a `duration` and computes the `datetime` resulting from adding it to the `datetime` it’s applied to. So the condition `context.now.datetime >= resource.releaseDate.``offset``(duration("-24h"))` checks whether the current time falls within the early access period [^note-alt-duration].

Here’s the complete rule:

```cedar
// Early Access (24h) to Shows for Premium Subscribers
@id("early-access-show")
permit (
  principal is Subscriber,
  action == Action::"watch",
  resource is Show
)
when
{
  resource.isEarlyAccess &&
  principal.subscription.tier == "premium" &&
  context.now.datetime >= resource.releaseDate.offset(duration("-24h"))
};
```

### Rule #2: Rent/Buy nominated movies a month before the Oscars

>Allow subscribers to rent or buy Oscar-nominated movies one month before the Oscars


This is our first rule involving `Action::"rent"` and `Action::"buy"`. If we assume that `Movie` includes a boolean attribute `isOscarNominated`, most of the rule is straightforward:

```cedar
permit (
  principal is Subscriber,
  action in [Action::"rent", Action::"buy"],
  resource is Movie
)
when
{
  resource.isOscarNominated &&
  // time-based conditions will go here
};
```

For the time-based conditions, using the `datetime` constructor is likely the simplest approach. In 2025, the Oscars were expected to air on March 2 at 7:00PM ET. Since we need to account for Eastern Time (UTC-05:00), we’ll represent it using the simplest format that allows timezone offsets: `2025-03-02T19:00:00-0500`.

We can construct the “one month earlier” `datetime` similarly using `2025-02-02T19:00:00-0500`[^note-alt-datetime]. Our time-based condition just needs to check that the current time falls between these two dates:

```cedar
context.now.timestamp >= datetime("2025-02-02T19:00:00-0500") &&
context.now.timestamp < datetime("2025-03-02T19:00:00-0500")
```

So the complete rule is:

```cedar
// Promo: Rent/Buy Oscar-Nominated Movies Until the Oscars
@id("rent-buy-oscar-movie")
permit (
  principal is Subscriber,
  action in [Action::"rent", Action::"buy"],
  resource is Movie
)
when
{
  resource.isOscarNominated &&
  context.now.datetime >= datetime("2025-02-02T19:00:00-0500") &&
  context.now.datetime < datetime("2025-03-02T19:00:00-0500")
};
```

### Rule #3: Forbid access during bedtime to kid profiles

>Don’t allow subscribers with a kid profile to watch anything during bedtime


The interesting aspect of this rule is calculating the local time from `context.now.datetime` (UTC time). We’ll first use the `offset` function with `context.now.localTimeOffset` (provided through the context) to convert to the subscriber’s timezone. Then, we’ll use the [`toTime`](https://docs.cedarpolicy.com/policies/syntax-operators.html#function-toTime.title) function, which extracts just the “time” component of a `datetime` as a `duration` value (modulo one day). This gives us a value we can compare against the bedtime limits.

Let’s write the complete rule directly:

```cedar
// Forbid Bedtime Access to Kid Profile
@id("forbid-bedtime-watch-kid-profile")
forbid (
  principal is Subscriber,
  action == Action::"watch",
  resource
)
when { principal.profile.isKid }
unless
{
  duration("6h") <= context.now.datetime.offset(context.now.localTimeOffset).toTime() &&
  context.now.datetime.offset(context.now.localTimeOffset).toTime() <= duration("21h")
};
```

This rule forbids access between 9PM (`21h`) and 6AM (`6h`) local time for kid profiles.

## Conclusion

In this blog post, we introduced the `datetime` extension and demonstrated its use through a streaming service example. We showed how to implement three time-based authorization rules using the `datetime` and `duration` constructors, time manipulation functions like `offset` and `toTime` , and comparison operators.

The complete example, including schemas and example requests, is available in [cedar-policy/cedar-examples](https://github.com/cedar-policy/cedar-examples/tree/release/4.3.x/cedar-example-use-cases/streaming_service). The `datetime` extension is available as an experimental feature in Cedar v4.3 and a stable feature in Cedar v4.4. For more details about the `datetime` extension, check out the [Cedar documentation](https://docs.cedarpolicy.com/) and [RFC 80](https://cedar-policy.github.io/rfcs/0080-datetime-extension.html).

[^note-independent-options]: The attributes `isEarlyAccess`, `needsRentOrBuy` and `isFree` are all independent of each other. This makes it simpler to write our policies since we only need to focus on one attribute at a time.
[^note-alt-duration]: Note that `resource.releaseDate.offset(duration("-1d"))` and `resource.releaseDate.offset(duration("-24h"))` are equivalent. We simply used the latter because it matches better with the rule description.
[^note-alt-datetime]: We could instead use `offset` in this example, but that would be more complex and error-prone.
