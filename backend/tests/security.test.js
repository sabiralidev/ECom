const assert = require("node:assert/strict");
const { test } = require("node:test");
const { hasValidImageSignature } = require("../controllers/uploadControllers");
const { sanitizeRequest } = require("../Middleware/sanitizeRequest");
const {
  checkoutSchema,
  registerSchema,
  validateRequest,
} = require("../Middleware/requestValidation");

const response = () => ({
  statusCode: 200,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

test("registration validation accepts current field contract and rejects invalid input", () => {
  const validResponse = response();
  let nextCalled = false;
  const validReq = {
    body: { name: " Customer ", email: "customer@example.com ", password: "secret1" },
  };
  validateRequest(registerSchema)(
    validReq,
    validResponse,
    () => { nextCalled = true; }
  );
  assert.equal(nextCalled, true);
  assert.deepEqual(validReq.body, {
    name: "Customer",
    email: "customer@example.com",
    password: "secret1",
  });

  const invalidResponse = response();
  validateRequest(registerSchema)(
    { body: { name: { $ne: null }, email: "not-an-email", password: "123" } },
    invalidResponse,
    () => assert.fail("next should not run for invalid registration")
  );
  assert.equal(invalidResponse.statusCode, 400);
  assert.equal(invalidResponse.body.message, "Request validation failed");
});

test("checkout validation preserves client snapshots while validating trusted fields", () => {
  const result = checkoutSchema.safeParse({
    checkoutItems: [{
      productId: "665f1b2c3d4e5f6789012345",
      quantity: "2",
      name: "Client snapshot",
      price: 1,
      image: "https://example.test/untrusted.webp",
    }],
    shippingAddress: {
      address: "12 Main Street",
      city: "Lahore",
      postalCode: "00540",
      country: "Pakistan",
      phone: "+92 300 0000000",
    },
    paymentMethod: "COD",
    totalPrice: 2,
  });

  assert.equal(result.success, true);
});

test("NoSQL operators are removed from body and query but raw Stripe payload is untouched", () => {
  const req = {
    originalUrl: "/api/products?filter",
    body: { email: { $ne: null } },
    params: {},
    query: { price: { $gt: 10 } },
  };
  let nextCalled = false;
  sanitizeRequest(req, response(), () => { nextCalled = true; });

  assert.equal(nextCalled, true);
  assert.deepEqual(req.body, { email: {} });
  assert.deepEqual(req.query, { price: {} });

  const webhookBody = Buffer.from('{"id":"evt_test"}');
  const webhookReq = {
    originalUrl: "/api/checkout/webhook",
    body: webhookBody,
  };
  sanitizeRequest(webhookReq, response(), () => {});
  assert.equal(webhookReq.body, webhookBody);
});

test("image upload checks file signatures against declared MIME types", () => {
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.equal(hasValidImageSignature({ mimetype: "image/png", buffer: png }), true);
  assert.equal(hasValidImageSignature({ mimetype: "image/jpeg", buffer: png }), false);
  assert.equal(hasValidImageSignature({ mimetype: "image/gif", buffer: Buffer.from("GIF89a") }), true);
  assert.equal(hasValidImageSignature({ mimetype: "image/webp", buffer: Buffer.from("RIFF0000WEBP") }), true);
});
