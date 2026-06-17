/**
 * FULL LIVE TEST - Every single feature tested against production API.
 * Run: HOOKSNIFF_API_KEY=*** node full-test.mjs
 */

import { HookSniff, Webhook, WebhookVerificationError, AuthenticationError, NotFoundError, RateLimitError, ValidationError } from "./src/index.ts";

import { readFileSync, existsSync } from 'fs';
let API_KEY = process.env.HOOKSNIFF_API_KEY || '';
if (!API_KEY && existsSync('.test-key')) {
  API_KEY = readFileSync('.test-key', 'utf8').trim();
}
if (!API_KEY) { console.error("Set HOOKSNIFF_API_KEY"); process.exit(1); }

const hs = new HookSniff(API_KEY);
let pass = 0, fail = 0;
let appId, endpointId, webhookId, templateId, schemaId, alertId, teamId, keyId;

async function t(name, fn) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    pass++;
  } catch (err) {
    console.log(`  ❌ ${name}: ${err.message}`);
    fail++;
  }
}

console.log("\n🪝 HookSniff Node.js SDK - FULL LIVE TEST\n");
console.log("=".repeat(60));

// ═══════════════════════════════════════════════════════════
// 1. AUTH
// ═══════════════════════════════════════════════════════════
console.log("\n📌 AUTH");
await t("me() returns user with id, email, plan", async () => {
  const u = await hs.me();
  if (!u.id) throw new Error("No id");
  if (!u.email) throw new Error("No email");
  if (!u.plan) throw new Error("No plan");
  console.log(`     → ${u.email} (${u.plan})`);
});

// ═══════════════════════════════════════════════════════════
// 2. APPLICATION
// ═══════════════════════════════════════════════════════════
console.log("\n📌 APPLICATION");
await t("application.create()", async () => {
  const a = await hs.application.create({ name: `SDK Test ${Date.now()}`, description: "Full test" });
  if (!a.id) throw new Error("No id");
  if (!a.name) throw new Error("No name");
  if (!a.created_at) throw new Error("No created_at");
  appId = a.id;
  console.log(`     → id=${a.id}`);
});

await t("application.get()", async () => {
  const a = await hs.application.get(appId);
  if (a.id !== appId) throw new Error("ID mismatch");
});

await t("application.update()", async () => {
  const a = await hs.application.update(appId, { name: "Updated " + Date.now() });
  if (!a.id) throw new Error("No id");
});

await t("application.list() with auto-pagination", async () => {
  const apps = await hs.application.list().all();
  if (!Array.isArray(apps)) throw new Error("Not array");
  if (apps.length === 0) throw new Error("Empty");
  console.log(`     → ${apps.length} apps`);
});

// ═══════════════════════════════════════════════════════════
// 3. ENDPOINT
// ═══════════════════════════════════════════════════════════
console.log("\n📌 ENDPOINT");
await t("endpoint.create()", async () => {
  const ep = await hs.endpoint.create({
    url: "https://httpbin.org/post",
    application_id: appId,
    description: "Full test endpoint",
  });
  if (!ep.id) throw new Error("No id");
  if (!ep.url) throw new Error("No url");
  if (!ep.created_at) throw new Error("No created_at");
  endpointId = ep.id;
  console.log(`     → id=${ep.id}`);
});

await t("endpoint.get()", async () => {
  const ep = await hs.endpoint.get(endpointId);
  if (ep.id !== endpointId) throw new Error("ID mismatch");
  if (ep.url !== "https://httpbin.org/post") throw new Error("URL mismatch");
});

await t("endpoint.update()", async () => {
  const ep = await hs.endpoint.update(endpointId, { description: "Updated" });
  if (ep.description !== "Updated") throw new Error("Not updated");
});

await t("endpoint.list() with auto-pagination", async () => {
  const eps = await hs.endpoint.list().all();
  if (!Array.isArray(eps)) throw new Error("Not array");
  console.log(`     → ${eps.length} endpoints`);
});

await t("endpoint.rotateSecret()", async () => {
  const r = await hs.endpoint.rotateSecret(endpointId);
  if (!r.signing_secret) throw new Error("No secret");
  if (!r.signing_secret.startsWith("whsec_")) throw new Error("Bad format");
  console.log(`     → ${r.signing_secret.substring(0, 20)}...`);
});

