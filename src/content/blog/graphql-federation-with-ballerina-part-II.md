---
title: "GraphQL Federation with Ballerina and Apollo - Part II"
tags: ["Tech", "Ballerina", "GraphQL"]
description: "This is the part two of the article series on GraphQL federation with Ballerina and Apollo. In this article we discuss how to implement Entity types and ReferenceResolvers in Ballerina."
author: 'Thisaru'
pubDate: 2023-10-03
image: "/images/blog/graphql-federation-with-ballerina-part-I/graphql-federation.webp"
imageAltText: "GraphQL Federation with Ballerina and Apollo"
---

> This article was written using Ballerina Swan Lake Update 8 (2201.8.0)

This is part II of the series "GraphQL Federation with Ballerina and Apollo". Refer to [Part I](/2023/10/02/graphql-federation-with-ballerina-part-I.html) before reading this.

In the first part, we discussed the GraphQL federation concepts and how to implement federated GraphQL API using Ballerina and Apollo Studio. In this part, we will discuss how to implement `Entity` types and `ReferenceResolvers` in Ballerina. Further, we will briefly discuss how to handle authentication and authorization in a federated GraphQL API.

## Adding Federated Fields

We have intentionally left some fields from the subgraph implementations. This is to simplify the supergraph creation process. Now that we have a working supergraph, we can add the missing fields. The beauty of the GraphQL federation is that it reduces the duplication of types. As per our initial GraphQL API, there are types with fields spread across the subgraphs. To add these fields, you need to implement the subgraphs with federation-specific functionalities.

> **Note:** In GraphQL federation, you can compose individual, isolated subgraphs into a federated GraphQL schema, as we have done so far. Currently, all our subgraphs are standalone GraphQL services. But to add federation-specific functionalities, we need to mark them specifically as subgraphs.

### Updating Subgraphs to Federated Subgraphs

The `ballerina/graphql.subgraph` module consists of the functionalities for GraphQL federation. To use these functionalities, you need to import the `ballerina/graphql.subgraph` module. Then you can mark your GraphQL service as a subgraph using the subgraph:Subgraph annotation.

#### Marking the Products Subgraph as a Federated Subgraph

You need to do the following things:

* Mark the Products subgraph as a federated subgraph
* Mark the Product type as an Entity type
* Provide a ReferenceResolver for the Product type

First, to mark the Products subgraph as a federated subgraph, you need to add the `@subgraph:Subgraph` annotation to the GraphQL service.
Following is the updated GraphQL service code in the Products subgraph.

```ballerina
import ballerina/graphql;
import ballerina/graphql.subgraph;

@subgraph:Subgraph
service graphql:Service on new graphql:Listener(9091) {
    // ...
}
```

Basically, what you need to do is to import the `ballerina/graphql.subgraph` module and add the `@subgraph:Subgraph` annotation to your existing GraphQL service.

Now that the product subgraph is marked as a subgraph, we can mark our Product type as an `Entity` type.

To mark the `Product` type as an entity, you need to update the `Product` type as an `Entity` type and add a `ReferenceResolver` for the `Product` type. Following is the updated Product type definition:

```ballerina
import product_subgraph.datasource;

import ballerina/graphql;
import ballerina/graphql.subgraph;

@subgraph:Entity {
  key: "id",
  resolveReference: resolveProduct
}
public type Product record {|
  // same as before
}

isolated function resolveProduct(subgraph:Representation representation) returns Product|error {
  string id = check representation["id"].ensureType();
  return datasource:getProduct(id);
}
```

Using this, we state that the `Product` type is an `Entity` in the federated supergraph, which is to say that this type might have fields included from the other subgraphs. For an `Entity`, there should be a `key` to uniquely identify a particular value of that entity type. For the router to identify these specific values, you need to provide which field acts as the key for this entity type. In this case, the `id` field is used as the `key`. The rest of the type definition remains the same.

