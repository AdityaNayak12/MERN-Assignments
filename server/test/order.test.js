import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Customer from "../models/customer.model.js";
import {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  validateShippingAddress,
} from "../controller/order.controller.js";

const validUserId = new mongoose.Types.ObjectId().toString();
const validUserId2 = new mongoose.Types.ObjectId().toString();
const validProductId = new mongoose.Types.ObjectId().toString();

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

const validShippingAddress = {
  fullName: "Aarav Sharma",
  phone: "9876543210",
  addressLine1: "22 MG Road",
  city: "Bengaluru",
  state: "Karnataka",
  pincode: "560001",
};

test("Order schema validation requires all mandatory fields and snapshots", async () => {
  const order = new Order({
    user: validUserId,
    items: [
      {
        product: validProductId,
        name: "Mechanical Keyboard",
        price: 2999,
        quantity: 2,
        image: "keyboard.png",
      },
    ],
    shippingAddress: validShippingAddress,
    totalAmount: 5998,
    status: "PENDING_PAYMENT",
    paymentStatus: "PENDING",
  });

  const err = order.validateSync();
  assert.equal(err, undefined, "Valid order should pass validation");
  assert.equal(order.items[0].name, "Mechanical Keyboard");
  assert.equal(order.items[0].price, 2999);
  assert.equal(order.totalAmount, 5998);
});

test("Order schema rejects empty items array or invalid status enums", async () => {
  const emptyOrder = new Order({
    user: validUserId,
    items: [],
    shippingAddress: validShippingAddress,
    totalAmount: 0,
  });
  const err = emptyOrder.validateSync();
  assert.ok(err?.errors?.items, "Should reject empty items array");

  const invalidStatusOrder = new Order({
    user: validUserId,
    items: [
      {
        product: validProductId,
        name: "Item",
        price: 10,
        quantity: 1,
      },
    ],
    shippingAddress: validShippingAddress,
    totalAmount: 10,
    status: "INVALID_STATUS",
  });
  const statusErr = invalidStatusOrder.validateSync();
  assert.ok(statusErr?.errors?.status, "Should reject invalid status enum");
});

test("validateShippingAddress validates required fields, phone format and pincode format", () => {
  assert.equal(validateShippingAddress(validShippingAddress), null);

  assert.ok(validateShippingAddress(null));
  assert.ok(validateShippingAddress({ ...validShippingAddress, fullName: "   " }));
  assert.ok(validateShippingAddress({ ...validShippingAddress, phone: "123" })); // Not 10 digits
  assert.ok(validateShippingAddress({ ...validShippingAddress, pincode: "1234" })); // Not 6 digits
});

test("createPaymentOrder rejects invalid shipping address with 400", async () => {
  const req = {
    user: { _id: validUserId },
    body: { shippingAddress: { fullName: "" } },
  };
  const res = mockResponse();

  await createPaymentOrder(req, res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
});

test("createPaymentOrder rejects empty cart with 400", async () => {
  const originalFindById = Customer.findById;
  Customer.findById = async () => ({
    _id: validUserId,
    cart: [],
  });

  try {
    const req = {
      user: { _id: validUserId },
      body: { shippingAddress: validShippingAddress },
    };
    const res = mockResponse();

    await createPaymentOrder(req, res);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.message, "Cart is empty");
  } finally {
    Customer.findById = originalFindById;
  }
});

test("createPaymentOrder rejects when stock is insufficient with 400", async () => {
  const originalCustomerFind = Customer.findById;
  const originalProductFind = Product.findById;

  Customer.findById = async () => ({
    _id: validUserId,
    cart: [{ product: validProductId, quantity: 5 }],
  });

  Product.findById = async () => ({
    _id: validProductId,
    name: "Wireless Mouse",
    price: 1200,
    stock: 2, // only 2 available, requested 5
  });

  try {
    const req = {
      user: { _id: validUserId },
      body: { shippingAddress: validShippingAddress },
    };
    const res = mockResponse();

    await createPaymentOrder(req, res);
    assert.equal(res.statusCode, 400);
    assert.ok(res.body.message.includes("Insufficient stock"));
  } finally {
    Customer.findById = originalCustomerFind;
    Product.findById = originalProductFind;
  }
});

test("createPaymentOrder calculates total on server, ignoring fake client total", async () => {
  const originalCustomerFind = Customer.findById;
  const originalProductFind = Product.findById;
  const originalOrderSave = Order.prototype.save;

  let savedOrderData = null;
  Order.prototype.save = async function () {
    savedOrderData = this;
    return this;
  };

  Customer.findById = async () => ({
    _id: validUserId,
    cart: [{ product: validProductId, quantity: 3 }],
  });

  Product.findById = async () => ({
    _id: validProductId,
    name: "Keyboard",
    price: 1500,
    stock: 10,
    image: "keyboard.jpg",
  });

  try {
    const req = {
      user: { _id: validUserId },
      body: {
        shippingAddress: validShippingAddress,
        totalAmount: 1, // Fake client amount should be ignored!
      },
    };
    const res = mockResponse();

    await createPaymentOrder(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.amount, 450000); // 1500 * 3 = 4500 INR -> 450000 paise
    assert.equal(savedOrderData.totalAmount, 4500);
    assert.equal(savedOrderData.status, "PENDING_PAYMENT");
    assert.equal(savedOrderData.items[0].price, 1500);
    assert.equal(savedOrderData.items[0].quantity, 3);
  } finally {
    Customer.findById = originalCustomerFind;
    Product.findById = originalProductFind;
    Order.prototype.save = originalOrderSave;
  }
});

