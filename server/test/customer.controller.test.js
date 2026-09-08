import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import Customer from "../models/customer.model.js";
import { getMe, loginCustomer } from "../controller/customer.controller.js";

test("login looks up customers with the Customer model", async () => {
  const originalFindOne = Customer.findOne;
  const originalJwtSecret = process.env.jwt_secret;
  process.env.jwt_secret = "test-secret";
  Customer.findOne = async () => ({
    _id: "customer-id",
    password: await bcrypt.hash("secret123", 4),
  });

  const response = {
    statusCode: null,
    cookie() {
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };

  try {
    await loginCustomer(
      { body: { email: "customer@example.com", password: "secret123" } },
      response,
    );
  } finally {
    Customer.findOne = originalFindOne;
    if (originalJwtSecret === undefined) {
      delete process.env.jwt_secret;
    } else {
      process.env.jwt_secret = originalJwtSecret;
    }
  }

  assert.equal(response.statusCode, 200);
});

test("getMe returns the authenticated customer", () => {
  const customer = { _id: "customer-id", email: "customer@example.com" };
  const response = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };

  getMe({ user: customer }, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { authenticatedUser: customer });
});
