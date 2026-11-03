const assert = require("node:assert/strict");
const { once } = require("node:events");
const { test } = require("node:test");
const mongoose = require("mongoose");
const { app } = require("../server");

test("health endpoint reports unavailable when MongoDB is disconnected", async () => {
  assert.notEqual(mongoose.connection.readyState, 1);

  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");

  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/health`, {
      headers: { Connection: "close" },
    });

    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), {
      status: "unavailable",
      database: "disconnected",
    });
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});
