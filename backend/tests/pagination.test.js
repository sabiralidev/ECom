const assert = require("node:assert/strict");
const { after, test } = require("node:test");
const Order = require("../models/order");
const Product = require("../models/products");
const User = require("../models/user");
const { getAdminUsers } = require("../controllers/Admin/adminControllers");
const { getAdminOrders } = require("../controllers/Admin/adminOrderControllers");
const { getAdminProducts } = require("../controllers/Admin/productAdminControllers");
const { getAllProducts } = require("../controllers/productControllers");
const { getMyOrder } = require("../controllers/orderControllers");
const { parsePagination } = require("../utils/pagination");

const originalProductFind = Product.find;
const originalProductCountDocuments = Product.countDocuments;
const originalOrderFind = Order.find;
const originalOrderCountDocuments = Order.countDocuments;
const originalUserFind = User.find;
const originalUserCountDocuments = User.countDocuments;

after(() => {
  Product.find = originalProductFind;
  Product.countDocuments = originalProductCountDocuments;
  Order.find = originalOrderFind;
  Order.countDocuments = originalOrderCountDocuments;
  User.find = originalUserFind;
  User.countDocuments = originalUserCountDocuments;
});

const makeQuery = (items, calls) => {
  const query = {
    sort(value) {
      calls.sort = value;
      return this;
    },
    populate() {
      return this;
    },
    select(value) {
      calls.select = value;
      return this;
    },
    skip(value) {
      calls.skip = value;
      return this;
    },
    limit(value) {
      calls.limit = value;
      return this;
    },
    lean() {
      calls.lean = true;
      return this;
    },
    exec: async () => items,
    then(resolve, reject) {
      return this.exec().then(resolve, reject);
    },
  };
  return query;
};

const response = () => ({
  statusCode: 200,
  headers: {},
  status(code) {
    this.statusCode = code;
    return this;
  },
  set(headers) {
    Object.assign(this.headers, headers);
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

const assertPage = (res, calls) => {
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, [{ id: "page-item" }]);
  assert.equal(calls.skip, 10);
  assert.equal(calls.limit, 10);
  assert.deepEqual(res.headers, {
    "X-Total-Count": "31",
    "X-Page": "2",
    "X-Limit": "10",
    "X-Total-Pages": "4",
  });
};

test("pagination parser defaults page size and rejects invalid or excessive values", () => {
  assert.equal(parsePagination({}), null);
  assert.deepEqual(parsePagination({ page: "2" }), {
    page: 2,
    limit: 25,
    skip: 25,
  });
  assert.match(parsePagination({ page: "0" }).error, /positive integer/);
  assert.match(parsePagination({ page: "1", limit: "101" }).error, /between 1 and 100/);
  assert.match(parsePagination({ page: "1.5" }).error, /positive integer/);
});

test("public product pagination keeps array response and returns metadata headers", async () => {
  const calls = {};
  Product.find = (filter) => {
    calls.filter = filter;
    return makeQuery([{ id: "page-item" }], calls);
  };
  Product.countDocuments = async (filter) => {
    calls.countFilter = filter;
    return 31;
  };

  const res = response();
  await getAllProducts({ query: { page: "2", limit: "10" } }, res);

  assertPage(res, calls);
  assert.deepEqual(calls.filter, { isPublished: true });
  assert.deepEqual(calls.countFilter, { isPublished: true });
});

test("admin product, order, and user lists support opt-in pagination", async () => {
  const cases = [
    { model: Product, handler: getAdminProducts, request: { query: {} } },
    { model: Order, handler: getAdminOrders, request: { query: {} } },
    { model: User, handler: getAdminUsers, request: { query: {} } },
  ];

  for (const { model, handler, request } of cases) {
    const calls = {};
    model.find = (filter) => {
      calls.filter = filter;
      return makeQuery([{ id: "page-item" }], calls);
    };
    model.countDocuments = async (filter) => {
      calls.countFilter = filter;
      return 31;
    };
    request.query.page = "2";
    request.query.limit = "10";

    const res = response();
    await handler(request, res);
    assertPage(res, calls);
    assert.deepEqual(calls.filter, {});
    assert.deepEqual(calls.countFilter, {});
  }
});

test("user order history supports opt-in pagination", async () => {
  const userId = "customer-1";
  const calls = {};
  Order.find = (filter) => {
    calls.filter = filter;
    return makeQuery([{ id: "page-item" }], calls);
  };
  Order.countDocuments = async (filter) => {
    calls.countFilter = filter;
    return 31;
  };

  const res = response();
  await getMyOrder({
    query: { page: "2", limit: "10" },
    user: { _id: userId },
  }, res);

  assertPage(res, calls);
  assert.deepEqual(calls.filter, { user: userId });
  assert.deepEqual(calls.countFilter, { user: userId });
});

test("legacy product limit-only requests keep their existing behavior", async () => {
  const calls = {};
  Product.find = (filter) => {
    calls.filter = filter;
    return makeQuery([{ id: "limited-item" }], calls);
  };
  Product.countDocuments = async () => {
    calls.counted = true;
    return 1;
  };

  const res = response();
  await getAllProducts({ query: { limit: "2" } }, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, [{ id: "limited-item" }]);
  assert.equal(calls.limit, 2);
  assert.equal(calls.skip, undefined);
  assert.equal(calls.counted, undefined);
  assert.deepEqual(res.headers, {});
});
