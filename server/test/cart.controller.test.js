import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
} from "../controller/cart.controller.js";

const validProductId1 = new mongoose.Types.ObjectId().toString();
const validProductId2 = new mongoose.Types.ObjectId().toString();
const validUserId = new mongoose.Types.ObjectId().toString();

function mockResponse() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function mockUser(initialCart = []) {
  return {
    _id: validUserId,
    cart: initialCart.map((item) => ({ ...item })),
    async save() {
      return this;
    },
    async populate() {
      return this;
    },
  };
}

test("Customer schema validates cart item quantity >= 1", async () => {
  const customer = new Customer({
    fullName: "Jane Doe",
    email: "jane@example.com",
    password: "hashedpassword",
    phone: "1234567890",
    cart: [
      {
        product: new mongoose.Types.ObjectId(),
        quantity: 0,
      },
    ],
  });

  await assert.rejects(
    customer.validate(),
    (err) => Boolean(err?.errors?.["cart.0.quantity"])
  );
});

test("addToCart rejects invalid product ID format with 400", async () => {
  const req = {
    params: { productId: "invalid-id" },
    user: mockUser(),
  };
  const res = mockResponse();

  await addToCart(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
});

test("addToCart returns 404 when product does not exist", async () => {
  const originalFindById = Product.findById;
  Product.findById = async () => null;
  const req = {
    params: { productId: validProductId1 },
    user: mockUser(),
  };
  const res = mockResponse();

  try {
    await addToCart(req, res);
  } finally {
    Product.findById = originalFindById;
  }

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.success, false);
});

test("addToCart adds a new product to cart with quantity 1", async () => {
  const originalFindById = Product.findById;
  Product.findById = async (id) => ({
    _id: id,
    name: "Keyboard",
    stock: 5,
  });
  const user = mockUser([]);
  const req = {
    params: { productId: validProductId1 },
    user,
  };
  const res = mockResponse();

  try {
    await addToCart(req, res);
  } finally {
    Product.findById = originalFindById;
  }

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(user.cart.length, 1);
  assert.equal(user.cart[0].product.toString(), validProductId1);
  assert.equal(user.cart[0].quantity, 1);
});

test("addToCart increments quantity by 1 when product already in cart", async () => {
  const originalFindById = Product.findById;
  Product.findById = async (id) => ({
    _id: id,
    name: "Keyboard",
    stock: 5,
  });
  const user = mockUser([{ product: validProductId1, quantity: 2 }]);
  const req = {
    params: { productId: validProductId1 },
    user,
  };
  const res = mockResponse();

  try {
    await addToCart(req, res);
  } finally {
    Product.findById = originalFindById;
  }

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(user.cart.length, 1);
  assert.equal(user.cart[0].quantity, 3);
});

test("addToCart rejects with 400 when quantity would exceed stock", async () => {
  const originalFindById = Product.findById;
  Product.findById = async (id) => ({
    _id: id,
    name: "Keyboard",
    stock: 2,
  });
  const user = mockUser([{ product: validProductId1, quantity: 2 }]);
  const req = {
    params: { productId: validProductId1 },
    user,
  };
  const res = mockResponse();

  try {
    await addToCart(req, res);
  } finally {
    Product.findById = originalFindById;
  }

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /stock/i);
});

test("getCart returns user cart with 200", async () => {
  const originalFindById = Customer.findById;
  const populatedCart = [
    {
      product: {
        _id: validProductId1,
        name: "Mechanical Keyboard",
        price: 2999,
        stock: 10,
      },
      quantity: 2,
    },
  ];

  Customer.findById = (id) => ({
    populate: async () => ({
      _id: id,
      cart: populatedCart,
    }),
  });

  const req = {
    user: { _id: validUserId },
  };
  const res = mockResponse();

  try {
    await getCart(req, res);
  } finally {
    Customer.findById = originalFindById;
  }

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.deepEqual(res.body.cart, populatedCart);
});

test("updateCartQuantity rejects invalid quantity (< 1 or non-integer) with 400", async () => {
  const invalidQuantities = [0, -2, 1.5, "3", undefined, null];

  for (const qty of invalidQuantities) {
    const req = {
      params: { productId: validProductId1 },
      body: { quantity: qty },
      user: mockUser([{ product: validProductId1, quantity: 1 }]),
    };
    const res = mockResponse();
    await updateCartQuantity(req, res);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
  }
});

test("updateCartQuantity returns 404 when product is not in user cart", async () => {
  const req = {
    params: { productId: validProductId2 },
    body: { quantity: 3 },
    user: mockUser([{ product: validProductId1, quantity: 1 }]),
  };
  const res = mockResponse();

  await updateCartQuantity(req, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /not in cart/i);
});

test("updateCartQuantity rejects with 400 when quantity exceeds stock", async () => {
  const originalFindById = Product.findById;
  Product.findById = async (id) => ({
    _id: id,
    name: "Keyboard",
    stock: 4,
  });

  const user = mockUser([{ product: validProductId1, quantity: 2 }]);
  const req = {
    params: { productId: validProductId1 },
    body: { quantity: 5 },
    user,
  };
  const res = mockResponse();

  try {
    await updateCartQuantity(req, res);
  } finally {
    Product.findById = originalFindById;
  }

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /stock/i);
});

test("updateCartQuantity updates quantity and returns 200", async () => {
  const originalFindById = Product.findById;
  Product.findById = async (id) => ({
    _id: id,
    name: "Keyboard",
    stock: 10,
  });

  const user = mockUser([{ product: validProductId1, quantity: 2 }]);
  const req = {
    params: { productId: validProductId1 },
    body: { quantity: 4 },
    user,
  };
  const res = mockResponse();

  try {
    await updateCartQuantity(req, res);
  } finally {
    Product.findById = originalFindById;
  }

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(user.cart[0].quantity, 4);
});

test("removeFromCart returns 404 if product not in cart", async () => {
  const user = mockUser([{ product: validProductId1, quantity: 1 }]);
  const req = {
    params: { productId: validProductId2 },
    user,
  };
  const res = mockResponse();

  await removeFromCart(req, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /not in cart/i);
});

test("removeFromCart removes product from cart and returns 200", async () => {
  const user = mockUser([
    { product: validProductId1, quantity: 2 },
    { product: validProductId2, quantity: 1 },
  ]);
  const req = {
    params: { productId: validProductId1 },
    user,
  };
  const res = mockResponse();

  await removeFromCart(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(user.cart.length, 1);
  assert.equal(user.cart[0].product.toString(), validProductId2);
});
