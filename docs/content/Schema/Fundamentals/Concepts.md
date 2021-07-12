---
title: Concepts
permalink: /schema/fundamentals/concepts
category: Data Schema
menuOrder: 1
subCategory: Fundamentals
---

Cube.js borrows a lot of terminology from data science, and this document is
intended for both newcomers and regular users to refresh their understanding.

We'll use a sample e-commerce database to illustrate the concepts throughout
this page.

## Cubes

A cube represents a table of data in Cube.js. Cubes are typically declared in
separate files with one cube per file. Within each cube are definitions of
measures and dimensions.

Typically, a cube points to a single table in your database using the [`sql`
property][ref-schema-ref-sql]:

```javascript
cube('Orders', {
  sql: `SELECT * FROM public.orders`,
});
```

The `sql` property of a cube is flexible enough to accommodate more complex SQL
queries too:

```javascript
cube('Orders', {
  sql: `
SELECT
  *
FROM
  public.orders,
  otherschema.othertable
WHERE
  orders.id = othertable.id
  `,
});
```

## Measures

Measures are [quantitative properties][wiki-quantitative] of the cube. This also
means that measures are expected to [be additive][ref-caching-additive].

To add a measure called `count` for our orders table, for example, we can do the
following:

```javascript
cube('Orders', {
  ...,
  measures: {
    count: {
      type: `count`,
    },
  },
});
```

## Dimensions

Dimensions are [qualitative properties][wiki-qualitative] of the cube.

<!-- prettier-ignore-start -->
[[info | ]]
| Date-based properties are generally used as dimensions in Cube.js
<!-- prettier-ignore-end -->

Our orders table has a few different properties that can be represented as
dimensions:

```javascript
cube('Orders', {
  ...,
  dimensions: {
    status: {
      sql: `status`,
      type: `string`
    },

    id: {
      sql: `id`,
      type: `number`,
      // Here we explicitly let Cube.js know this field is the primary key
      // This is required for ...
      primaryKey: true
    },

    createdAt: {
      sql: `created_at`,
      type: `time`
    },
  },
});
```

## Pre-Aggregations

// explain the "pre"

## OLAP

[ref-caching-additive]:
  /caching/pre-aggregations/getting-started#ensuring-pre-aggregations-are-targeted-by-queries-additivity
[ref-caching-nonadditive]:
  /caching/pre-aggregations/getting-started#ensuring-pre-aggregations-are-targeted-by-queries-non-additivity
[ref-schema-ref-sql]: /cube#parameters-sql
[self-dimensions]: #dimensions
[self-measures]: #measures
[wiki-olap]: https://en.wikipedia.org/wiki/Online_analytical_processing
[wiki-qualitative]: https://en.wikipedia.org/wiki/Qualitative_property
[wiki-quantitative]: https://en.wikipedia.org/wiki/Quantitative_research