Then you have to define a `ReferenceResolver` for the `Product` type. This is a requirement in the GraphQL federation specification, which states that if a particular subgraph contributes at least a single unique field must implement a reference resolver for that type. A reference resolver takes exactly one input, the `subgraph:Representation` type. When the GraphQL router sends a request to the subgraph to resolve a particular type using its unique identifier, the `Representation` type will include that field, in this case, the `id` field. Then you can retrieve that type from the `subgraph:Representation` and use that identifier to resolve the value of the type. In this case, we get the `id` from the representation and return an instance of the `Product` type. This function is passed as a function pointer in the `@subgraph:Entity` annotation as the `resolveReference` field.

Now the Products subgraph implementation is ready to be published. You can regenerate the GraphQL schema for the Products subgraph using the bal command:

```shell
bal graphql -i service.bal
```

Then you can publish your updated Products subgraph to the Apollo Studio using the previous command:

```shell
rover subgraph publish <APOLLO_GRAPH_REF> \
-name Products \
-schema ./schema_service.graphql \
```

> **Note:** When publishing the same subgraph for the second time, you don't need to provide the routing URL of the subgraph, until you need to change it.

#### Marking the Users Subgraph as a Federated Subgraph

You need to do the following things:

* Mark the Users subgraph as a federated subgraph
* Mark the User type as an Entity type
* Provide a ReferenceResolver for the User type

Marking the `Users` subgraph as a federated subgraph is similar to the `Products` Subgraph. Following is the updated GraphQL service code in the Users subgraph.

```ballerina
import ballerina/graphql;
import ballerina/graphql.subgraph;

@subgraph:Subgraph
service graphql:Service on new graphql:Listener(9091) {
  // ...
}
```

Then you can mark the `User` type as an `Entity` type. Following is the updated User type definition:

```ballerina
import user_subgraph.datasource;

import ballerina/graphql;
import ballerina/graphql.subgraph;

@subgraph:Entity {
  key: "id",
  resolveReference: resolveUser
}
public type User record {|
  @graphql:ID string id;
  string name;
  string email;
|};

isolated function resolveUser(subgraph:Representation representation) returns User|error? {
  string id = check representation["id"].ensureType();
  return datasource:getUser(id);
}
```

The above code segment shows the `subgraph:Entity` annotation, the `resolveUser` function as the reference resolver.

To facilitate the reference resolver, you need to provide an API to retrieve a `User` value from the `id`. In this case, we have a `getUser` function in the `datasource` module. Then you can use this function to resolve the `User` value from the `Representation` type. Following is the definition of the `getUser()` API inside the `datasource` module:

```ballerina
public isolated function getUser(string id) returns User? {
  lock {
    if users.hasKey(id) {
      return users.get(id);
    }
  }
  return;
}
```

With this, your `Users` subgraph is ready to be published. You can regenerate the GraphQL schema for the `Users` subgraph using the bal command:

```shell
bal graphql -i service.bal
```

Then you can publish your updated `Users` subgraph to the Apollo Studio using the previous command:

```shell
rover subgraph publish <APOLLO_GRAPH_REF> \
-name Users \
-schema ./schema_service.graphql \
```

#### Marking the Reviews Subgraph as a Federated Subgraph

Now you are ready to update the `Reviews` subgraph. To refresh the memory, we need to do the following:

* Mark the GraphQL service as a subgraph
* Add the Product entity type (with reviews field)
* Add the User entity type (with reviews field)
* Add the product field to the Review type
* Add the author field to the Review type

First, to mark the `Reviews` subgraph as a federated subgraph, you need to add the `@subgraph:Subgraph` annotation to the GraphQL service, similar to the previous subgraphs.
Following is the updated GraphQL service code in the Reviews subgraph.

```ballerina
import ballerina/graphql;
import ballerina/graphql.subgraph;

@subgraph:Subgraph
service graphql:Service on new graphql:Listener(9093) {
  // ...
}
```

Then you can add the `Product` type as an entity. From the `Reviews` subgraph, we contribute the `reviews` field to the `Product` type. Therefore, you only need the `id` field (which is the `key` for the `Product` entity type) and the `reviews` field. You should also define the reference resolver for the `Product` type. Following is the `Product` type definition:

```ballerina
@subgraph:Entity {
  key: "id",
  resolveReference: resolveProduct
}
public type Product record {|
  @graphql:ID string id;
  Review[] reviews;
|};

public isolated function resolveProduct(subgraph:Representation representation) returns Product|error {
  string id = check representation["id"].ensureType();
  return getProduct(id);
}
```