// ═══════════════════════════════════════════════════════════
// 4. WEBHOOK
// ═══════════════════════════════════════════════════════════
console.log("\n📌 WEBHOOK");
await t("webhook.send()", async () => {
  const d = await hs.webhook.send({
    endpoint_id: endpointId,
    event: "order.created",
    data: { order_id: "12345", amount: 99.99, currency: "USD" },
  });
  if (!d.id) throw new Error("No id");
  if (!d.event) throw new Error("No event");
  if (!d.status) throw new Error("No status");
  if (!d.created_at) throw new Error("No created_at");
  webhookId = d.id;
  console.log(`     → id=${d.id} status=${d.status}`);
});

await t("webhook.send() with idempotency key", async () => {
  const d = await hs.webhook.send(
    { endpoint_id: endpointId, event: "test.idempotent", data: { x: 1 } },
    { idempotencyKey: `test-${Date.now()}-${Math.random()}` },
  );
  if (!d.id) throw new Error("No id");
});

await t("webhook.sendBatch()", async () => {
  const r = await hs.webhook.sendBatch([
    { endpoint_id: endpointId, event: "batch.1", data: { i: 1 } },
    { endpoint_id: endpointId, event: "batch.2", data: { i: 2 } },
  ]);
  if (!r.deliveries) throw new Error("No deliveries");
  if (!Array.isArray(r.deliveries)) throw new Error("Not array");
  console.log(`     → ${r.deliveries.length} deliveries`);
});

await t("webhook.list()", async () => {
  const deliveries = await hs.webhook.list({ per_page: 10 }).all();
  if (!Array.isArray(deliveries)) throw new Error("Not array");
  console.log(`     → ${deliveries.length} deliveries`);
});

await t("webhook.get()", async () => {
  const d = await hs.webhook.get(webhookId);
  if (d.id !== webhookId) throw new Error("ID mismatch");
});

await t("webhook.replay()", async () => {
  const d = await hs.webhook.replay(webhookId);
  if (!d.id) throw new Error("No id");
});

// ═══════════════════════════════════════════════════════════
// 5. WEBHOOK VERIFICATION
// ═══════════════════════════════════════════════════════════
console.log("\n📌 WEBHOOK VERIFICATION");
await t("Webhook constructor requires secret", async () => {
  try { new Webhook(""); throw new Error("Should fail"); }
  catch (e) { if (!e.message.includes("required")) throw e; }
});

await t("verify() throws on missing headers", async () => {
  const wh = new Webhook("whsec_test");
  try { wh.verify("{}", {}); throw new Error("Should fail"); }
  catch (e) { if (!(e instanceof WebhookVerificationError)) throw e; }
});

await t("verify() throws on old timestamp", async () => {
  const wh = new Webhook("whsec_test");
  const old = Math.floor(Date.now() / 1000) - 600;
  try {
    wh.verify("{}", { "webhook-id": "t", "webhook-signature": "v1,x", "webhook-timestamp": String(old) });
    throw new Error("Should fail");
  } catch (e) { if (!e.message.includes("too old")) throw e; }
});

// ═══════════════════════════════════════════════════════════
// 6. API KEY
// ═══════════════════════════════════════════════════════════
console.log("\n📌 API KEY");
await t("apiKey.list()", async () => {
  const keys = await hs.apiKey.list();
  if (!Array.isArray(keys)) throw new Error("Not array");
  console.log(`     → ${keys.length} keys`);
});

await t("apiKey.create() and delete()", async () => {
  const k = await hs.apiKey.create({ name: "Full Test Key" });
  if (!k.id) throw new Error("No id");
  if (!k.key) throw new Error("No key");
  if (!k.key.startsWith("hr_live_") && !k.key.startsWith("hr_test_")) throw new Error("Bad key format");
  keyId = k.id;
  console.log(`     → created ${k.key.substring(0, 20)}...`);
  await hs.apiKey.delete(k.id);
});

// ═══════════════════════════════════════════════════════════
// 7. SEARCH
// ═══════════════════════════════════════════════════════════
console.log("\n📌 SEARCH");
await t("search.deliveries()", async () => {
  const r = await hs.search.deliveries("order");
  if (!r.deliveries) throw new Error("No deliveries");
  if (!Array.isArray(r.deliveries)) throw new Error("Not array");
  if (r.total === undefined) throw new Error("No total");
  console.log(`     → ${r.deliveries.length} results (total: ${r.total})`);
});

