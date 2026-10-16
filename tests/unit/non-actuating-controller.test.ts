import assert from "node:assert/strict";
import test from "node:test";
import { NonActuatingAccessController } from "../../src/lib/access-control/non-actuating-controller.ts";
import type { AccessCommand } from "../../src/lib/access-control/contracts.ts";

const command: AccessCommand = {
  commandId: "cmd-test-1",
  doorId: "door-test-1",
  context: {
    transactionId: "txn-test-1",
    kioskId: "kiosk-test-1",
    organizationId: "org-test-1",
    startedAt: "2026-10-16T00:00:00.000Z",
    challenge: "challenge-test-1",
    policyVersion: "policy-test-1",
  },
  decision: {
    decision: "allow",
    reasonCode: "TEST_ALLOW",
    policyVersion: "policy-test-1",
    decidedAt: "2026-10-16T00:00:00.100Z",
    expiresAt: "2026-10-16T00:00:05.100Z",
  },
};

test("development controller never actuates even for an allow decision", async () => {
  const controller = new NonActuatingAccessController();
  const result = await controller.execute(command, new AbortController().signal);

  assert.equal(result.status, "acknowledged");
  assert.equal(result.actuated, false);
  assert.equal(result.reasonCode, "DEVELOPMENT_NON_ACTUATING");
});

test("development controller respects cancellation", async () => {
  const controller = new NonActuatingAccessController();
  const abort = new AbortController();
  abort.abort();

  await assert.rejects(() => controller.execute(command, abort.signal), {
    name: "AbortError",
  });
});
