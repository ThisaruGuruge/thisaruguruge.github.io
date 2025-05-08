---
title: "GraphQL Federation with Ballerina and Apollo - Part I"
tags: ["Tech", "Ballerina", "GraphQL"]
description: "This article series will dive into GraphQL federation with Ballerina and Apollo Studio. In this part, you will learn how to design and implement federated subgraphs using Ballerina and publishing them to Apollo Studio."
author: 'Thisaru'
pubDate: 2023-10-02
---

> This article was written using Ballerina Swan Lake Update 8 (2201.8.0)

![GraphQL Federation with Ballerina and Apollo](/images/blog/graphql-federation-with-ballerina-part-I/graphql-federation.webp)

## Introduction

### GraphQL: Striking a Balance Between Advantages and Limitations

GraphQL, a relatively recent addition to the API world, is in a constant process of evolution. Like any innovation, GraphQL possesses strengths and limitations that the dynamic GraphQL community aggressively addresses. Within GraphQL APIs, a key benefit is the accessibility of data from a single endpoint. Clients request exactly what they need, and the server responds with exactly the requested information. While this presents an appealing prospect for front-end developers, the same feature can turn into a nightmare for back-end developers. Imagine a GraphQL API with hundreds of types, each with multiple fields. Managing such an API would become an almost insurmountable challenge.

### Introducing GraphQL Federation: Unifying Complex APIs

Enter GraphQL Federation - an architectural paradigm. GraphQL Federation resolves the aforementioned issue by segmenting a singular GraphQL API into smaller components, known as subgraphs. These subgraphs, manageable and scalable, can be differentiated based on the separation of concerns. Various teams can then oversee different subgraphs, with GraphQL Federation seamlessly integrating them into a unified GraphQL API. This ensures a seamless experience for clients, harmonizing the intricacies behind the scenes, while making life easy for the back-end developers.
This article series will dive into GraphQL federation with Ballerina and Apollo Studio.

### How Does GraphQL Federation Work?

GraphQL Federation consists of 4 major components.

* Subgraph(s)
* Supergraph Schema
* GraphQL Router
* Schema Registry

#### Federated Subgraph

A federated subgraph functions as an independent GraphQL API, typically centered around a specific domain. Typically, a subgraph is overseen by a single team, with distinct implementation details and design preferences, encompassing choices related to data sources, programming languages, and deployment strategies. A federated supergraph, in turn, incorporates one or more of these subgraphs.

>**Note:** It's worth highlighting that GraphQL Federation permits the creation of a federated GraphQL service with a single subgraph. This approach offers scalability for greenfield projects, allowing seamless expansion. For brownfield projects, it facilitates a transition from a monolithic GraphQL API to a Federated GraphQL API.

#### Supergraph Schema

The supergraph schema is a GraphQL schema that encompasses all the subgraphs within the federation. Constructing the supergraph schema entails the composition of all individual subgraphs. A tool like Rover CLI possesses the capability to seamlessly combine these subgraphs into a supergraph schema.

> **Note:** In a later section of this article series, you will delve into the intricacies of the supergraph composition process.

#### GraphQL Router

The GraphQL router is the magical mediator between the GraphQL client and the subgraphs. True to its name, the router efficiently directs GraphQL requests from clients to their respective subgraphs. Particularly in scenarios involving numerous subgraphs with complex relationships, the router is smart enough to devise a query plan to gather necessary data from each subgraph by referring to the supergraph schema. Once the data is collected from these subgraphs, the router stitches them together, generating a singular response dispatched back to the client. This seamless orchestration ensures that the client's request is fulfilled precisely, all the while being blissfully unaware that the data has been seamlessly curated from multiple GraphQL APIs (subgraphs).

#### Schema Registry

In a federated architecture, the schema registry assumes the role of a version control system for the schema. This registry diligently records alterations made to the federated supergraph schema, ensuring efficient management and conflict reduction while safeguarding the integrity of the supergraph schema.

