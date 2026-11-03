const assert = require("node:assert/strict");
const { test } = require("node:test");
const { sendError, sendSuccess } = require("../utils/apiResponse");

const response = () => ({
  statusCode: undefined,
  body: undefined,
  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

test("success responses wrap data and preserve the requested status", () => {
  const res = response();
  const payload = [{ id: "product-1" }];

  sendSuccess(res, payload, 201);

  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, { data: payload });

  const defaultStatusRes = response();
  sendSuccess(defaultStatusRes, payload);
  assert.equal(defaultStatusRes.statusCode, 200);
  assert.deepEqual(defaultStatusRes.body, { data: payload });
});

test("error responses use a message and stable code", () => {
  const res = response();

  sendError(res, 422, "INVALID_INPUT", "Request validation failed");

  assert.equal(res.statusCode, 422);
  assert.deepEqual(res.body, {
    message: "Request validation failed",
    code: "INVALID_INPUT",
  });
});
