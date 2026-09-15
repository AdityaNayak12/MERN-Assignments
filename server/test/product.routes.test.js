import test from "node:test";
import assert from "node:assert/strict";
import productRoutes from "../routes/product.route.js";

test("registers the product endpoints on the router", () => {
  const routes = productRoutes.stack.map(({ route }) => ({
    path: route.path,
    methods: Object.keys(route.methods),
  }));

  assert.deepEqual(routes, [
    { path: "/", methods: ["post"] },
    { path: "/", methods: ["get"] },
    { path: "/:id", methods: ["get"] },
  ]);
});