## What You'll Build

You will build a product review system using Ballerina and Apollo Federation in this example.
This service should provide the functionality to retrieve product information, user information, and review information. Additionally, it should provide the functionality to add new reviews to the products.
Although you are going to implement a federated GraphQL API, first you are going to define the GraphQL schema disregarding the federation aspect. Once the API is defined, it can be broken down into smaller subgraphs.

### Gathering Requirements

To define our GraphQL API effectively, it's crucial to start by gathering the requirements. The best way to do this is by articulating the use cases. Below, we present a set of simple, sample use cases that will guide the creation of our GraphQL API.

#### Use Case 1 - Retrieve Product Information

The first use case addresses the need for clients to retrieve a list of all products available. This is the GraphQL query for that purpose:

```graphql
query GetAllProducts {
  products {
    id
    name
    reviews {
      rating
    }
  }
}
```

Additionally, we must cater to the requirement of retrieving a specific product by its unique ID. This is the corresponding GraphQL query:

```graphql
query GetProduct($id: ID!) {
  product(id: $id) {
    id
    name
    description
    price
    reviews {
      title
      rating
      comment
    }
  }
}
```

#### Use Case 2 - Retrieve User Information

In the second use case, clients need to fetch a list of all users within the system. The GraphQL query for this purpose is as follows:

```graphql
query GetUsers {
  users {
    id
    name
    email
  }
}
```

#### Use Case 3 - Retrieve Review Information

This scenario involves retrieving product review information, filtered either by user ID or product ID. Here are the GraphQL queries for these situations:
For reviews filtered by user ID:

```graphql
query GetReviews($userId: ID) {
  reviews(userId: $userId) {
    title
    comment
    rating
  }
}
```

For reviews filtered by product ID:

```graphql
query GetReviews($productId: ID) {
  reviews(productId: $productId) {
    title
    comment
    rating
    author {
      id
      name
    }
  }
}
```

#### Use Case 4 - Add Review

The final use case entails adding a new review to a product. This is achieved through a mutation operation, and the GraphQL mutation looks like this:

```graphql
mutation AddReview($input: ReviewInput!) {
  addReview(reviewInput: $input): Review!
}
```

Where following is a sample ReviewInput:

```json
{
  "input": {
    "title": "Nice Product",
    "comment": "Value for money",
    "rating": 5
  }
}
```

### Designing the API

Now that we have a clear understanding of the requirements through these use cases, we can proceed to define the schema for our GraphQL API. Building upon these use cases, we can derive the following GraphQL schema:

```graphql
type Query {
  products: [Product!]!
  product(id: ID!): Product
  users: [User!]!
  reviews(productId: ID, authorId: ID): [Review!]!
}

type Mutation {
  addReview(reviewInput: ReviewInput!): Review
}

type Product {
  id: ID!
  name: String!
  price: Float!
  description: String!
  reviews: [Review!]!
}

type Review {
  id: ID!
  title: String!
  comment: String!
  rating: Int!
  product: Product!
  author: User!
}

type User {
  id: ID!
  name: String!
  email: String!
  reviews: [Review!]!
}

input ReviewInput {
  title: String!
  comment: String!
  productId: ID!
}
```

With our GraphQL API schema defined based on the gathered requirements, we can now proceed to the next step.

### Designing the Federated Supergraph

To transform our GraphQL schema into a federated supergraph, we employ a separation of concerns approach. The schema can be logically divided into three main areas: Products, Users, and Reviews. Each of these areas can be implemented as a separate subgraph, often managed by different teams.
It's important to note that in a federated GraphQL API, there may be types that span multiple subgraphs. These types are referred to as Entity types in GraphQL federation. To identify Entity types in our schema, we can annotate the schema with subgraph affiliations as comments.

>**Note:** These comments are for illustrative purposes only. They are not part of the GraphQL schema and they will not affect the schema in any way.

