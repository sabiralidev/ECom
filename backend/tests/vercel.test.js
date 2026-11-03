const assert = require("node:assert/strict");
const { once } = require("node:events");
const http = require("node:http");
const { test } = require("node:test");
const handler = require("../api");

const startHandlerServer = async () => {
  const server = http.createServer(handler);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return server;
};

const closeServer = (server) => new Promise((resolve, reject) => {
  server.closeAllConnections();
  server.close((error) => error ? reject(error) : resolve());
});

test("Vercel entrypoint is a request handler and serves the health route", async () => {
  assert.equal(typeof handler, "function");
  const server = await startHandlerServer();
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/health`);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), {
      status: "unavailable",
      database: "disconnected",
    });
  } finally {
    await closeServer(server);
  }
});

test("Vercel entrypoint responds to live frontend CORS preflight without a database", async () => {
  const server = await startHandlerServer();
  try {
    for (const origin of [
      "https://e-com-liart-beta.vercel.app",
      "https://e-com-sabir-dev.vercel.app",
    ]) {
      const response = await fetch(`http://127.0.0.1:${server.address().port}/api/products`, {
        method: "OPTIONS",
        headers: {
          Origin: origin,
          "Access-Control-Request-Method": "GET",
          "Access-Control-Request-Headers": "authorization,content-type",
        },
      });
      assert.equal(response.status, 204);
      assert.equal(response.headers.get("access-control-allow-origin"), origin);
      assert.equal(response.headers.get("access-control-allow-credentials"), "true");
    }
  } finally {
    await closeServer(server);
  }
});

test("Vercel API initialization failure keeps CORS headers and returns a service error", async () => {
  const configuredMongoUri = process.env.MONGODB_URI;
  process.env.MONGODB_URI = "";
  const server = await startHandlerServer();
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/products`, {
      headers: { Origin: "https://e-com-liart-beta.vercel.app" },
    });
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("access-control-allow-origin"), "https://e-com-liart-beta.vercel.app");
    assert.match((await response.json()).message, /database is unavailable/i);
  } finally {
    if (configuredMongoUri === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = configuredMongoUri;
    await closeServer(server);
  }
});
