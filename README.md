# tslint-tinypg

[![npm version][version-image]][version-url]
[![travis build][travis-image]][travis-url]
[![MIT license][license-image]][license-url]

[TSLint](https://palantir.github.io/tslint/) rules to lint [tinypg](https://github.com/joeandaverde/tinypg) usage in TypeScript.

## Background

When using tinypg with typescript, it's possible to reference a missing SQL file. It's easy to pass in an object with unused properties or to pass an object with missing properties. Using typescript's AST, we can find usages of tinypg and make sure that it is being used appropriately. In the future, we may be able to add more rules for other gotchas like SQL injection warnings or misuse of transactions.

## Installing

`npm install tslint-tinypg --save-dev`

See the [example](#sample-configuration-file) tslint.json file for configuration.

## Compability

* tslint-tinypg 1.x.x is compatible with tslint 5.x.x.

## TSLint Rules

The following rules are available:

* [TinyPg rules](#tinypg-rules)
  * [no-unused-properties](#no-unused-properties)
  * [no-missing-sql-file](#no-missing-sql-file)

## Tinypg rules

### no-unused-properties

This rule enforces having the `readonly` modifier on all interface members.

You might think that using `const` would eliminate mutation from your TypeScript code. **Wrong.** Turns out that there's a pretty big loophole in `const`.

```typescript
interface Point { x: number, y: number }
const point: Point = { x: 23, y: 44 };
point.x = 99; // This is legal
```

This is why the `readonly-interface` rule exists. This rule prevents you from assigning a value to the result of a member expression.

```typescript
interface Point { readonly x: number, readonly y: number }
const point: Point = { x: 23, y: 44 };
point.x = 99; // <- No object mutation allowed.
```

This rule is just as effective as using Object.freeze() to prevent mutations in your Redux reducers. However this rule has **no run-time cost**, and is enforced at **compile time**.  A good alternative to object mutation is to use the ES2016 object spread [syntax](https://github.com/Microsoft/TypeScript/wiki/What's-new-in-TypeScript#object-spread-and-rest) that was added in typescript 2.1:

```typescript
interface Point { readonly x: number, readonly y: number }
const point: Point = { x: 23, y: 44 };
const transformedPoint = { ...point, x: 99 };
```

### no-missing-sql-file

This rule enforces all indexers to have the readonly modifier.

```typescript
// NOT OK
let foo: { [key:string]: number }; 
// OK
let foo: { readonly [key:string]: number }; 
```

## Options


## Sample Configuration File

Here's a sample TSLint configuration file (tslint.json) that activates all the rules:

```javascript
{
  "rulesDirectory": ["./node_modules/tslint-tinypg/rules"],
  "rules": {

    // Tinypg rules
    "no-missing-sql-file": true,
    "no-unused-properties": true,
    "no-missing-properties": true
  }
}
```

## How to contribute

For new features file an issue. For bugs, file an issue and optionally file a PR with a failing test. Tests are really easy to do, you just have to edit the `*.ts.lint` files under the test directory. Read more here about [tslint testing](https://palantir.github.io/tslint/develop/testing-rules/). 

## How to develop

To execute the tests run `yarn test`.
To release a new package version run `yarn publish:patch`, `yarn publish:minor`, or `yarn publish:major`.

## Prior work

This work was originally inspired by [vscode-tinypg](https://github.com/joeandaverde/vscode-tinypg). The template for this repo came from [jonaskello/tslint-immutable](https://github.com/jonaskello/tslint-immutable).

[version-image]: https://img.shields.io/npm/v/tslint-tinypg.svg?style=flat
[version-url]: https://www.npmjs.com/package/tslint-tinypg
[travis-image]: https://travis-ci.org/smerchek/tslint-tinypg.svg?branch=master&style=flat
[travis-url]: https://travis-ci.org/smerchek/tslint-tinypg
[license-image]: https://img.shields.io/github/license/smerchek/tslint-tinypg.svg?style=flat
[license-url]: https://opensource.org/licenses/MIT