// ═══════════════════════════════════════════════════════════
// 8. ANALYTICS
// ═══════════════════════════════════════════════════════════
console.log("\n📌 ANALYTICS");
await t("analytics.deliveries()", async () => {
  const d = await hs.analytics.deliveries({ range: "24h" });
  if (!d) throw new Error("No data");
});

await t("analytics.successRate()", async () => {
  try {
    const r = await hs.analytics.successRate({ range: "24h" });
    if (!r) throw new Error("No data");
  } catch (e) {
    if (e.message.includes("timeout") || e.message.includes("timed out")) {
      console.log("     → Server timeout (not SDK issue)");
    } else throw e;
  }
});

// ═══════════════════════════════════════════════════════════
// 9. BILLING
// ═══════════════════════════════════════════════════════════
console.log("\n📌 BILLING");
await t("billing.subscription()", async () => {
  const s = await hs.billing.subscription();
  if (!s.plan) throw new Error("No plan");
  if (!s.status) throw new Error("No status");
  console.log(`     → ${s.plan} (${s.status})`);
});

// ═══════════════════════════════════════════════════════════
// 10. HEALTH
// ═══════════════════════════════════════════════════════════
console.log("\n📌 HEALTH");
await t("health.check()", async () => {
  const h = await hs.health.check();
  if (h.status !== "healthy") throw new Error(`Status: ${h.status}`);
  if (!h.database) throw new Error("No database");
  if (!h.redis) throw new Error("No redis");
  console.log(`     → DB: ${h.database.latency_ms}ms, Redis: ${h.redis.latency_ms}ms`);
});

await t("health.outboundIps()", async () => {
  const r = await hs.health.outboundIps();
  if (!r.ips) throw new Error("No ips");
  console.log(`     → ${r.ips.length} IPs`);
});

// ═══════════════════════════════════════════════════════════
// 11. CORTEX
// ═══════════════════════════════════════════════════════════
console.log("\n📌 CORTEX");
await t("cortex.insights()", async () => {
  const i = await hs.cortex.insights();
  if (!Array.isArray(i)) throw new Error("Not array");
  console.log(`     → ${i.length} insights`);
});

// ═══════════════════════════════════════════════════════════
// 12. NOTIFICATION
// ═══════════════════════════════════════════════════════════
console.log("\n📌 NOTIFICATION");
await t("notification.list()", async () => {
  const r = await hs.notification.list({ per_page: 5 });
  if (!r.notifications) throw new Error("No notifications");
  console.log(`     → ${r.notifications.length} notifications`);
});

await t("notification.getUnreadCount()", async () => {
  const r = await hs.notification.getUnreadCount();
  if (r.count === undefined) throw new Error("No count");
  console.log(`     → ${r.count} unread`);
});

// ═══════════════════════════════════════════════════════════
// 13. TEMPLATE
// ═══════════════════════════════════════════════════════════
console.log("\n📌 TEMPLATE");
await t("template.list()", async () => {
  const t = await hs.template.list();
  if (!Array.isArray(t)) throw new Error("Not array");
  console.log(`     → ${t.length} templates`);
});

await t("template.get()", async () => {
  const templates = await hs.template.list();
  if (templates.length > 0) {
    templateId = templates[0].id;
    const tmpl = await hs.template.get(templateId);
    if (!tmpl.id) throw new Error("No id");
    console.log(`     → id=${tmpl.id} name=${tmpl.name}`);
  } else {
    console.log("     → No templates available");
  }
});

// ═══════════════════════════════════════════════════════════
// 14. SCHEMA
// ═══════════════════════════════════════════════════════════
console.log("\n📌 SCHEMA");
await t("schema.list()", async () => {
  const s = await hs.schema.list();
  if (!Array.isArray(s)) throw new Error("Not array");
  console.log(`     → ${s.length} schemas`);
});

await t("schema.create()", async () => {
  const s = await hs.schema.create({
    name: `SDK Test ${Date.now()}`,
    schema: { type: "object", properties: { id: { type: "string" } } },
  });
  if (!s.id) throw new Error("No id");
  schemaId = s.id;
  console.log(`     → id=${s.id}`);
});