Similarly, you can define the `User` type with the `reviews` field and the corresponding reference resolver. Following is the `User` type definition:

```ballerina
@subgraph:Entity {
  key: "id",
  resolveReference: resolveUser
}
public type User record {|
  @graphql:ID string id;
  Review[] reviews;
|};

public isolated function resolveUser(subgraph:Representation representation) returns Product|error {
  string id = check representation["id"].ensureType();
  return getAuthor(id);
}
```

As per the above codes, you need two utility functions to retrieve the `Product` and `User` values from the `datasource`. Following are the implementations of those functions:

```ballerina
isolated function getProduct(string id) returns Product {
  ReviewInfo[] reviewList = datasource:getReviewsByProduct(id);
  return {
    id,
    reviews: reviewList.map(reviewInfo => new Review(reviewInfo))
  };
}

isolated function getAuthor(string id) returns User {
  ReviewInfo[] reviewList = datasource:getReviewsByAuthor(id);
  return {
    id,
    reviews: reviewList.map(reviewInfo => new Review(reviewInfo))
  };
}
```

To facilitate these functions, you need to add new APIs to the datasource. Following are the implementations of those APIs:

```ballerina
public isolated function getReviewsByProduct(string productId) returns readonly & Review[] {
  lock {
    return from Review review in reviews where review.productId == productId select review;
  }
}

public isolated function getReviewsByAuthor(string userId) returns readonly & Review[] {
  lock {
    return from Review review in reviews where review.authorId == userId select review;
  }
}
```

Then you have to add the `author` and `product` fields to the `Review` type. This can be easily done by adding two resource methods to the existing `Review` service class. Following are the two new resource methods:

```ballerina
isolated resource function get author() returns User => getAuthor(self.reviewInfo.authorId);
isolated resource function get product() returns Product => getProduct(self.reviewInfo.productId);
```

Now your `Reviews` subgraph is ready to be published. You can regenerate the GraphQL schema for the `Reviews` subgraph using the bal command:

```shell
bal graphql -i service.bal
```

Then you can publish your updated Reviews subgraph to the Apollo Studio using the previous command:

```shell
rover subgraph publish <APOLLO_GRAPH_REF> \
-name Reviews \
-schema ./schema_service.graphql \
```

Now all three subgraphs are updated and published to the Apollo studio. Now if you visit the Apollo Studio and check the generated supergraph schema, you can see the following schemas:

#### The GraphQL API schema

```graphql
type Mutation {
  addReview(input: ReviewInput!): Review!
}

type Product {
  id: ID!
  name: String!
  description: String!
  price: Float!
  reviews: [Review!]!
}

type Query {
  products: [Product!]!
  product(id: ID!): Product
  reviews: [Review!]!
  users: [User!]
}

type Review {
  id: ID!
  title: String!
  comment: String!
  rating: Int!
  author: User!
  product: Product!
}

input ReviewInput {
  title: String!
  comment: String!
  rating: Int!
  authorId: String!
  productId: String!
}

type User {
  id: ID!
  reviews: [Review!]!
  name: String!
  email: String!
}
```

#### The composed supergraph schema

