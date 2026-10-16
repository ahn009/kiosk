import assert from "node:assert/strict";
import test from "node:test";
import { resolveRuntimeConfig } from "../../src/lib/config-schema.ts";

test("demo mode defaults off in development", () => {
  const config = resolveRuntimeConfig({ NODE_ENV: "development" });
  assert.equal(config.stage, "development");
  assert.equal(config.features.demoMode, false);
});

test("demo mode can be explicitly enabled outside production", () => {
  const config = resolveRuntimeConfig({
    DEPLOYMENT_STAGE: "test",
    DEMO_MODE: "true",
  });
  assert.equal(config.features.demoMode, true);
});

test("production rejects demo mode", () => {
  assert.throws(
    () => resolveRuntimeConfig({ DEPLOYMENT_STAGE: "production", DEMO_MODE: "true" }),
    /DEMO_MODE cannot be enabled/,
  );
});

test("invalid stage and boolean values fail closed", () => {
  assert.throws(() => resolveRuntimeConfig({ DEPLOYMENT_STAGE: "prod" }));
  assert.throws(() => resolveRuntimeConfig({ DEMO_MODE: "yes" }));
});
