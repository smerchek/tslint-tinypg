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

This rule enforces that the object passed to a tiny `.sql` call must have every property used inside the SQL file.

This is typically an error because you _think_ that you are using that property, but you actually aren't.

Given:

```sql
SELECT *
FROM user
WHERE user.name = :name
```
in `users.fetch`

```typescript
import { TinyPg } from 'tinypg'

const db = new TinyPg({
   connection_string: 'postgres://postgres@localhost:5432/mydb',
   root_dir: __dirname + '/sql_files'
})

// NOT OK
db.sql('users.fetch', {
   name: 'Joe',
   enabled: false,
})

//OK
db.sql('users.fetch', {
   name: 'Joe',
})
```


### no-missing-sql-file

This rule enforces all tiny calls to `.sql` reference a valid SQL file.

Given:

```
├── sql_files
│   ├── fetch_user.sql
│   └── users
│       └── fetch.sql
```

```typescript
import { TinyPg } from 'tinypg'

const db = new TinyPg({
   connection_string: 'postgres://postgres@localhost:5432/mydb',
   root_dir: __dirname + '/sql_files'
})

// NOT OK
db.sql('users.create', {
   name: 'Joe',
})

//OK
db.sql('users.fetch', {
   name: 'Joe',
})

db.sql('fetch_user', {
   name: 'Joe',
})
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