test("verifyPayment rejects invalid signature with 400 and preserves cart", async () => {
  const originalOrderFind = Order.findById;
  const originalOrderSave = Order.prototype.save;

  const mockOrderInstance = {
    _id: new mongoose.Types.ObjectId(),
    user: validUserId,
    razorpayOrderId: "order_mock_123",
    paymentStatus: "PENDING",
    status: "PENDING_PAYMENT",
    items: [],
    async save() {
      return this;
    },
  };

  Order.findById = async () => mockOrderInstance;

  try {
    const req = {
      user: { _id: validUserId },
      body: {
        shopKartOrderId: mockOrderInstance._id.toString(),
        razorpay_order_id: "order_mock_123",
        razorpay_payment_id: "pay_mock_456",
        razorpay_signature: "invalid_fake_signature_hex",
      },
    };
    const res = mockResponse();

    await verifyPayment(req, res);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.message, "Invalid payment signature");
    assert.equal(mockOrderInstance.paymentStatus, "FAILED");
  } finally {
    Order.findById = originalOrderFind;
    Order.prototype.save = originalOrderSave;
  }
});

test("verifyPayment accepts valid signature, marks PAID + PLACED, and clears cart", async () => {
  const originalOrderFind = Order.findById;
  const originalCustomerFind = Customer.findById;
  const originalProductUpdate = Product.findByIdAndUpdate;

  const secret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret_shopkart";
  const razorpayOrderId = "order_test_correct_123";
  const razorpayPaymentId = "pay_test_correct_456";
  const validSignature = crypto
    .createHmac("sha256", secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  const mockOrderInstance = {
    _id: new mongoose.Types.ObjectId(),
    user: validUserId,
    razorpayOrderId: razorpayOrderId,
    paymentStatus: "PENDING",
    status: "PENDING_PAYMENT",
    items: [{ product: validProductId, quantity: 2 }],
    async save() {
      return this;
    },
  };

  const mockCustomerInstance = {
    _id: validUserId,
    cart: [{ product: validProductId, quantity: 2 }],
    async save() {
      return this;
    },
  };

  let productStockDecremented = false;
  Product.findByIdAndUpdate = async (id, update) => {
    if (update?.$inc?.stock === -2) productStockDecremented = true;
    return true;
  };

  Order.findById = async () => mockOrderInstance;
  Customer.findById = async () => mockCustomerInstance;

  try {
    const req = {
      user: { _id: validUserId },
      body: {
        shopKartOrderId: mockOrderInstance._id.toString(),
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: validSignature,
      },
    };
    const res = mockResponse();

    await verifyPayment(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(mockOrderInstance.paymentStatus, "PAID");
    assert.equal(mockOrderInstance.status, "PLACED");
    assert.equal(mockOrderInstance.razorpayPaymentId, razorpayPaymentId);
    assert.equal(mockCustomerInstance.cart.length, 0, "Cart should be emptied");
    assert.equal(productStockDecremented, true, "Product stock should be decremented");
  } finally {
    Order.findById = originalOrderFind;
    Customer.findById = originalCustomerFind;
    Product.findByIdAndUpdate = originalProductUpdate;
  }
});

test("getOrderById enforces ownership and returns 403 when accessed by another user", async () => {
  const orderId = new mongoose.Types.ObjectId().toString();
  const originalOrderFind = Order.findById;

  Order.findById = async () => ({
    _id: orderId,
    user: validUserId, // Owned by validUserId
    totalAmount: 1000,
  });

  try {
    const req = {
      user: { _id: validUserId2 }, // Attempted by validUserId2
      params: { id: orderId },
    };
    const res = mockResponse();

    await getOrderById(req, res);
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.message, "Access denied");
  } finally {
    Order.findById = originalOrderFind;
  }
});

test("updateOrderStatus updates status to allowed progression values", async () => {
  const orderId = new mongoose.Types.ObjectId().toString();
  const originalOrderFind = Order.findById;

  const mockOrder = {
    _id: orderId,
    status: "PLACED",
    async save() {
      return this;
    },
  };

  Order.findById = async () => mockOrder;

  try {
    const req = {
      params: { id: orderId },
      body: { status: "CONFIRMED" },
    };
    const res = mockResponse();

    await updateOrderStatus(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(mockOrder.status, "CONFIRMED");

    // Invalid status test
    const reqInvalid = {
      params: { id: orderId },
      body: { status: "FLYING" },
    };
    const resInvalid = mockResponse();
    await updateOrderStatus(reqInvalid, resInvalid);
    assert.equal(resInvalid.statusCode, 400);
  } finally {
    Order.findById = originalOrderFind;
  }
});
