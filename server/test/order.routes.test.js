import test from "node:test";
import assert from "node:assert/strict";
import orderRouter from "../routes/order.route.js";

test("registers all order endpoints on the router", () => {
  const registeredEndpoints = orderRouter.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods),
    }));

  const findEndpoint = (path, method) =>
    registeredEndpoints.find(
      (ep) => ep.path === path && ep.methods.includes(method.toLowerCase())
    );

  assert.ok(findEndpoint("/create-payment-order", "POST"), "POST /create-payment-order must be registered");
  assert.ok(findEndpoint("/verify-payment", "POST"), "POST /verify-payment must be registered");
  assert.ok(findEndpoint("/", "GET"), "GET / must be registered");
  assert.ok(findEndpoint("/:id", "GET"), "GET /:id must be registered");
  assert.ok(findEndpoint("/:id/status", "PATCH"), "PATCH /:id/status must be registered");
});
