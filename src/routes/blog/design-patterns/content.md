# Cedar design patterns

Authors: Julian Lovelock & Abhishek Panday (AWS)

Date: Sept 17th, 2024

RBAC, ReBAC, ABAC and PBAC are commonly used terms when describing different permissions models. 

RBAC stands for Role Based Access Control (RBAC). Permissions are based on role assignments. ABAC is Attribute Based Access Control (ABAC); these are permissions are based on attribute values of the user and/or the resources. ReBAC references Relationship Based Access Control, where permissions are based on a relationship between the user and the resource. And finally PBAC is Policy Based Access Control, where permissions are expressed as policies.

The distinction seems clear until you think too hard about it, and are left wondering whether a Role might in fact be a Relationship, stored in an Attribute and referenced in a Policy. As Product Managers, we saw this confusion play out many times. Almost all of the customers we talk with describe their authorization model as being based on roles.  And yet, there are wide differences in the authorization rules they are trying to implement.  Customers are not wrong - they never are - but these terms mean different things to different people. After 18 months and over 100 customer conversations, we’ve identified three permissions models that are applicable 90% of the time. They are (1) Membership based permissions, (2) Relationship based permissions, and (3) Discretionary permissions.

**Membership permissions** are derived from the user’s (aka principal’s) membership of one or more groups. Access is granted by making a user a member of a group. This pattern is commonly used to implement Role Based Access Control (RBAC), where the role is represented as a group. It can also be used to grant permissions to a team or department. Group membership is stored and managed independently of the policies, for example in an Identity Provider. Management of group membership often happens without reference to particular sets of resources. For example, an employee is assigned the role of compliance officer, thereby enabling her to sign off all audits.

**Relationship permissions** are derived from a relationship between the principal and a resource. This pattern maps directly to ReBAC. Relationships are stored and managed independently of the policies, for example in the application database. Cedar policies describe the actions that a principal is permitted to take on a resource, based on the relationship type. Relationship permissions are often more fine-grained than membership permissions, because they are defined at the level of individual resources. For example, suppose an employee is made the owner of a document summarizing the findings of an audit. This is modeled as the employee having an ‘owner relationship’ with this document. A Cedar policy might state that this relation permits the employee to edit this audit document (but not any other audit document).

**Discretionary permissions** are granted on an ad hoc basis, at the discretion of an administrator, developer, or other authority. A discretionary policy is always scoped to a specific principal. Whereas a membership permission says “you are a member of this group/role and therefore you can do these things”, and a relationship permission says “you have this relationship with this resource and therefore you can do these things with this resource”, a discretionary permission simply says “you can do these things” because someone with authority created this policy. This pattern stores fine grained permissions as individual policies attached to specific principals.

Each of these policy design patterns can use ABAC conditions to further constrain access based on attributes of the principal or the resource.

Within the Cedar documentation we elaborate on each of these patterns and provide sample policies demonstrating how to implement them in Cedar. To keep reading visit <https://docs.cedarpolicy.com/overview/patterns.html#discretionary>
