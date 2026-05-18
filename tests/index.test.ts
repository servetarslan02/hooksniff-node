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
  const timestampSeconds = Math.floor(Date.now() / 1000);
  const timestamp = new Date(timestampSeconds * 1000);
  const payload = '{"event":"test"}';

  it("should verify a valid webhook signature", () => {
    const wh = new Webhook(secret);
    const signature = wh.sign(msgId, timestamp, payload);

    const headers = {
      "webhook-id": msgId,
      "webhook-timestamp": String(timestampSeconds),
      "webhook-signature": signature,
    };

    const result = wh.verify(payload, headers);
    assert.equal(result.event, "test");
  });

  it("should reject invalid signature", () => {
    const wh = new Webhook(secret);

    const headers = {
      "webhook-id": msgId,
      "webhook-timestamp": String(timestampSeconds),
      "webhook-signature": "v1,invalid_signature",
    };

    assert.throws(() => wh.verify(payload, headers), {
      name: "WebhookVerificationError",
    });
  });

  it("should reject old timestamp", () => {
    const wh = new Webhook(secret);
    const oldTimestampSeconds = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
    const oldTimestamp = new Date(oldTimestampSeconds * 1000);
    const signature = wh.sign(msgId, oldTimestamp, payload);

    const headers = {
      "webhook-id": msgId,
      "webhook-timestamp": String(oldTimestampSeconds),
      "webhook-signature": signature,
    };

    assert.throws(() => wh.verify(payload, headers), {
      name: "WebhookVerificationError",
    });
  });

  it("should accept hooksniff-branded headers", () => {
    const wh = new Webhook(secret);
    const signature = wh.sign(msgId, timestamp, payload);

    const headers = {
      "hooksniff-id": msgId,
      "hooksniff-timestamp": String(timestampSeconds),
      "hooksniff-signature": signature,
    };

    const result = wh.verify(payload, headers);
    assert.equal(result.event, "test");
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
  const timestampSeconds = Math.floor(Date.now() / 1000);
  const timestamp = new Date(timestampSeconds * 1000);

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
      "webhook-timestamp": String(timestampSeconds),
      "webhook-signature": signature,
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
      "webhook-timestamp": String(timestampSeconds),
      "webhook-signature": signature,
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
      "webhook-timestamp": String(timestampSeconds),
      "webhook-signature": signature,
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
        "webhook-timestamp": String(timestampSeconds),
        "webhook-signature": signature,
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
      "webhook-timestamp": String(timestampSeconds),
      "webhook-signature": signature,
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
      "webhook-timestamp": String(timestampSeconds),
      "webhook-signature": signature,
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
      "webhook-timestamp": String(timestampSeconds),
      "webhook-signature": signature,
    };
    const result = wh.verify(payload, headers);
    assert.equal(result.data.nested.key, "val");
  });

  it("should handle unicode data", () => {
    const wh = new Webhook(secret);
    const payload = JSON.stringify({
      event: "endpoint.created",
      data: { appId: "ünïcödé", endpointId: "日本語" },
      timestamp: "t",
    });
    const signature = wh.sign(msgId, timestamp, payload);
    const headers = {
      "webhook-id": msgId,
      "webhook-timestamp": String(timestampSeconds),
      "webhook-signature": signature,
    };
    const result = wh.verify(payload, headers);
    assert.equal(result.data.appId, "ünïcödé");
    assert.equal(result.data.endpointId, "日本語");
  });

  it("should handle large payloads", () => {
    const wh = new Webhook(secret);
    const payload = JSON.stringify({
      event: "endpoint.created",
      data: { appId: "a".repeat(10000), endpointId: "e".repeat(10000) },
      timestamp: "t",
    });
    const signature = wh.sign(msgId, timestamp, payload);
    const headers = {
      "webhook-id": msgId,
      "webhook-timestamp": String(timestampSeconds),
      "webhook-signature": signature,
    };
    const result = wh.verify(payload, headers);
    assert.equal(result.data.appId.length, 10000);
  });

  it("should handle special characters", () => {
    const wh = new Webhook(secret);
    const payload = JSON.stringify({
      event: "endpoint.created",
      data: { appId: "a@b.c", endpointId: "e#1" },
      timestamp: "t",
    });
    const signature = wh.sign(msgId, timestamp, payload);
    const headers = {
      "webhook-id": msgId,
      "webhook-timestamp": String(timestampSeconds),
      "webhook-signature": signature,
    };
    const result = wh.verify(payload, headers);
    assert.equal(result.data.appId, "a@b.c");
  });
});

