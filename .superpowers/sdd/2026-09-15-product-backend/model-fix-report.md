# Product model validation fix

## Status

Implemented the model-level price constraint by changing `price.min` from `0` to `1` in `server/models/product.model.js`.

Added a direct `Product.validateSync()` regression test in `server/test/product.controller.test.js`. The test uses no MongoDB or network connection.

Preserved required fields, `stock.min: 0`, automatic `createdAt`, controller behavior, routes, and auth code.

## Test commands and exact output

### RED reproduction

Command:

```text
node --test --test-name-pattern='Product rejects a zero price during model validation' test/product.controller.test.js
```

Output:

```text
(node:79843) [MONGOOSE] Warning: Mongoose: `Document.prototype.validateSync()` is deprecated and will be removed in Mongoose 10. Use `Document.prototype.validate()` instead.
(Use `node --trace-warnings ...` to show where the warning was created)
✖ Product rejects a zero price during model validation (11.822375ms)
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 208.389792

✖ failing tests:

test at test/product.controller.test.js:32:1
✖ Product rejects a zero price during model validation (11.822375ms)
  AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

    assert.ok(validationError?.errors.price)

      at TestContext.<anonymous> (file:///Users/adinayak18/Desktop/MERN-Assignments/server/test/product.controller.test.js:35:10)
      at Test.runInAsyncScope (node:async_hooks:226:14)
      at Test.run (node:internal/test_runner/test:1397:25)
      at Test.start (node:internal/test_runner/test:1397:25)
      at startSubtestAfterBootstrap (node:internal/test_runner/harness:387:17) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: undefined,
    expected: true,
    operator: '=='
  }

exit_code=1
```

### GREEN regression

Command:

```text
node --test --test-name-pattern='Product rejects a zero price during model validation' test/product.controller.test.js
```

Output:

```text
(node:80426) [MONGOOSE] Warning: Mongoose: `Document.prototype.validateSync()` is deprecated and will be removed in Mongoose 10. Use `Document.prototype.validate()` instead.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ Product rejects a zero price during model validation (7.348291ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 253.247375

exit_code=0
```

### Focused product tests

Command:

```text
node --test test/product.controller.test.js test/product.routes.test.js
```

Output:

```text
(node:80805) [MONGOOSE] Warning: Mongoose: `Document.prototype.validateSync()` is deprecated and will be removed in Mongoose 10. Use `Document.prototype.validate()` instead.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ Product rejects a zero price during model validation (7.048417ms)
✔ createProduct creates a product and returns 201 (1.379ms)
✔ createProduct rejects missing fields and non-positive prices (0.350625ms)
✔ createProduct rejects malformed field types with 400 (0.165458ms)
✔ createProduct rejects whitespace-only required strings (0.161542ms)
✔ createProduct trims required strings before creation (0.193166ms)
✔ createProduct maps model validation errors to a generic 400 (0.25125ms)
✔ createProduct returns 500 when product creation fails (0.19025ms)
✔ getProducts combines search and category filters and sorts by price (0.461708ms)
✔ getProductById rejects an invalid product ID (0.35475ms)
✔ getProducts escapes regex metacharacters and rejects malformed query types (0.219875ms)
✔ getProductById returns 404 when the product does not exist (0.144708ms)
✔ getProducts returns a generic 500 response when listing fails (0.160292ms)
✔ getProductById returns a generic 500 response when retrieval fails (0.17325ms)
✔ registers the product endpoints on the router (1.618708ms)
ℹ tests 15
ℹ suites 0
ℹ pass 15
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 400.370583

exit_code=0
```

### Full server tests

Command:

```text
npm test
```

Output:

```text
> server@1.0.0 test
> node --test

✔ login looks up customers with the Customer model (12.525333ms)
✔ getMe returns the authenticated customer (1.010125ms)
(node:80923) [MONGOOSE] Warning: Mongoose: `Document.prototype.validateSync()` is deprecated and will be removed in Mongoose 10. Use `Document.prototype.validate()` instead.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ Product rejects a zero price during model validation (8.025833ms)
✔ createProduct creates a product and returns 201 (1.236875ms)
✔ createProduct rejects missing fields and non-positive prices (0.205708ms)
✔ createProduct rejects malformed field types with 400 (0.139667ms)
✔ createProduct rejects whitespace-only required strings (0.2765ms)
✔ createProduct trims required strings before creation (0.376666ms)
✔ createProduct maps model validation errors to a generic 400 (0.523083ms)
✔ createProduct returns 500 when product creation fails (0.385125ms)
✔ getProducts combines search and category filters and sorts by price (0.596083ms)
✔ getProductById rejects an invalid product ID (0.480167ms)
✔ getProducts escapes regex metacharacters and rejects malformed query types (0.288459ms)
✔ getProductById returns 404 when the product does not exist (0.179583ms)
✔ getProducts returns a generic 500 response when listing fails (0.176417ms)
✔ getProductById returns a generic 500 response when retrieval fails (0.187917ms)
✔ registers the product endpoints on the router (1.659709ms)
ℹ tests 17
ℹ suites 0
ℹ pass 17
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 477.748875

exit_code=0
```

### Diff whitespace check

Command:

```text
git diff --check
```

Output:

```text
exit_code=0
```

## Concerns

The focused and full runs emit the existing Mongoose warning that `validateSync()` is deprecated in Mongoose 9 and will be removed in Mongoose 10. The requested direct regression test intentionally uses `validateSync()` to verify fresh synchronous model validation without MongoDB/network access.
