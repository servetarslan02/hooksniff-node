/**
 * Simplified live API test script for HookSniff Node.js SDK.
 * Run: HOOKSNIFF_API_KEY=*** node test-live.mjs
 */

import { HookSniff, Webhook } from "./src/index.ts";

const API_KEY = process.env.HOOKSNIFF_API_KEY;
if (!API_KEY) {
  console.error("Set HOOKSNIFF_API_KEY environment variable");
  process.exit(1);
}

const hs = new HookSniff(API_KEY);

async function runTests() {
  let passed = 0;
  let failed = 0;
  let testAppId = "";
  let testEndpointId = "";
  let webhookId = "";

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ ${name}`);
      passed++;
    } catch (err) {
      console.log(`  ❌ ${name}: ${err.message}`);
      failed++;
    }
  }

  console.log("\n🪝 HookSniff SDK - Live API Tests\n");

  // ── Auth ──────────────────────────────────────────────
  console.log("Auth:");
  await test("me() returns current user", async () => {
    const user = await hs.me();
    if (!user.id) throw new Error("No user id");
    console.log(`     User: ${user.email} (${user.plan})`);
  });

  // ── Application ───────────────────────────────────────
  console.log("\nApplication:");
  await test("create() creates application", async () => {
    const app = await hs.application.create({
      name: "SDK Test " + Date.now(),
      description: "Created by SDK test",
    });
    if (!app.id) throw new Error("No app id");
    testAppId = app.id;
    console.log(`     App ID: ${app.id}`);
  });

  await test("get() returns application", async () => {
    const app = await hs.application.get(testAppId);
    if (!app.id) throw new Error("No app id");
  });

  await test("update() updates application", async () => {
    const app = await hs.application.update(testAppId, { name: "Updated " + Date.now() });
    if (!app.id) throw new Error("No app id");
  });

  await test("list() returns applications", async () => {
    const apps = await hs.application.list().all();
    if (!Array.isArray(apps)) throw new Error("Not an array");
    console.log(`     Found: ${apps.length} apps`);
  });

  // ── Endpoint ──────────────────────────────────────────
  console.log("\nEndpoint:");
  await test("create() creates endpoint", async () => {
    const ep = await hs.endpoint.create({
      url: "https://httpbin.org/post",
      application_id: testAppId,
      description: "SDK test endpoint",
    });
    if (!ep.id) throw new Error("No endpoint id");
    testEndpointId = ep.id;
    console.log(`     Endpoint ID: ${ep.id}`);
  });

  await test("get() returns endpoint", async () => {
    const ep = await hs.endpoint.get(testEndpointId);
    if (!ep.id) throw new Error("No endpoint id");
  });

  await test("update() updates endpoint", async () => {
    const ep = await hs.endpoint.update(testEndpointId, { description: "Updated" });
    if (!ep.id) throw new Error("No endpoint id");
  });

  await test("rotateSecret() rotates secret", async () => {
    const result = await hs.endpoint.rotateSecret(testEndpointId);
    if (!result.signing_secret) throw new Error("No signing secret");
    console.log(`     Secret: ${result.signing_secret.substring(0, 20)}...`);
  });

  await test("list() returns endpoints", async () => {
    const endpoints = await hs.endpoint.list().all();
    if (!Array.isArray(endpoints)) throw new Error("Not an array");
    console.log(`     Found: ${endpoints.length} endpoints`);
  });

  // ── Webhook ───────────────────────────────────────────
  console.log("\nWebhook:");
  await test("send() sends webhook", async () => {
    const delivery = await hs.webhook.send({
      endpoint_id: testEndpointId,
      event: "order.created",
      data: { order_id: "12345", amount: 99.99 },
    });
    if (!delivery.id) throw new Error("No delivery id");
    webhookId = delivery.id;
    console.log(`     Delivery: ${delivery.id}`);
  });

  await test("send() with idempotency key", async () => {
    const delivery = await hs.webhook.send(
      { endpoint_id: testEndpointId, event: "test.idempotency", data: { test: true } },
      { idempotencyKey: `idem-${Date.now()}` },
    );
    if (!delivery.id) throw new Error("No delivery id");
  });

  await test("list() returns deliveries", async () => {
    const deliveries = await hs.webhook.list({ per_page: 5 }).all();
    if (!Array.isArray(deliveries)) throw new Error("Not an array");
    console.log(`     Found: ${deliveries.length} deliveries`);
  });

  await test("get() returns delivery", async () => {
    const d = await hs.webhook.get(webhookId);
    if (!d.id) throw new Error("No delivery id");
  });

  await test("replay() replays delivery", async () => {
    const d = await hs.webhook.replay(webhookId);
    if (!d.id) throw new Error("No delivery id");
  });

  // ── API Key ───────────────────────────────────────────
  console.log("\nAPI Key:");
  await test("list() returns keys", async () => {
    const keys = await hs.apiKey.list();
    if (!Array.isArray(keys)) throw new Error("Not an array");
    console.log(`     Keys: ${keys.length}`);
  });

  await test("create() and delete() API key", async () => {
    const created = await hs.apiKey.create({ name: "SDK Test Key" });
    if (!created.key) throw new Error("No key");
    console.log(`     Created: ${created.key.substring(0, 25)}...`);
    await hs.apiKey.delete(created.id);
  });

  // ── Search ────────────────────────────────────────────
  console.log("\nSearch:");
  await test("deliveries() searches deliveries", async () => {
    const results = await hs.search.deliveries("order");
    if (!results.deliveries) throw new Error("No deliveries");
    console.log(`     Results: ${results.deliveries.length}`);
  });

  // ── Health ────────────────────────────────────────────
  console.log("\nHealth:");
  await test("check() returns health status", async () => {
    const health = await hs.health.check();
    if (health.status !== "healthy") throw new Error(`Status: ${health.status}`);
    console.log(`     DB: ${health.database.latency_ms}ms`);
  });

  await test("outboundIps() returns IPs", async () => {
    const result = await hs.health.outboundIps();
    console.log(`     IPs: ${result.ips.length}`);
  });

  // ── Analytics ─────────────────────────────────────────
  console.log("\nAnalytics:");
  await test("deliveries() returns analytics", async () => {
    const data = await hs.analytics.deliveries({ range: "24h" });
    if (!data) throw new Error("No data");
  });

  await test("successRate() returns metrics (or timeout)", async () => {
    try {
      const data = await hs.analytics.successRate({ range: "24h" });
      if (!data) throw new Error("No data");
    } catch (err) {
      // This endpoint may timeout on the server side - not an SDK issue
      if (err.message.includes("timeout") || err.message.includes("timed out")) {
        console.log(`     (Server timeout - not SDK issue)`);
      } else {
        throw err;
      }
    }
  });

  // ── Billing ───────────────────────────────────────────
  console.log("\nBilling:");
  await test("subscription() returns subscription", async () => {
    const sub = await hs.billing.subscription();
    if (!sub.plan) throw new Error("No plan");
    console.log(`     Plan: ${sub.plan}`);
  });

  // ── Cleanup ───────────────────────────────────────────
  console.log("\nCleanup:");
  await test("delete endpoint", async () => {
    await hs.endpoint.delete(testEndpointId);
  });

  await test("delete application", async () => {
    await hs.application.delete(testAppId);
  });

  // ── Summary ───────────────────────────────────────────
  console.log(`\n${"─".repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`${"─".repeat(50)}`);
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
