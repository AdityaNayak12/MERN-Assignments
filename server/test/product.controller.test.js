import test from "node:test";
import assert from "node:assert/strict";
import Product from "../models/product.model.js";
import {
  createProduct,
  getProductById,
  getProducts,
} from "../controller/product.controller.js";

const productInput = {
  name: "Keyboard",
  description: "Mechanical keyboard",
  price: 99,
  category: "Accessories",
  image: "keyboard.jpg",
  stock: 10,
};

function response() {
  return {
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

test("createProduct creates a product and returns 201", async () => {
  const originalCreate = Product.create;
  const createdProduct = { _id: "product-id", ...productInput };
  Product.create = async (input) => {
    assert.deepEqual(input, productInput);
    return createdProduct;
  };
  const res = response();

  try {
    await createProduct({ body: productInput }, res);
  } finally {
    Product.create = originalCreate;
  }

  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, { success: true, product: createdProduct });
});

test("createProduct rejects missing fields and non-positive prices", async () => {
  const originalCreate = Product.create;
  Product.create = async () => {
    throw new Error("create should not be called");
  };

  try {
    const missingFieldResponse = response();
    await createProduct({ body: { ...productInput, name: "" } }, missingFieldResponse);
    assert.equal(missingFieldResponse.statusCode, 400);

    const zeroPriceResponse = response();
    await createProduct({ body: { ...productInput, price: 0 } }, zeroPriceResponse);
    assert.equal(zeroPriceResponse.statusCode, 400);

    const missingBodyResponse = response();
    await createProduct({ body: undefined }, missingBodyResponse);
    assert.equal(missingBodyResponse.statusCode, 400);
  } finally {
    Product.create = originalCreate;
  }
});

test("createProduct rejects malformed field types with 400", async () => {
  const originalCreate = Product.create;
  Product.create = async () => {
    throw new Error("create should not be called");
  };
  const res = response();

  try {
    await createProduct({ body: { ...productInput, name: 123 } }, res);
  } finally {
    Product.create = originalCreate;
  }

  assert.equal(res.statusCode, 400);
});

test("createProduct maps model validation errors to a generic 400", async () => {
  const originalCreate = Product.create;
  const originalConsoleError = console.error;
  const validationError = new Error("secret schema details");
  validationError.name = "ValidationError";
  Product.create = async () => {
    throw validationError;
  };
  console.error = () => {};
  const res = response();

  try {
    await createProduct({ body: productInput }, res);
  } finally {
    Product.create = originalCreate;
    console.error = originalConsoleError;
  }

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { success: false, message: "Invalid product data" });
});

test("createProduct returns 500 when product creation fails", async () => {
  const originalCreate = Product.create;
  const originalConsoleError = console.error;
  Product.create = async () => {
    throw new Error("database unavailable");
  };
  console.error = () => {};
  const res = response();

  try {
    await createProduct({ body: productInput }, res);
  } finally {
    Product.create = originalCreate;
    console.error = originalConsoleError;
  }

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { success: false, message: "Internal server error" });
});

test("getProducts combines search and category filters and sorts by price", async () => {
  const originalFind = Product.find;
  const products = [{ ...productInput, price: 50 }];
  let query;
  let sort;
  Product.find = (filters) => {
    query = filters;
    return {
      sort(value) {
        sort = value;
        return Promise.resolve(products);
      },
    };
  };
  const res = response();

  try {
    await getProducts(
      { query: { search: "keyboard", category: "Accessories", sort: "price_asc" } },
      res,
    );
  } finally {
    Product.find = originalFind;
  }

  assert.deepEqual(query, {
    name: { $regex: "keyboard", $options: "i" },
    category: "Accessories",
  });
  assert.deepEqual(sort, { price: 1 });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { success: true, count: 1, products });
});

test("getProductById rejects an invalid product ID", async () => {
  const originalFindById = Product.findById;
  Product.findById = async () => {
    throw new Error("findById should not be called");
  };
  const res = response();

  try {
    await getProductById({ params: { id: "invalid-id" } }, res);
  } finally {
    Product.findById = originalFindById;
  }

  assert.equal(res.statusCode, 400);
});

test("getProductById returns 404 when the product does not exist", async () => {
  const originalFindById = Product.findById;
  Product.findById = async () => null;
  const res = response();

  try {
    await getProductById({ params: { id: "507f1f77bcf86cd799439011" } }, res);
  } finally {
    Product.findById = originalFindById;
  }

  assert.equal(res.statusCode, 404);
});

test("getProducts returns a generic 500 response when listing fails", async () => {
  const originalFind = Product.find;
  const originalConsoleError = console.error;
  Product.find = () => {
    throw new Error("database details");
  };
  console.error = () => {};
  const res = response();

  try {
    await getProducts({ query: {} }, res);
  } finally {
    Product.find = originalFind;
    console.error = originalConsoleError;
  }

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { success: false, message: "Internal server error" });
});

test("getProductById returns a generic 500 response when retrieval fails", async () => {
  const originalFindById = Product.findById;
  const originalConsoleError = console.error;
  Product.findById = async () => {
    throw new Error("database details");
  };
  console.error = () => {};
  const res = response();

  try {
    await getProductById({ params: { id: "507f1f77bcf86cd799439011" } }, res);
  } finally {
    Product.findById = originalFindById;
    console.error = originalConsoleError;
  }

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { success: false, message: "Internal server error" });
});
