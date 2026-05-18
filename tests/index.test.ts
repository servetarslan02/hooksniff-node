import { describe, it, mock, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { HookSniff } from "../src/index.js";
import { Webhook } from "../src/webhook.js";
import {
  HookSniffError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  RateLimitError,
  createErrorFromStatus,
} from "../src/errors.js";

describe("HookSniff", () => {
  it("should create a client with default options", () => {
    const hs = new HookSniff("test_token");
    assert.ok(hs);
    assert.ok(hs.endpoint);
    assert.ok(hs.message);
    assert.ok(hs.messageAttempt);
    assert.ok(hs.eventType);
    assert.ok(hs.authentication);
    assert.ok(hs.statistics);
    assert.ok(hs.health);
  });

  it("should throw if no token provided", () => {
    assert.throws(() => new HookSniff(""), {
      message: /token/i,
    });
  });
});

describe("Webhook", () => {
  const secret = "whsec_dGVzdA=="; // base64("test")
  const msgId = "msg_test123";
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = '{"event":"test"}';

  it("should verify a valid webhook signature", () => {
    const wh = new Webhook(secret);
    const signature = wh.sign(msgId, timestamp, payload);

    const headers = {
      "webhook-id": msgId,
      "webhook-timestamp": String(timestamp),
      "webhook-signature": `v1,${signature}`,
    };

    const result = wh.verify(payload, headers);
    assert.deepEqual(result, { event: "test" });
  });

  it("should reject invalid signature", () => {
    const wh = new Webhook(secret);

    const headers = {
      "webhook-id": msgId,
      "webhook-timestamp": String(timestamp),
      "webhook-signature": "v1,invalid_signature",
    };

    assert.throws(() => wh.verify(payload, headers), {
      name: "WebhookVerificationError",
    });
  });

  it("should reject old timestamp", () => {
    const wh = new Webhook(secret);
    const oldTimestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
    const signature = wh.sign(msgId, oldTimestamp, payload);

    const headers = {
      "webhook-id": msgId,
      "webhook-timestamp": String(oldTimestamp),
      "webhook-signature": `v1,${signature}`,
    };

    assert.throws(() => wh.verify(payload, headers), {
      name: "WebhookVerificationError",
    });
  });

  it("should accept svix-branded headers (backward compat)", () => {
    const wh = new Webhook(secret);
    const signature = wh.sign(msgId, timestamp, payload);

    const headers = {
      "svix-id": msgId,
      "svix-timestamp": String(timestamp),
      "svix-signature": `v1,${signature}`,
    };

    const result = wh.verify(payload, headers);
    assert.deepEqual(result, { event: "test" });
  });
});

describe("Errors", () => {
  it("should create BadRequestError for 400", () => {
    const err = createErrorFromStatus(400, { detail: "Invalid input" });
    assert.ok(err instanceof BadRequestError);
    assert.equal(err.statusCode, 400);
    assert.equal(err.message, "Invalid input");
  });

  it("should create UnauthorizedError for 401", () => {
    const err = createErrorFromStatus(401, {});
    assert.ok(err instanceof UnauthorizedError);
    assert.equal(err.statusCode, 401);
  });

  it("should create NotFoundError for 404", () => {
    const err = createErrorFromStatus(404, {});
    assert.ok(err instanceof NotFoundError);
    assert.equal(err.statusCode, 404);
  });

  it("should create RateLimitError for 429 with retry-after", () => {
    const err = createErrorFromStatus(429, {}, { "retry-after": "30" });
    assert.ok(err instanceof RateLimitError);
    assert.equal(err.statusCode, 429);
    assert.equal(err.retryAfter, 30);
  });

  it("should create generic HookSniffError for unknown status", () => {
    const err = createErrorFromStatus(418, { detail: "I'm a teapot" });
    assert.ok(err instanceof HookSniffError);
    assert.equal(err.statusCode, 418);
  });
});

describe("SDK Version", () => {
  it("should have LIB_VERSION defined", async () => {
    const { LIB_VERSION } = await import("../src/request.js");
    assert.ok(LIB_VERSION);
    assert.ok(typeof LIB_VERSION === "string");
  });

  it("should use semver-like format", async () => {
    const { LIB_VERSION } = await import("../src/request.js");
    assert.ok(LIB_VERSION.includes("."), "Version should contain dots");
  });
});

describe("Typed Webhook Events", () => {
  const secret = "whsec_dGVzdA==";
  const msgId = "msg_test123";
  const timestamp = Math.floor(Date.now() / 1000);

  it("should return typed endpoint.created event", () => {
    const wh = new Webhook(secret);
    const payload = JSON.stringify({
      event: "endpoint.created",
      data: { appId: "app_1", endpointId: "ep_1", appUid: "uid_1" },
      timestamp: "2026-05-19T00:00:00Z",
    });
    const signature = wh.sign(msgId, timestamp, payload);
    const headers = {
      "webhook-id": msgId,
      "webhook-timestamp": String(timestamp),
      "webhook-signature": `v1,${signature}`,
    };

    const result = wh.verify(payload, headers);
    assert.equal(result.event, "endpoint.created");
    assert.equal(result.data.appId, "app_1");
    assert.equal(result.data.endpointId, "ep_1");
    assert.equal(result.data.appUid, "uid_1");
  });

  it("should return typed endpoint.disabled event with extras", () => {
    const wh = new Webhook(secret);
    const payload = JSON.stringify({
      event: "endpoint.disabled",
      data: { appId: "a1", endpointId: "e1", failSince: "2026-01", trigger: "repeated-failure" },
      timestamp: "2026-05-19",
    });
    const signature = wh.sign(msgId, timestamp, payload);
    const headers = {
      "webhook-id": msgId,
      "webhook-timestamp": String(timestamp),
      "webhook-signature": `v1,${signature}`,
    };

    const result = wh.verify(payload, headers);
    assert.equal(result.event, "endpoint.disabled");
    assert.equal(result.data.failSince, "2026-01");
    assert.equal(result.data.trigger, "repeated-failure");
  });

  it("should return typed message.attempt.exhausted event", () => {
    const wh = new Webhook(secret);
    const payload = JSON.stringify({
      event: "message.attempt.exhausted",
      data: {
        appId: "a1",
        msgId: "m1",
        lastAttempt: { id: "att_1", timestamp: "2026-05-19", responseStatusCode: 500 },
      },
      timestamp: "2026-05-19",
    });
    const signature = wh.sign(msgId, timestamp, payload);
    const headers = {
      "webhook-id": msgId,
      "webhook-timestamp": String(timestamp),
      "webhook-signature": `v1,${signature}`,
    };

    const result = wh.verify(payload, headers);
    assert.equal(result.event, "message.attempt.exhausted");
    assert.equal(result.data.msgId, "m1");
    assert.equal(result.data.lastAttempt.responseStatusCode, 500);
  });

  it("should verify and return typed data for all 8 event types", () => {
    const eventTypes = [
      "endpoint.created",
      "endpoint.updated",
      "endpoint.deleted",
      "endpoint.enabled",
      "endpoint.disabled",
      "message.attempt.exhausted",
      "message.atattempt.failing",
      "message.attempt.recovered",
    ];

    const wh = new Webhook(secret);
    for (const eventType of eventTypes) {
      const payload = JSON.stringify({
        event: eventType,
        data: { appId: "a1", endpointId: "e1" },
        timestamp: "2026-05-19",
      });
      const signature = wh.sign(msgId, timestamp, payload);
      const headers = {
        "webhook-id": msgId,
        "webhook-timestamp": String(timestamp),
        "webhook-signature": `v1,${signature}`,
      };

      const result = wh.verify(payload, headers);
      assert.equal(result.event, eventType, `Failed for ${eventType}`);
    }
  });

  it("should handle empty data gracefully", () => {
    const wh = new Webhook(secret);
    const payload = JSON.stringify({ event: "endpoint.created", data: {}, timestamp: "" });
    const signature = wh.sign(msgId, timestamp, payload);
    const headers = {
      "webhook-id": msgId,
      "webhook-timestamp": String(timestamp),
      "webhook-signature": `v1,${signature}`,
    };
    const result = wh.verify(payload, headers);
    assert.equal(result.event, "endpoint.created");
    assert.deepEqual(result.data, {});
  });

  it("should handle unknown event types", () => {
    const wh = new Webhook(secret);
    const payload = JSON.stringify({ event: "custom.unknown", data: { x: 1 }, timestamp: "" });
    const signature = wh.sign(msgId, timestamp, payload);
    const headers = {
      "webhook-id": msgId,
      "webhook-timestamp": String(timestamp),
      "webhook-signature": `v1,${signature}`,
    };
    const result = wh.verify(payload, headers);
    assert.equal(result.event, "custom.unknown");
    assert.equal(result.data.x, 1);
  });

  it("should preserve nested data structures", () => {
    const wh = new Webhook(secret);
    const payload = JSON.stringify({
      event: "endpoint.created",
      data: { appId: "a1", endpointId: "e1", nested: { key: "val" } },
      timestamp: "t",
    });
    const signature = wh.sign(msgId, timestamp, payload);
    const headers = {
      "webhook-id": msgId,
      "webhook-timestamp": String(timestamp),
      "webhook-signature": `v1,${signature}`,
    };
    const result = wh.verify(payload, headers);
    assert.equal(result.data.nested.key, "val");
  });
});

describe("Webhook Edge Cases", () => {
  const secret = "whsec_dGVzdA==";
  const msgId = "msg_test123";
  const timestamp = Math.floor(Date.now() / 1000);

  it("should accept unbranded headers", () => {
    const wh = new Webhook(secret);
    const payload = '{"event":"test"}';
    const signature = wh.sign(msgId, timestamp, payload);
    const headers = {
      "webhook-id": msgId,
      "webhook-timestamp": String(timestamp),
      "webhook-signature": `v1,${signature}`,
    };
    const result = wh.verify(payload, headers);
    assert.equal(result.event, "test");
  });

  it("should reject missing id header", () => {
    const wh = new Webhook(secret);
    assert.throws(() => wh.verify("{}", {
      "webhook-timestamp": String(timestamp),
      "webhook-signature": "v1,sig",
    }));
  });

  it("should reject missing timestamp header", () => {
    const wh = new Webhook(secret);
    assert.throws(() => wh.verify("{}", {
      "webhook-id": msgId,
      "webhook-signature": "v1,sig",
    }));
  });

  it("should reject missing signature header", () => {
    const wh = new Webhook(secret);
    assert.throws(() => wh.verify("{}", {
      "webhook-id": msgId,
      "webhook-timestamp": String(timestamp),
    }));
  });
});