```graphql
schema
  @link(url: "https://specs.apollo.dev/link/v1.0")
  @link(url: "https://specs.apollo.dev/join/v0.3", for: EXECUTION)
{
  query: Query
  mutation: Mutation
}

directive @join__enumValue(graph: join__Graph!) repeatable on ENUM_VALUE

directive @join__field(graph: join__Graph, requires: join__FieldSet, provides: join__FieldSet, type: String, external: Boolean, override: String, usedOverridden: Boolean) repeatable on FIELD_DEFINITION | INPUT_FIELD_DEFINITION

directive @join__graph(name: String!, url: String!) on ENUM_VALUE

directive @join__implements(graph: join__Graph!, interface: String!) repeatable on OBJECT | INTERFACE

directive @join__type(graph: join__Graph!, key: join__FieldSet, extension: Boolean! = false, resolvable: Boolean! = true, isInterfaceObject: Boolean! = false) repeatable on OBJECT | INTERFACE | UNION | ENUM | INPUT_OBJECT | SCALAR

directive @join__unionMember(graph: join__Graph!, member: String!) repeatable on UNION

directive @link(url: String, as: String, for: link__Purpose, import: [link__Import]) repeatable on SCHEMA

scalar join__FieldSet

enum join__Graph {
  PRODUCTS @join__graph(name: "Products", url: "http://localhost:9091")
  REVIEWS @join__graph(name: "Reviews", url: "http://localhost:9093")
  USERS @join__graph(name: "Users", url: "http://localhost:9092")
}

scalar link__Import

enum link__Purpose {
  """
  `SECURITY` features provide metadata necessary to securely resolve fields.
  """
  SECURITY
  """
  `EXECUTION` features provide metadata necessary for operation execution.
  """
  EXECUTION
}

type Mutation
  @join__type(graph: REVIEWS)
{
  addReview(input: ReviewInput!): Review!
}

type Product
  @join__type(graph: PRODUCTS, key: "id")
  @join__type(graph: REVIEWS, key: "id")
{
  id: ID!
  name: String! @join__field(graph: PRODUCTS)
  description: String! @join__field(graph: PRODUCTS)
  price: Float! @join__field(graph: PRODUCTS)
  reviews: [Review!]! @join__field(graph: REVIEWS)
}

type Query
  @join__type(graph: PRODUCTS)
  @join__type(graph: REVIEWS)
  @join__type(graph: USERS)
{
  products: [Product!]! @join__field(graph: PRODUCTS)
  product(id: ID!): Product @join__field(graph: PRODUCTS)
  reviews: [Review!]! @join__field(graph: REVIEWS)
  users: [User!] @join__field(graph: USERS)
}

type Review
  @join__type(graph: REVIEWS)
{
  id: ID!
  title: String!
  comment: String!
  rating: Int!
  author: User!
  product: Product!
}

input ReviewInput
  @join__type(graph: REVIEWS)
{
  title: String!
  comment: String!
  rating: Int!
  authorId: String!
  productId: String!
}

type User
  @join__type(graph: REVIEWS, key: "id")
  @join__type(graph: USERS, key: "id")
{
  id: ID!
  reviews: [Review!]! @join__field(graph: REVIEWS)
  name: String! @join__field(graph: USERS)
  email: String! @join__field(graph: USERS)
}
```

Now your supergraph schema is complete. You can use the Apollo Router to access your supergraph. If the router is not running already, run it again using the following command:

```shell
APOLLO_KEY=<Your Apollo Key> APOLLO_GRAPH_REF=<Your Apollo Graph Ref> ./router - config router.yaml
```

Then you can access the supergraph using the following GraphQL document:

```graphql
query ProductReviews {
  products {
    name
    reviews {
      rating
      author {
        name
      }
    }
  }
}
```

If everything works as expected, you will get the following response:

```json
{
  "data": {
    "products": [
      {
        "name": "Shoes",
        "reviews": []
      },
      {
        "name": "T-shirt",
        "reviews": [
          {
            "rating": 4,
            "author": {
              "name": "Bob"
              }
            },
            {
            "rating": 3,
            "author": {
              "name": "Charlie"
            }
          }
        ]
      },
      {
        "name": "Pants",
        "reviews": [
          {
            "rating": 1,
            "author": {
              "name": "Dave"
            }
          },
          {
            "rating": 4,
            "author": {
              "name": "Bob"
            }
          }
        ]
      }
    ]
  }
}
```

If you get the above response, congratulations! You have successfully created a federated GraphQL API using Ballerina. You can try out more complex queries to test this further.

## Handling Auth

In a production environment, you might need to handle authentication and authorization. In this section, we will discuss how to handle authentication and authorization in a federated GraphQL API.

### Authentication

There are a few options/approaches for authentication for federated GraphQL APIs. In this article, we will discuss how to use the delegate method. In this approach, you will delegate the authentication to the subgraphs, without handling them at the router-level.