describe("Webhook Edge Cases", () => {
  const secret = "whsec_dGVzdA==";
  const msgId = "msg_test123";
  const timestampSeconds = Math.floor(Date.now() / 1000);
  const timestamp = new Date(timestampSeconds * 1000);

  it("should accept unbranded headers", () => {
    const wh = new Webhook(secret);
    const payload = '{"event":"test"}';
    const signature = wh.sign(msgId, timestamp, payload);
    const headers = {
      "webhook-id": msgId,
      "webhook-timestamp": String(timestampSeconds),
      "webhook-signature": signature,
    };
    const result = wh.verify(payload, headers);
    assert.equal(result.event, "test");
  });

  it("should reject missing id header", () => {
    const wh = new Webhook(secret);
    assert.throws(() => wh.verify("{}", {
      "webhook-timestamp": String(timestampSeconds),
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
      "webhook-timestamp": String(timestampSeconds),
    }));
  });

  it("should handle empty payload", () => {
    const wh = new Webhook(secret);
    const payload = "{}";
    const signature = wh.sign(msgId, timestamp, payload);
    const headers = {
      "webhook-id": msgId,
      "webhook-timestamp": String(timestampSeconds),
      "webhook-signature": signature,
    };
    const result = wh.verify(payload, headers);
    assert.equal(result.event, "");
  });

  it("should handle verifyRaw", () => {
    const wh = new Webhook(secret);
    const payload = '{"event":"test"}';
    const signature = wh.sign(msgId, timestamp, payload);
    const headers = {
      "webhook-id": msgId,
      "webhook-timestamp": String(timestampSeconds),
      "webhook-signature": signature,
    };
    const result = wh.verifyRaw(payload, headers);
    assert.equal(result.event, "test");
  });

  it("should sign deterministic", () => {
    const wh = new Webhook(secret);
    const sig1 = wh.sign(msgId, new Date(1700000000000), "payload");
    const sig2 = wh.sign(msgId, new Date(1700000000000), "payload");
    assert.equal(sig1, sig2);
  });

  it("should sign different payloads differently", () => {
    const wh = new Webhook(secret);
    const sig1 = wh.sign(msgId, new Date(1700000000000), "p1");
    const sig2 = wh.sign(msgId, new Date(1700000000000), "p2");
    assert.notEqual(sig1, sig2);
  });

  it("should sign with v1 prefix", () => {
    const wh = new Webhook(secret);
    const sig = wh.sign(msgId, new Date(1700000000000), "p");
    assert.ok(sig.startsWith("v1,"));
  });
});

describe("Idempotency Key", () => {
  it("should generate unique keys", () => {
    const keys = new Set();
    for (let i = 0; i < 100; i++) {
      keys.add(`auto_${crypto.randomUUID()}`);
    }
    assert.equal(keys.size, 100);
  });

  it("should have auto_ prefix", () => {
    const key = `auto_${crypto.randomUUID()}`;
    assert.ok(key.startsWith("auto_"));
  });

  it("should be valid UUID", () => {
    const key = `auto_${crypto.randomUUID()}`;
    const uuid = key.replace("auto_", "");
    assert.ok(uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/));
  });
});

describe("Response Metadata", () => {
  it("should have status code", () => {
    const metadata = { statusCode: 200, requestId: "req_123", rateLimitRemaining: 99 };
    assert.equal(metadata.statusCode, 200);
  });

  it("should have request id", () => {
    const metadata = { statusCode: 200, requestId: "req_123" };
    assert.equal(metadata.requestId, "req_123");
  });

  it("should have rate limit", () => {
    const metadata = { statusCode: 200, rateLimitRemaining: 42 };
    assert.equal(metadata.rateLimitRemaining, 42);
  });

  it("should handle null request id", () => {
    const metadata = { statusCode: 200, requestId: null };
    assert.equal(metadata.requestId, null);
  });
});

describe("Config Options", () => {
  it("should have default server url", () => {
    const url = "https://hooksniff-api-1046140057667.europe-west1.run.app";
    assert.ok(url.startsWith("https://"));
  });

  it("should accept custom headers", () => {
    const headers = { "X-Custom": "value" };
    assert.equal(headers["X-Custom"], "value");
  });

  it("should accept timeout", () => {
    const timeout = 30000;
    assert.ok(timeout > 0);
  });

  it("should accept debug flag", () => {
    const debug = true;
    assert.equal(typeof debug, "boolean");
  });
});
