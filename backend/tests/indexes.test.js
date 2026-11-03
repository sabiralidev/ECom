const assert = require("node:assert/strict");
const { test } = require("node:test");
const { isDeepStrictEqual } = require("node:util");
const Order = require("../models/order");
const Product = require("../models/products");
const User = require("../models/user");

const hasIndex = (model, expected) => model.schema.indexes()
  .some(([fields]) => isDeepStrictEqual(fields, expected));

test("product indexes cover catalogue filters and sort orders", () => {
  for (const index of [
    { createdAt: -1 },
    { isPublished: 1, createdAt: -1 },
    { isPublished: 1, category: 1, createdAt: -1 },
    { isPublished: 1, collections: 1, createdAt: -1 },
    { isPublished: 1, price: 1 },
    { isPublished: 1, rating: -1, createdAt: -1 },
  ]) {
    assert.equal(hasIndex(Product, index), true);
  }
});

test("order and user indexes cover account lookups and admin date sorting", () => {
  assert.equal(hasIndex(Order, { createdAt: -1 }), true);
  assert.equal(hasIndex(Order, { user: 1, createdAt: -1 }), true);
  assert.equal(hasIndex(User, { createdAt: -1 }), true);
});
