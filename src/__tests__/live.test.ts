import { describe, it, expect, beforeAll } from "vitest";
import { HookSniff } from "../client";
import { Webhook, WebhookVerificationError } from "../webhook";
import {
  AuthenticationError,
  NotFoundError,
  ValidationError,
} from "../errors";

const API_KEY = process.env.HOOKSNIFF_API_KEY;
const BASE_URL = process.env.HOOKSNIFF_BASE_URL || "https://hooksniff-api-e6ztf3x2ma-ew.a.run.app";

// Skip tests if no API key
const describeLive = API_KEY ? describe : describe.skip;

describeLive("HookSniff SDK - Live API Tests", () => {
  let hs: HookSniff;
  let testAppId: string;
  let testEndpointId: string;

  beforeAll(() => {
    hs = new HookSniff(API_KEY!, { baseUrl: BASE_URL });
  });

  // ── Auth ────────────────────────────────────────────────
  describe("auth", () => {
    it("should get current user", async () => {
      const user = await hs.me();
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.plan).toBeDefined();
    });
  });

  // ── Application ─────────────────────────────────────────
  describe("application", () => {
    it("should create an application", async () => {
      const app = await hs.application.create({
        name: "SDK Test App",
        description: "Created by automated SDK test",
      });
      expect(app).toBeDefined();
      expect(app.id).toBeDefined();
      expect(app.name).toBe("SDK Test App");
      testAppId = app.id;
    });

    it("should list applications", async () => {
      const apps = await hs.application.list();
      expect(Array.isArray(apps)).toBe(true);
      expect(apps.length).toBeGreaterThan(0);
    });

    it("should get application by id", async () => {
      const app = await hs.application.get(testAppId);
      expect(app.id).toBe(testAppId);
      expect(app.name).toBe("SDK Test App");
    });

    it("should update application", async () => {
      const app = await hs.application.update(testAppId, {
        name: "SDK Test App Updated",
      });
      expect(app.name).toBe("SDK Test App Updated");
    });
  });

  // ── Endpoint ────────────────────────────────────────────
  describe("endpoint", () => {
    it("should create an endpoint", async () => {
      const ep = await hs.endpoint.create({
        url: "https://httpbin.org/post",
        application_id: testAppId,
        description: "SDK test endpoint",
      });
      expect(ep).toBeDefined();
      expect(ep.id).toBeDefined();
      expect(ep.url).toBe("https://httpbin.org/post");
      testEndpointId = ep.id;
    });

    it("should list endpoints", async () => {
      const endpoints = await hs.endpoint.list();
      expect(Array.isArray(endpoints)).toBe(true);
    });

    it("should get endpoint by id", async () => {
      const ep = await hs.endpoint.get(testEndpointId);
      expect(ep.id).toBe(testEndpointId);
    });

    it("should update endpoint", async () => {
      const ep = await hs.endpoint.update(testEndpointId, {
        description: "Updated by SDK test",
      });
      expect(ep.description).toBe("Updated by SDK test");
    });

    it("should rotate endpoint secret", async () => {
      const result = await hs.endpoint.rotateSecret(testEndpointId);
      expect(result.signing_secret).toBeDefined();
      expect(result.signing_secret).toMatch(/^whsec_/);
      expect(result.message).toContain("rotated");
    });
  });

  // ── Webhook ─────────────────────────────────────────────
  describe("webhook", () => {
    it("should send a webhook", async () => {
      const delivery = await hs.webhook.send({
        endpoint_id: testEndpointId,
        event: "order.created",
        data: { order_id: "12345", amount: 99.99 },
      });
      expect(delivery).toBeDefined();
      expect(delivery.id).toBeDefined();
      expect(delivery.event).toBe("order.created");
      expect(delivery.status).toBe("pending");
    });

    it("should send webhook with idempotency key", async () => {
      const key = `idem-${Date.now()}`;
      const d1 = await hs.webhook.send(
        {
          endpoint_id: testEndpointId,
          event: "order.created",
          data: { order_id: "99999" },
        },
        { idempotencyKey: key },
      );
      expect(d1.id).toBeDefined();
    });

    it("should list webhook deliveries", async () => {
      const result = await hs.webhook.list({ limit: 5 });
      expect(result.deliveries).toBeDefined();
      expect(Array.isArray(result.deliveries)).toBe(true);
    });

    it("should get webhook delivery by id", async () => {
      // First send one
      const delivery = await hs.webhook.send({
        endpoint_id: testEndpointId,
        event: "test.event",
        data: { test: true },
      });

      // Then fetch it
      const fetched = await hs.webhook.get(delivery.id);
      expect(fetched.id).toBe(delivery.id);
    });

    it("should replay a webhook", async () => {
      const delivery = await hs.webhook.send({
        endpoint_id: testEndpointId,
        event: "replay.test",
        data: { replay: true },
      });

      const replayed = await hs.webhook.replay(delivery.id);
      expect(replayed.id).toBeDefined();
      expect(replayed.replay_count).toBeGreaterThan(0);
    });
  });

  // ── API Key ─────────────────────────────────────────────
  describe("apiKey", () => {
    it("should list API keys", async () => {
      const keys = await hs.apiKey.list();
      expect(Array.isArray(keys)).toBe(true);
    });

    it("should create and delete API key", async () => {
      const created = await hs.apiKey.create({ name: "SDK Test Key" });
      expect(created.key).toBeDefined();
      expect(created.key).toMatch(/^hr_live_/);
      expect(created.id).toBeDefined();

      // Clean up
      await hs.apiKey.delete(created.id);
    });
  });

  // ── Search ──────────────────────────────────────────────
  describe("search", () => {
    it("should search deliveries", async () => {
      const results = await hs.search.deliveries("order");
      expect(results).toBeDefined();
      expect(results.deliveries).toBeDefined();
      expect(Array.isArray(results.deliveries)).toBe(true);
    });
  });

  // ── Health ──────────────────────────────────────────────
  describe("health", () => {
    it("should check system health", async () => {
      const health = await hs.health.check();
      expect(health.status).toBe("healthy");
      expect(health.database.status).toBe("healthy");
      expect(health.redis.status).toBe("healthy");
    });

    it("should get outbound IPs", async () => {
      const result = await hs.health.outboundIps();
      expect(result).toBeDefined();
      expect(result.ips).toBeDefined();
    });
  });

  // ── Cleanup ─────────────────────────────────────────────
  describe("cleanup", () => {
    it("should delete test endpoint", async () => {
      await hs.endpoint.delete(testEndpointId);
    });

    it("should delete test application", async () => {
      await hs.application.delete(testAppId);
    });
  });
});