> **Note:** There are other approaches where the authentication is handled at the router-level, but those are Apollo federation enterprise specific features. Therefore we are not going to discuss those approaches in this article. Refer to [Apollo documentation](https://www.apollographql.com/docs/technotes/TN0004-router-authentication) for more information.

#### Configure the Router to Delegate Authentication

To delegate the authentication to the subgraphs, you need to forward the headers to the subgraphs. To do this, you need to add the following configuration to the `router.yaml` file:

```yaml
headers:
  all:
    request:
      - propagate:
          named: authorization
```

This will forward the authorization header value to each subgraph.

#### Implement Authentication in the Subgraphs

In each subgraph, you can define a `contextInit` function to retrieve the `authorization` header value. Following is the implementation of the `contextInit` function in the `Products` subgraph:

```ballerina
import ballerina/graphql;
import ballerina/http;

@graphql:ServiceConfig {
  contextInit: contextInit
}
service graphql:Service on new graphql:Listener(9091) {
  // same as before
}

isolated function contextInit((http:RequestContext requestContext, http:Request request) returns graphql:Context|error {
  graphql:Context context = new;
  string|error authHeader = request.getHeader("authorization");
  if authHeader is error {
    return error("Authorization failed");
  }
  UserContext|error userContext = authenticateUser(authHeader); // authenticate the user using the authHeader
  if userContext is error {
    return error("Authorization failed");
  }
  context.set("user", userContext);
  return context;
}
```

In the `contextInit` function, we are trying to authenticate the `user` using the `authorization` header value. If the authentication is successful, we are setting the `UserContext` to the GraphQL context. Note that we are using the `authenticateUser` method, which can be implemented according to your authentication mechanism.

After authenticating the user, the `UserContext` is passed to the GraphQL context. Using the `UserContext`, you can implement the authorization logic in the resolvers. In GraphQL, you can configure what fields are accessible to a particular user. In Ballerina this can be achieved using the Interceptors. Following is an example of an interceptor:

```ballerina
import ballerina/graphql;

@graphql:InterceptorsConfig {
  global: false
}
readonly service class AdminAuthInterceptor {
  *graphql:Interceptor;
  isolated remote function execute(graphql:Context context, graphql:Field 'field) returns anydata|error {
    UserContext user = check context.get("user").ensureType();
    if userContext.role != "admin" {
      return error("Unauthorized");
    }
  return context.resolve('field);
}
```

The above interceptor handles the authorization logic for the `admin` role. You can implement other interceptors for other roles as well. Then you can add these interceptors to the resolvers. Following is an example of adding an interceptor to a resolver:

```ballerina
service graphql:Service on new graphql:Listener(9091) {
  // same as before
  @graphql:ResolverConfig {
    interceptors: [new AdminAuthInterceptor()]
  }
  isolated remote function getProduct(string id) returns Product|error {
    // same as before
  }
}
```

We can follow the same approach for the other subgraphs as well. Now you have a federated GraphQL API with authentication and authorization.

Apart from this, you can also handle authentication using a gateway. In this case, the gateway itself authenticates the user and returns errors if the authentication fails.

In production environments, you can use a combination of these approaches to handle authentication and authorization, which will provide a more robust authentication and authorization mechanism.

## Conclusion

In this article, we discussed the GraphQL federation concepts and how to implement federated GraphQL API using Ballerina and Apollo Studio, with authentication and authorization.

There are more exciting projects coming up in the Ballerina GraphQL ecosystem, including:

* The Ballerina GraphQL federation gateway
* The Ballerina GraphQL schema registry
* The federation support for the Ballerina GraphQL CLI tool

Stay tuned for more updates!

## References

The complete code for the subgraphs can be found in the following repositories:

* [Products Subgraph](https://github.com/ThisaruGuruge/ballerina-graphql-federation-products-subgraph/)
* [Users Subgraph](https://github.com/ThisaruGuruge/ballerina-graphql-federation-users-subgraph/)
* [Reviews Subgraph](https://github.com/ThisaruGuruge/ballerina-graphql-federation-reviews-subgraph/)

> Ballerina is an open-source project. We welcome any kind of contributions to the Ballerina platform, including [starring on GitHub](https://github.com/ballerina-platform/module-ballerina-graphql).