```graphql
type Query {
  products: [Product!]! # Products Subgraph
  product(id: ID!): Product # Products Subgraph
  users: [User!]! # Users Subgraph
  reviews(productId: ID, authorId: ID): [Review!]! # Reviews Subgraph
}

type Mutation {
  addReview(reviewInput: ReviewInput!): Review # Reviews Subgraph
}

type Product {
  id: ID! # Products Subgraph
  name: String! # Products Subgraph
  price: Float! # Products Subgraph
  description: String! # Products Subgraph
  reviews: [Review!]! # Reviews Subgraph
}

type Review {
  id: ID! # Reviews Subgraph
  title: String! # Reviews Subgraph
  comment: String! # Reviews Subgraph
  rating: Int! # Reviews Subgraph
  product: Product! # Reviews Subgraph
  author: User! # Reviews Subgraph
}

type User {
  id: ID! # Users Subgraph
  name: String! # Users Subgraph
  email: String! # Users Subgraph
  reviews: [Review!]! # Reviews Subgraph
}

input ReviewInput {
  title: String! # Reviews Subgraph
  comment: String! # Reviews Subgraph
  productId: ID! # Reviews Subgraph
}
```

This annotation practice helps us understand the schema's design and the affiliation of types with different subgraphs.

In our schema, we have identified two `Entity` types:

* `Product` - This type spans both the Products Subgraph and the Reviews Subgraph.
* `User` - Similarly, the User type spans both the Users Subgraph and the Reviews Subgraph.

Now, with a well-structured GraphQL schema in place, we are ready to proceed to the next step of designing the federated supergraph.

## Implementing Federated Subgraphs in Ballerina

In this section, we'll walk through the process of implementing individual subgraphs using Ballerina. Each subgraph corresponds to a specific domain within our federated GraphQL API. We'll create three subgraphs: Products Subgraph, Users Subgraph, and Reviews Subgraph.

### Prerequisites

