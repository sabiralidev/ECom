const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const { test } = require("node:test");

test("structured logger redacts credentials and cookies", () => {
  const script = [
    'const logger = require("./utils/logger");',
    'logger.info({ password: "plain-password", token: "plain-token",',
    'authorization: "Bearer plain-authorization", cookie: "plain-cookie",',
    'user: { password: "nested-password" } }, "redaction test");',
  ].join(" ");
  const result = spawnSync(process.execPath, ["-e", script], {
    cwd: path.resolve(__dirname, ".."),
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr);
  const log = JSON.parse(result.stdout.trim());
  for (const secret of [
    "plain-password",
    "plain-token",
    "plain-authorization",
    "plain-cookie",
    "nested-password",
  ]) {
    assert.equal(result.stdout.includes(secret), false);
  }
  assert.equal(log.password, "[Redacted]");
  assert.equal(log.user.password, "[Redacted]");
});
