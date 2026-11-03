const assert = require("node:assert/strict");
const { test } = require("node:test");
const { assertTransactionSupport } = require("../config/assertTransactionSupport");

const connectionWithTopology = (topology) => ({
  db: {
    admin: () => ({
      command: async () => topology,
    }),
  },
});

test("transaction support accepts replica-set and sharded MongoDB topologies", async () => {
  await assertTransactionSupport(connectionWithTopology({ setName: "rs0" }));
  await assertTransactionSupport(connectionWithTopology({ msg: "isdbgrid" }));
});

test("transaction support rejects standalone MongoDB", async () => {
  await assert.rejects(
    assertTransactionSupport(connectionWithTopology({ isWritablePrimary: true })),
    /configure a replica set or sharded cluster/
  );
});
