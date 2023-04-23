---
layout: default
permalink: /sample
---

# Sample

```ballerina
import ballerina/graphql;

service on new graphql:Listener(9090) {
    resource function get greeting() returns string {
        return "Hello";
    }
}
```
