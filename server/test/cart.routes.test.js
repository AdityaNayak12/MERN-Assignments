import test from "node:test";
import assert from "node:assert/strict";
import cartRoutes from "../routes/cart.route.js";

test("registers the cart endpoints on the router", () => {
  const routes = cartRoutes.stack
    .filter((layer) => layer.route)
    .map(({ route }) => ({
      path: route.path,
      methods: Object.keys(route.methods),
    }));

  assert.deepEqual(routes, [
    { path: "/:productId", methods: ["post"] },
    { path: "/", methods: ["get"] },
    { path: "/:productId", methods: ["patch"] },
    { path: "/:productId", methods: ["delete"] },
  ]);
});
