# Secure your application APIs in 5 minutes with Cedar

Today, the open source [Cedar](https://www.cedarpolicy.com/) project announced the release of [authorization-for-expressjs](https://github.com/cedar-policy/authorization-for-expressjs/), an open source package that simplifies using the Cedar policy language and authorization engine to verify application permissions. This release allows developers to add policy-based authorization to their Express web framework APIs within minutes, and without any remote service calls.

[Express](http://expressjs.com/) is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. This standardized integration with Cedar requires 90% less code compared to developers writing their own integration patterns, saving developers time and effort and improving application security posture by reducing the amount of custom integration code. 

For example, if you are building a pet store application using the Express framework, using the authorization-for-expressjs feature you can create authorization policies so that only store employees can access the API to add a pet. This standardized implementation for Express authorization middleware replaces the need for custom code and automatically maps client requests into their principals, actions, and resources components, and then into Cedar authorization requests. 

## Why Externalize Authorization with Cedar?**

Traditionally, developers implemented authorization within their application by embedding authorization logic directly into application code. This embedded authorization logic is designed to support a few permissions, but as applications evolve, there is often a need to support more complex use cases with additional authorization requirements. Developers incrementally update the embedded authorization logic to support these complex use cases, resulting in code that is complex and difficult to maintain. As code complexity increases, further evolving the security model and performing audits of permissions becomes more challenging, resulting in an application that continuously becomes more difficult to maintain over its lifecycle. 

Cedar allows you to decouple authorization logic from your application. Externalizing authorization from your application code yields multiple benefits including freeing up development teams to focus on application logic and simplifying application and resource access audits. Cedar is an [open source language and software development kit (SDK)](https://github.com/cedar-policy/) for writing and enforcing authorization policies for your applications. You specify fine-grained permissions as Cedar policies, and your application authorizes access requests by calling the Cedar SDK. For example, you can use the Cedar policy below to permit `employee` users to call the `POST /pets` API in a sample PetStore application. 

```
permit (
    principal,
    action in [Action::"POST /pets"], 
    resource
) when {
    principal.jobLevel = "employee"
};
```

One potential challenge in adopting Cedar can be the upfront effort required to define Cedar policies and update your application code to call the Cedar SDK to authorize API requests. This blog post shows how web application developers using the Express framework can easily implement API-level authorization with Cedar—adding just tens of lines of code in your applications, instead of hundreds.

This step-by-step guide uses the sample PetStore application to show how access to APIs can be restricted based on user groups. You can find the sample Pet Store application in the [cedar-policy repository on GitHub](https://github.com/cedar-policy/authorization-for-expressjs/tree/main/examples).

## Pet Store application API overview

The PetStore application is used to manage a pet store. The pet store is built using Express on Node.js and exposes the API’s here:

1. **GET /pets -** returns a page of available pets in the PetStore.
2. **POST /pets -** adds the specified pet to the PetStore. 
3. **GET /pets/{petId} -** returns the specified pet found in the PetStore. 
4. **POST /pets/{petId}/sale -** marks a pet as sold.


This application does not allow all users to access all APIs. Instead, it enforces the following rules:

Both customer users and employees are allowed to perform read operations.
 
``` 
GET /pets
GET /pets/{petId}
```

Only employees are allowed to perform write operations.

```
POST /pets
POST /pets/{petId}/sale
```

## Implementing authorization for the Pet Store APIs

Let's walk through how to secure your application APIs using Cedar using the new package for Express. The initial application, with no authorization, can be found in the `start` folder; use this to follow along with the blog. You can find the completed application, with authorization added, in the `finish` folder. 

### Add the Cedar Authorization Middleware package


The Cedar Authorization Middleware package will be used to generate a Cedar schema, create sample authorization policies, and perform the authorization in your application. 

Run this `npm` command to add the `@cedar-policy/authorization-for-expressjs` dependency to your application.

```
npm i --save @cedar-policy/authorization-for-expressjs
```

### Generate a Cedar Schema from your APIs

A Cedar schema defines the authorization model for an application, including the entities types in the application and the actions users are allowed to take. Your policies are validated against this schema when you run the application. 

The `authorization-for-expressjs` package can analyze the [OpenAPI specification](https://swagger.io/specification/) of your application and generate a Cedar schema. Specifically the `paths` object is required in the your specification. 


>If you do not have an OpenAPI spec you can generate one using the tool of your choice. There are a number of open source libraries to do this for Express; you may need to add some code to your application, generate the OpenAPI spec, and then remove the code. Alternatively, some generative AI based tools such as the [Amazon Q Developer](https://aws.amazon.com/q/developer/) CLI are effective at generating OpenAPI spec documents. Regardless of how you generate the spec, be sure to validate the correct output from the tool. 


For the sample application, an OpenAPI spec document named `openapi.json` has been included.

With an OpenAPI spec you can generate a Cedar schema by running the `generateSchema` command listed here. 

```
// schema is stored in v4.cedarschema.json file in the package root. 

npx @cedar-policy/authorization-for-expressjs generate-schema --api-spec openapi.json --namespace PetStoreApp --mapping-type SimpleRest
```

### Define authorization policies

If no policies are configured, Cedar denies all authorization requests. The next step is to create policies that will allow specific user groups access to specific resources. 

Run this command to generate sample Cedar policies. You can then customize these policies based on your use case. 

```
npx @cedar-policy/authorization-for-expressjs generate-policies --schema v4.cedarschema.json
```

In the PetStore application two sample policies are generated, `policy_1.cedar` and `policy_2.cedar`.

`policy_1.cedar` provides permissions for users in the `admin` user group to perform any action on any resource.

```
// policy_1.cedar
// Allows admin usergroup access to everything
permit (
    principal in PetStoreApp::UserGroup::"admin",
    action,
    resource
);
```

`policy_2.cedar` provides access to all the individual actions defined in the Cedar schema with a place holder for a specific group. 

```
// policy_2.cedar
// Allows more granular user group control, change actions as needed
permit (
    principal in PetStoreApp::UserGroup::"ENTER_THE_USER_GROUP_HERE",
    action in
        [PetStoreApp::Action::"GET /pets",
         PetStoreApp::Action::"POST /pets",
         PetStoreApp::Action::"GET /pets/{petId}",
         PetStoreApp::Action::"POST /pets/{petId}/sale"],
    resource
);
```

>Note that if you specified an `operationId` in the OpenAPI specification, the action names defined in the Cedar Schema will use that `operationId` instead of the default `<HTTP Method> /<PATH>` format. In this case ensure the naming of your Actions in your Cedar Policies matches the naming of your Actions in your Cedar Schema.
For example if you wish to call your action `AddPet` instead of `POST /pets` you could set the `operationId` in your OpenAPI specification to `AddPet`. The resulting action in the Cedar policy would be `PetStoreApp::Action::"AddPet"`

Since you don’t have an `admin` user in this use case, you can just replace the contents of `policy_1.cedar` with the policy needed for the `customer` user group. 

In a real use case, consider renaming your Cedar policy files based on their contents, for example, `allow_customer_group.cedar`

```
// policy_1.cedar
// Allows customer user group to access getAllPets and getPetById
permit (
    principal in PetStoreApp::UserGroup::"customer",
    action in
        [PetStoreApp::Action::"GET /pets",
         PetStoreApp::Action::"GET /pets/{petId}"],
    resource
);

```

The `employee` user has access to all API operations. You can add the `employee` group in the `policy_2.cedar` file to fulfill the authorization requirements for `employee` users.

```
// policy_2.cedar
// Allows employee user group access to all API actions
permit (
    principal in PetStoreApp::UserGroup::"employee",
    action in
        [PetStoreApp::Action::"GET /pets",
         PetStoreApp::Action::"POST /pets",
         PetStoreApp::Action::"GET /pets/{petId}",
         PetStoreApp::Action::"POST /pets/{petId}/sale"],
    resource
);
```

>For large applications with complex authorization policies, it can be challenging to analyze and audit the actual permissions provided by the many different policies. We also recently open sourced the [Cedar Analysis CLI](https://github.com/cedar-policy/cedar-spec) to help developers perform policy analysis on their policies. You can find out more about this new tool in the blog post [Introducing Cedar Analysis: Open Source Tools for Verifying Authorization Policies](https://aws.amazon.com/blogs/opensource/introducing-cedar-analysis-open-source-tools-for-verifying-authorization-policies) 

### Update the application code to call Cedar and to authorize API access

The application will use the Cedar middleware to authorize every request against the Cedar polices. Earlier you installed the dependency, now you need to update the code.

First add the package to the project and define the `CedarInlineAuthorizationEngine` and `ExpressAuthorizationMiddleware`. This block of code can be added to the top of the `app.js` file.

```
const { ExpressAuthorizationMiddleware, CedarInlineAuthorizationEngine } = require ('@cedar-policy/authorization-for-expressjs');


const policies = [
    fs.readFileSync(path.join(__dirname, 'policies', 'policy_1.cedar'), 'utf8'),
    fs.readFileSync(path.join(__dirname, 'policies', 'policy_2.cedar'), 'utf8')
];



const cedarAuthorizationEngine = new CedarInlineAuthorizationEngine({
    staticPolicies: policies.join('\n'),
    schema: {
        type: 'jsonString',
        schema: fs.readFileSync(path.join(__dirname, 'v4.cedarschema.json'), 'utf8'),
    }
});


const expressAuthorization = new ExpressAuthorizationMiddleware({
    schema: {
        type: 'jsonString',
        schema: fs.readFileSync(path.join(__dirname, 'v4.cedarschema.json'), 'utf8'),
    },
    authorizationEngine: cedarAuthorizationEngine,
    principalConfiguration: {
        type: 'custom',
        getPrincipalEntity: principalEntityFetcher
    },
    skippedEndpoints: [
        {httpVerb: 'get', path: '/login'},
        {httpVerb: 'get', path: '/api-spec/v3'},
    ],
    logger: {
        debug: s => console.log(s),
        log: s => console.log(s),
    }
});

```


Next add the Express Authorization middleware to the application 

```
const app = express();

app.use(express.json());
app.use(verifyToken())   // validate user token
// ... other pre-authz middlewares

app.use(expressAuthorization.middleware);

// ... other pre-authz middlewares
```

### Add application code to configure the user 

The Cedar authorizer requires user groups and attributes to authorize requests. The authorization middleware relies on the function passed to `getPrincipalEntity` in the initial configuration to generate the principal entity. You need to implement this function to generate the user entity.

This example code provides a function to generate a user entity. It assumes that the user has been authenticated by a previous middleware and the relevant information stored in the request object. It also assumes user sub has been stored in `req.user.sub` field and user groups have been stored in `req.user.groups` field.


```
async function principalEntityFetcher(req) {
       
       const user = req.user; // it's common practice for the authn middleware to store the user info from the decoded token here`
       const userGroups = user["groups"].map(userGroupId => ({
           type: 'PetStoreApp::UserGroup',
           id: userGroupId       
       }));
       return {
            uid: {
                type: 'PetStoreApp::User',
                id: user.sub
            },
            attrs: {
                ...user,
            },
            parents: userGroups 
        };
} 
```



## Update the authentication middleware

For the sample PetStore application, the authentication middleware is provided by the code in `middleware/authnMiddleware.js` which parses a JSON web token (JWT) included in the Authorization header of the request and stores the relevant values in the request object. 


>Note that authnMiddleware.js is just used for demonstrative purposes and should not replace your actual token validation middleware in a real application.


To update the authentication middleware to use your own OpenID Connect (OIDC) identity provider, update the `jwksUri` in the following code block of `middleware/authnMiddleware.js` to include the JSON web key set (JWKS) uri of your identity provider.

```
const client = jwksClient({
  jwksUri: '<jwks uri for your oidc identity provider>',
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 600000 // 10 minutes
}); 
```

Next update the `issuer` in the following code block to include the issuer uri of your identity provider.

```
  jwt.verify(token, getSigningKey, {
    algorithms: ['RS256'],
    issuer: `<issuer uri for your oidc identity provider>`
  }, (err, decoded) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Add the decoded token to the request object
    req.user = decoded;
    next();
  });
```


If you do not have access to an OIDC identity provider to use with this sample, for testing purposes you can replace the entire `verifyToken` function and just map a sample user entity to the request object. For example replace `verifyToken` with this:

```
const verifyToken = (req, res, next) => {

    // Add a sample user entity to the request object
    // To test an employee group change "customer" to "employee"
    req.user = {
        "sub": "some-user-id",
        "groups": "customer"
    };

};
```

## Validating API security

You can validate your policies and API access by calling the application using terminal-based `curl` commands. We assume that the application is using an OIDC identity provider for user management and JWT tokens are passed in the authorization header for API requests. 

For readability, a set of environment variables are used to represent the actual values. `TOKEN_CUSTOMER` contains valid identity tokens for users in the employee group. `API_BASE_URL` is the base URL for the tiny PetStore API.

To test that a customer is allowed to call `GET /pets`, run this `curl` command. The request should complete successfully.

```
curl -H "Authorization: Bearer ${TOKEN_CUSTOMER}" -X GET ${API_BASE_URL}/pets
```

The successful request will return the list of pets. To begin with, the Pet Store has one pet and returns a response similar to this.

```
[{"id":"6da5d01b-89fd-49b9-acb2-b457b79669d5","name":"Fido","species":"Dog","breed":null,"age":null,"sold":false}]
```

To test that a customer is not allowed to call `POST /pets`,  run this `curl` command. You should receive an error message that the request is unauthorized. 

```
curl -H "Authorization: Bearer ${TOKEN_CUSTOMER}" -X POST ${API_BASE_URL}/pets
```

The unauthorized request will return `Not authorized with explicit deny`

### Conclusion

The new  [authorization-for-expressjs](https://github.com/cedar-policy/authorization-for-expressjs/) package allows developers to integrate their applications with Cedar in order to decouple authorization logic from code in just a few minutes. By decoupling your authorization logic and integrating your application with Cedar, you can both improve developer productivity, and simplify permissions and access audits. 

The frameworks packages are open source and available on GitHub under the Apache 2.0 license, with distribution through NPM. To learn more about Cedar and try it using the language playground, visit [https://www.cedarpolicy.com/](https://www.cedarpolicy.com/en). Feel free to submit questions, comments, and suggestions via the public Cedar Slack workspace, [https://cedar-policy.slack.com](https://cedar-policy.slack.com/). 