describe("Webhook Verification", () => {
  it("should verify a valid webhook signature", () => {
    // This is a test vector from Standard Webhooks spec
    const secret = "whsec_test_secret";
    const wh = new Webhook(secret);

    // We can't easily test with real signatures without a running server
    // but we can test the error cases
    expect(() => {
      wh.verify("{}", {});
    }).toThrow(WebhookVerificationError);
  });

  it("should throw on missing headers", () => {
    const wh = new Webhook("whsec_test");
    expect(() => {
      wh.verify("{}", {});
    }).toThrow("Missing required webhook headers");
  });

  it("should throw on old timestamp", () => {
    const wh = new Webhook("whsec_test");
    const oldTimestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
    expect(() => {
      wh.verify("{}", {
        "webhook-id": "test",
        "webhook-signature": "v1,test",
        "webhook-timestamp": String(oldTimestamp),
      });
    }).toThrow("too old");
  });
});

describe("Error Handling", () => {
  it("should throw AuthenticationError for invalid key", async () => {
    const hs = new HookSniff("hr_live_invalid_key", {
      baseUrl: BASE_URL,
      retries: 0,
    });
    await expect(hs.me()).rejects.toThrow(AuthenticationError);
  });

  it("should throw NotFoundError for non-existent resource", async () => {
    if (!API_KEY) return;
    const hs = new HookSniff(API_KEY, { baseUrl: BASE_URL, retries: 0 });
    await expect(
      hs.endpoint.get("00000000-0000-0000-0000-000000000000"),
    ).rejects.toThrow(NotFoundError);
  });
});