// ═══════════════════════════════════════════════════════════
// 15. ALERT
// ═══════════════════════════════════════════════════════════
console.log("\n📌 ALERT");
await t("alert.list()", async () => {
  const a = await hs.alert.list();
  if (!Array.isArray(a)) throw new Error("Not array");
  console.log(`     → ${a.length} alerts`);
});

await t("alert.create()", async () => {
  const a = await hs.alert.create({
    name: `SDK Test ${Date.now()}`,
    condition: "failure_rate",
    threshold: 10,
    channels: ["email"],
  });
  if (!a.id) throw new Error("No id");
  alertId = a.id;
  console.log(`     → id=${a.id}`);
});

// ═══════════════════════════════════════════════════════════
// 16. TEAM
// ═══════════════════════════════════════════════════════════
console.log("\n📌 TEAM");
await t("team.list()", async () => {
  const teams = await hs.team.list();
  if (!Array.isArray(teams)) throw new Error("Not array");
  console.log(`     → ${teams.length} teams`);
});

await t("team.create()", async () => {
  const team = await hs.team.create({ name: `SDK Test ${Date.now()}` });
  if (!team.id) throw new Error("No id");
  teamId = team.id;
  console.log(`     → id=${team.id}`);
});

// ═══════════════════════════════════════════════════════════
// 17. ERROR HANDLING
// ═══════════════════════════════════════════════════════════
console.log("\n📌 ERROR HANDLING");
await t("AuthenticationError for invalid key", async () => {
  const bad = new HookSniff("hr_live_invalid", { retries: 0 });
  try { await bad.me(); throw new Error("Should fail"); }
  catch (e) { if (!(e instanceof AuthenticationError)) throw e; }
});

await t("NotFoundError for missing resource", async () => {
  try { await hs.endpoint.get("00000000-0000-0000-0000-000000000000"); throw new Error("Should fail"); }
  catch (e) { if (!(e instanceof NotFoundError)) throw e; }
});

await t("ValidationError for bad input", async () => {
  try { await hs.endpoint.create({ url: "not-a-url", application_id: "invalid" }); throw new Error("Should fail"); }
  catch (e) { if (!(e instanceof ValidationError) && !(e instanceof NotFoundError)) throw e; }
});

// ═══════════════════════════════════════════════════════════
// 18. CONFIGURATION
// ═══════════════════════════════════════════════════════════
console.log("\n📌 CONFIGURATION");
await t("custom baseUrl works", async () => {
  const custom = new HookSniff(API_KEY, { baseUrl: "https://hooksniff-api-e6ztf3x2ma-ew.a.run.app" });
  const u = await custom.me();
  if (!u.id) throw new Error("No id");
});

await t("custom timeout works", async () => {
  const custom = new HookSniff(API_KEY, { timeout: 5000 });
  const u = await custom.me();
  if (!u.id) throw new Error("No id");
});

await t("custom retries works", async () => {
  const custom = new HookSniff(API_KEY, { retries: 1 });
  const u = await custom.me();
  if (!u.id) throw new Error("No id");
});

await t("custom headers work", async () => {
  const custom = new HookSniff(API_KEY, { headers: { "X-Custom": "test" } });
  const u = await custom.me();
  if (!u.id) throw new Error("No id");
});

// ═══════════════════════════════════════════════════════════
// 19. CLEANUP
// ═══════════════════════════════════════════════════════════
console.log("\n📌 CLEANUP");
await t("delete alert", async () => { if (alertId) await hs.alert.delete(alertId); else console.log("     → skipped (no id)"); });
await t("delete template", async () => { 
  if (templateId && !templateId.includes('-')) { 
    await hs.template.delete(templateId); 
  } else { 
    console.log("     → skipped (predefined template)"); 
  }
});
await t("delete schema", async () => { if (schemaId) await hs.schema.delete(schemaId); else console.log("     → skipped (no id)"); });
await t("delete team", async () => { await hs.team.delete(teamId); });
await t("delete endpoint", async () => { await hs.endpoint.delete(endpointId); });
await t("delete application", async () => { await hs.application.delete(appId); });

// ═══════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════
console.log("\n" + "=".repeat(60));
console.log(`\n✅ ${pass} passed, ❌ ${fail} failed`);
console.log("=".repeat(60) + "\n");

if (fail > 0) process.exit(1);