* Download and install [Ballerina](https://ballerina.io/downloads/).
* A code editor (Visual Studio Code is preferred with [Ballerina extension](https://marketplace.visualstudio.com/items?itemName=WSO2.ballerina))
* An [Apollo Studio](https://studio.apollographql.com/) account
* [Rover CLI](https://www.apollographql.com/docs/rover)

Before diving into the code, it's worth noting that this section provides a high-level overview of the subgraph implementations. Detailed code explanations are omitted to maintain focus on the key concepts of GraphQL federation. For in-depth Ballerina GraphQL implementation, refer to the provided resources.

### Resources for Ballerina GraphQL Implementation

For a comprehensive understanding of Ballerina GraphQL implementation, explore these resources:

* [Ballerina GraphQL Specification](https://ballerina.io/spec/graphql)
* [Ballerina GraphQL API Docs](https://central.ballerina.io/ballerina/graphql/latest)
* [Ballerina by Examples](https://ballerina.io/learn/by-example/#graphql-service)

Now, let's proceed with creating the subgraphs without the federation-specific features. We'll add federation-specific functionality later in this article series.

### Products Subgraph

#### Schema for the Products Subgraph

We begin by defining the GraphQL schema for the Products Subgraph, which includes two query fields.

```graphql
type Query {
  products: [Product!]!
  product(id: ID!): Product
}

type Product {
  id: ID!
  name: String!
  description: String!
  price: Float!
}
```

To create the Products Subgraph project, use the following Ballerina command:

```shell
bal new products_subgraph -t service
```

This command initializes a new Ballerina project under the products_subgraph directory.

#### Data Source for the Products Subgraph

Most GraphQL services have their own data sources. In this example, we use an in-memory Ballerina table as the data source, but this can be easily replaced with a database. To make the data source replaceable, we implement it as a separate Ballerina module.

To add the data source module, navigate to the root directory of the Products subgraph repository and execute this command:

```shell
bal add datasource
```

This command creates a new datasource directory under the modules directory. Inside this directory, add the following code:

##### Types Used in Products Data Source

Define a single type, Product, used in the data source:

```ballerina
type Product readonly & record {|
  string id;
  string name;
  string description;
  float price;
|};
```

##### Products Data Source API

Implement the data source API, which provides access to the product data:

```ballerina
public isolated function getProducts() returns readonly & Product[] {
  lock {
    return from Product product in products select product;
  }
}

public isolated function getProduct(string id) returns Product? {
  lock {
    return products[id];
  }
}
```

##### Sample Product Data

Define a sample data set for the Product type:

```ballerina
isolated table<Product> key(id) products = table [
  {id: "product_0", name: "Shoes", description: "A pair of shoes", price: 100},
  {id: "product_1", name: "T-shirt", description: "A t-shirt", price: 10},
  {id: "product_2", name: "Pants", description: "A pair of pants", price: 50}
];
```

#### GraphQL Service for Products Subgraph

Now, let's create the main GraphQL service for the Products Subgraph. Below is the initial code for this subgraph service:

```ballerina
import product_subgraph.datasource;

import ballerina/graphql;

service graphql:Service on new graphql:Listener(9091) {
  resource function get products() returns Product[] => datasource:getProducts();

  resource function get product(@graphql:ID string id) returns Product? =>
  datasource:getProduct(id);
}
```

##### Types of the Products Subgraph

The next step is to define the types required for the GraphQL service of the Products Subgraph. In this case, we have a single type, Product:

```ballerina
import ballerina/graphql;

public type Product record {|
  @graphql:ID string id;
  string name;
  string description;
  float price;
|};
```

For the detailed implementation of this subgraph, refer to the [Products Subgraph repository](https://github.com/ThisaruGuruge/ballerina-graphql-federation-products-subgraph/tree/initial-state).

### Users Subgraph

The Users Subgraph follows a similar structure as the Products Subgraph. Here, we'll define the schema, data source, GraphQL service, and types for the Users Subgraph.

#### Schema for the Users Subgraph

Define the GraphQL schema for the Users Subgraph, which includes a single query field:

```graphql
type Query {
  users: [User!]!
}

type User {
  id: ID!
  name: String!
  email: String!
}
```

To create the Users Subgraph project, follow the same steps as the Products Subgraph and execute this command:

```shell
bal new users_subgraph -t service
```

#### Data Source for the Users Subgraph

Create a data source module for the Users Subgraph, similar to the Products Subgraph, with types, data source API, and sample user data.

##### Types Used in Users Data Source

Define the User type for the data source:

```ballerina
public type User record {|
  string id;
  string name;
  string email;
|};
```

#### Users Data Source API

Implement the data source API for accessing user data:

```ballerina
public isolated function getUsers() returns readonly & User[] {
  lock {
    return from User user in users select user;
  }
}
```

#### Sample User Data

Define a sample data set for the User type:

```ballerina
isolated table<User> key(id) users = table [
  {id: "user_0", name: "Alice", email: "alice@sample.com"},
  {id: "user_1", name: "Bob", email: "bob@sample.com"},
  {id: "user_2", name: "Charlie", email: "charlie@sample.com"},
  {id: "user_3", name: "Dave", email: "dave@sample.com"},
  {id: "user_4", name: "Eve", email: "eve@sample.com"}
];
```

#### GraphQL Service for Users Subgraph

Create the GraphQL service for the Users Subgraph:

```ballerina
import user_subgraph.datasource;

import ballerina/graphql;

service graphql:Service on new graphql:Listener(9092) {
  resource function get users() returns User[] => datasource:getUsers();
}
```

#### Types of the Users Subgraph

Define the GraphQL types for the Users Subgraph, including the User type:

```ballerina
import ballerina/graphql;

public type User record {|
  @graphql:ID string id;
  string name;
  string email;
|};
```

The Users Subgraph implementation details can be found in the [Users Subgraph repository](https://github.com/ThisaruGuruge/ballerina-graphql-federation-users-subgraph/tree/initial-state).

### Reviews Subgraph

The Reviews Subgraph follows a similar structure as the previous subgraphs. Here, we'll define the schema, data source, GraphQL service, and types for the Reviews Subgraph.

#### Schema for the Reviews Subgraph

Define the GraphQL schema for the Reviews Subgraph, which includes queries and a mutation for adding reviews:

```ballerina
type Query {
  reviews: [Review!]!
}

type Review {
  id: ID!
  title: String!
  comment: String!
  rating: Int!
}

type Mutation {
  addReview(input: ReviewInput!): Review!
}

input ReviewInput {
  title: String!
  comment: String!
  rating: Int!
  authorId: String!
  productId: String!
}
```

> **Note:** The product and the author fields of the Review type are not added here. Those fields will be added in a later section of this article series.

To create the Reviews Subgraph project, follow the same steps as the previous subgraphs and execute this command:

```shell
bal new reviews_subgraph -t service
```

#### Data Source for the Reviews Subgraph

Create a data source module for the Reviews Subgraph, similar to the previous subgraphs, with types, data source API, and sample review data.

##### Types Used in Reviews Data Source

Define two types of the data source: Review and ReviewInput:

```ballerina
type Review record {|
  readonly string id;
  string title;
  string comment;
  int rating;
  string authorId;
  string productId;
|};

type ReviewInput record {|
  string title;
  string comment;
  int rating;
  string authorId;
  string productId;
|};
```

#### Reviews Data Source API

Implement the data source API for accessing review data and adding new reviews:

```ballerina
public isolated function getReviews() returns readonly & Review[] {
  lock {
    return from Review review in reviews select review;
  }
}

public isolated function addReview(ReviewInput input) returns Review {
  lock {
    string nextId = string `review-${reviews.length()}`;
    Review review = {
      id: nextId,
      ...input
    };
    reviews.add(review);
    return review;
  }
}
```

#### Sample Review Data

Define a sample data set for the Review type:

```ballerina
isolated table<Review> key(id) reviews = table [
  {id: "review_0", title: "Great!", comment: "Value for money", rating: 4, productId: "product_1", authorId: "user_1"},
  {id: "review_1", title: "Good", comment: "Fast delivery", rating: 3, productId: "product_1", authorId: "user_2"},
  {id: "review_2", title: "Bad", comment: "Not as described", rating: 1, productId: "product_2", authorId: "user_3"},
  {id: "review_3", title: "Great!", comment: "Value for money", rating: 4, productId: "product_2", authorId: "user_1"}
];
```

#### GraphQL Service for Reviews Subgraph

Create the GraphQL service for the Reviews Subgraph, including query and mutation operations:

```ballerina
import review_subgraph.datasource;

import ballerina/graphql;

service graphql:Service on new graphql:Listener(9093) {
  resource function get reviews() returns Review[] {
    return from ReviewInfo reviewInfo in datasource:getReviews()
    select new (reviewInfo);
  }

  remote function addReview(ReviewInput input) returns Review {
    ReviewInfo result = datasource:addReview(input);
    return new (result);
  }
}
```

#### Types of the Reviews Subgraph

Define the GraphQL types for the Reviews Subgraph, including the Review type and ReviewInput input type:

```ballerina
import ballerina/constraint;
import ballerina/graphql;

public isolated service class Review {
  private final readonly & ReviewInfo reviewInfo;

  isolated function init(ReviewInfo reviewInformation) {
    self.reviewInfo = reviewInformation.cloneReadOnly();
  }

  isolated resource function get id() returns @graphql:ID string => self.reviewInfo.id;
  isolated resource function get title() returns string => self.reviewInfo.title;
  isolated resource function get comment() returns string => self.reviewInfo.comment;
  isolated resource function get rating() returns int => self.reviewInfo.rating;
}

type ReviewInfo record {|
  string id;
  string title;
  string comment;
  int rating;
  string authorId;
  string productId;
|};

public type ReviewInput readonly & record {|
  string title;
  string comment;
  @constraint:Int {
    minValue: 0,
    maxValue: 5
  }
  int rating;
  string authorId;
  string productId;
|};
```

> **Note:** The Review type is defined using a Ballerina service type here. Although it could be defined using a record type, the service type is chosen because certain federation-specific features (which will be discussed later in this article series) require this type to be defined as a service type.

For a detailed implementation of this subgraph, refer to the [Reviews Subgraph repository](https://github.com/ThisaruGuruge/ballerina-graphql-federation-reviews-subgraph/tree/initial-state).

With these subgraphs implemented, you have laid the foundation for your federated GraphQL API. In the next sections, we will enhance these subgraphs with federation-specific features to build the supergraph.

## Publish Subgraphs

Now that we have our initial implementation complete, we can publish them. To publish the subgraphs we can use the [Rover CLI](https://www.apollographql.com/docs/rover/) from Apollo.

### Publishing to Apollo Studio

To publish the subgraphs to Apollo Studio, first, create an account on Apollo Studio and create a new Graph. Refer to [Apollo documentation](https://www.apollographql.com/docs/graphos/) for more information about creating new graphs and publishing them. When you create a new Graph, a pop-up shows up with an `APOLLO_KEY`, and `APOLLO_GRAPH_REF`. Copy these values and save them in a `.env` file.

```toml
APOLLO_KEY=<Your Apollo Key>
APOLLO_GRAPH_REF=<Your Apollo Graph Ref>
```

First, we need to configure the Rover CLI to connect with our Graph in the Apollo Studio. Execute the following command to configure the Rover CLI.

```shell
rover config auth
```

This will prompt you to enter the Apollo key. Copy and paste the `APOLLO_KEY` obtained above here.

> **Note:** Make sure to copy and paste the complete key, which starts from `service:`.

If the key is applied successfully, the following message will be printed on the stdout:

```plaintext
Successfully saved API key.
```

Once the key is successfully set, we can publish the subgraph.

To publish the subgraph we need the GraphQL schema of the subgraph. To get the subgraph, we can use the [`bal graphql` CLI tool](https://ballerina.io/learn/graphql-tool/#schema-generation). Execute the following command inside the Products subgraph repo:

```shell
bal graphql -i service.bal
```

This will generate the GraphQL schema for the subgraph and save it in a file named `schema_service.graphql`. Once the schema is created, you can publish the subgraph to Apollo Studio. For testing purposes, we can use the locally running subgraph for this. Execute the following command in the root of the Products subgraph repository:

```shell
bal run
```

This will run the GraphQL service locally. Now that we have a running instance of the subgraph, we can publish it to the Apollo studio using Rover CLI. You need the `APOLLO_GRAPH_REF` obtained above for this step. Execute the following command to publish the subgraph:

```shell
rover subgraph publish <APOLLO_GRAPH_REF> \
-name Products \
-schema ./schema_service.graphql \
-routing-url http://localhost:9091
```

Repeat the same steps for the other two subgraphs to publish them to Apollo Studio.

> **Note:** You do not need to configure the Rover CLI every time. When publishing just change the subgraph name, schema file, and the url accordingly.

Once all the subgraphs are published, we can visit the Apollo Studio and check our schema. Following is a sample GraphQL API schema generated in the Apollo Studio:

```graphql
type Mutation {
  addReview(input: ReviewInput!): Review!
}

type Product {
  id: ID!
  name: String!
  description: String!
  price: Float!
}

type Query {
  products: [Product!]!
  product(id: ID!): Product
  reviews: [Review!]!
  users: [User!]!
}

type Review {
  id: ID!
  title: String!
  comment: String!
  rating: Int!
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
  name: String!
  email: String!
}
```

In addition to this schema, there will be another schema generated from the Apollo Studio, which is our supergraph schema. Following is the supergraph schema generated from the subgraphs we published above:

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
  @join__type(graph: PRODUCTS)
{
  id: ID!
  name: String!
  description: String!
  price: Float!
}

type Query
  @join__type(graph: PRODUCTS)
  @join__type(graph: REVIEWS)
  @join__type(graph: USERS)
{
  products: [Product!]! @join__field(graph: PRODUCTS)
  product(id: ID!): Product @join__field(graph: PRODUCTS)
  reviews: [Review!]! @join__field(graph: REVIEWS)
  users: [User!]! @join__field(graph: USERS)
}

type Review
  @join__type(graph: REVIEWS)
{
  id: ID!
  title: String!
  comment: String!
  rating: Int!
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
  @join__type(graph: USERS)
{
  id: ID!
  name: String!
  email: String!
}
```

As you can see, the Apollo Studio already has composed a supergraph schema from the subgraphs you published. Now that we have the supergraph ready, we can use the Apollo Router as the access point of our supergraph.

> **Note:** You can compose your supergraph schema locally using the Rover CLI. Refer to [Apollo documentation](https://www.apollographql.com/docs/rover/supergraphs/#composing-a-supergraph-schema) for more information.

### Configure Apollo Router

Create a new directory and download the [Apollo Router](https://www.apollographql.com/docs/router/quickstart/#1-download-and-extract-the-apollo-router-binary).

> **Note:** This article series shows how to implement federated GraphQL API using a self-hosted Apollo router. To use the self-hosted Apollo router, you need an Apollo enterprise plan.

Then create a separate file named router.yaml file. This is used to configure the Apollo Router. Following is a sample configuration file:

```yaml
sandbox:
  enabled: true

homepage:
  enabled: false

supergraph:
  introspection: true

include_subgraph_errors:
  all: true # Propagate errors from all subgraphs

cors:
  origins:
    - http://localhost:4000
    - https://studio.apollographql.com
```

Refer to the [Apollo Router documentation](https://www.apollographql.com/docs/router/configuration/overview/) for more information about configuring the router.

Now we can run the router. You need the `APOLLO_KEY` and the `APOLLO_GRAPH_REF`. Execute the following command to run the Apollo Router:

```shell
APOLLO_KEY=<Your Apollo Key> APOLLO_GRAPH_REF=<Your Apollo Graph Ref> ./router - config router.yaml
```

Once the router is up and running, it will print the router link on the stdout (the default value is <http://localhost:4000>), so that you can try out your federated supergraph. When you access the link using a browser, it will start an Apollo Sandbox instance. (This is configured using the router.yaml file mentioned above).

Now use the following GraphQL document to test your federated GraphQL API:

```graphql
query ExampleQuery {
  products {
    id
    name
  }
  reviews {
    id
    rating
  }
  users {
    id
    name
  }
}
```

This will return the following response if everything is running correctly.

```json
{
  "data": {
    "products": [
      {
        "id": "product_0",
        "name": "Shoes"
      },
      {
        "id": "product_1",
        "name": "T-shirt"
      },
      {
        "id": "product_2",
        "name": "Pants"
      }
    ],
    "reviews": [
      {
        "id": "review_0",
        "rating": 4
      },
      {
        "id": "review_1",
        "rating": 3
      },
      {
        "id": "review_2",
        "rating": 1
      },
      {
        "id": "review_3",
        "rating": 4
      }
    ],
    "users": [
      {
        "id": "1",
        "name": "Alice"
      },
      {
        "id": "2",
        "name": "Bob"
      },
      {
        "id": "3",
        "name": "Charlie"
      },
      {
        "id": "4",
        "name": "Dave"
      },
      {
        "id": "5",
        "name": "Eve"
      }
    ]
  }
}
```

Congratulations! Now you have a working federated supergraph. Let's check how to add Entity types to this federated supergraph in the next part of this article series.

Continue reading on Part II of this article.

> Ballerina is an open-source project. We welcome any kind of contributions to the Ballerina platform, including starring on GitHub.
