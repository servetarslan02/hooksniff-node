# HookSniff Node.js SDK

Official Node.js SDK for [HookSniff](https://hooksniff.vercel.app) — the webhook infrastructure for developers.

[![npm version](https://img.shields.io/npm/v/hooksniff-node.svg)](https://www.npmjs.com/package/hooksniff-node)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Installation

```bash
npm install hooksniff-node
```

## Quick Start

```typescript
import { HookSniff } from "hooksniff-node";

const hs = new HookSniff("hr_live_...");

// Create an application
const app = await hs.application.create({ name: "My App" });

// Create an endpoint
const ep = await hs.endpoint.create({
  url: "https://app.com/webhook",
  application_id: app.id,
  description: "Order notifications",
});

// Send a webhook
const delivery = await hs.webhook.send({
  endpoint_id: ep.id,
  event: "order.created",
  data: { order_id: "12345", amount: 99.99 },
});

console.log(delivery.id); // "msg_..."
```

## Features

- **Simple API** — 2 lines to send a webhook
- **Full TypeScript** — Complete type safety with IntelliSense
- **Auto-retry** — Exponential backoff on 429/5xx errors
- **Auto-pagination** — Iterate through all resources automatically
- **Idempotency** — Built-in idempotency key support
- **Webhook verification** — Verify incoming webhooks (Standard Webhooks compliant)
- **Error handling** — Typed exceptions (AuthenticationError, NotFoundError, RateLimitError)
- **Zero dependencies** — Uses native `fetch` (Node.js 18+)
- **20+ Resources** — Application, Endpoint, Webhook, Analytics, Billing, Teams, Cortex AI, Templates, Schemas, Alerts, and more

## Usage

### Authentication

```typescript
import { HookSniff } from "hooksniff-node";

const hs = new HookSniff("hr_live_...");

// Or with custom config
const hs = new HookSniff("hr_live_...", {
  baseUrl: "https://your-instance.com", // Custom API URL
  timeout: 30000,                        // Request timeout (ms)
  retries: 3,                            // Max retries on 5xx/429
  headers: {                             // Custom headers
    "X-Custom-Header": "value",
  },
});
```

### Applications

```typescript
// Create
const app = await hs.application.create({
  name: "My App",
  description: "My application",
});

// List with auto-pagination
for await (const app of hs.application.list()) {
  console.log(app.name);
}

// Or collect all
const allApps = await hs.application.list().all();

// Get
const app = await hs.application.get("app_123");

// Update
const app = await hs.application.update("app_123", {
  name: "New Name",
});

// Delete
await hs.application.delete("app_123");
```

### Endpoints

```typescript
// Create
const ep = await hs.endpoint.create({
  url: "https://app.com/webhook",
  application_id: "app_123",
  description: "Order notifications",
  routing_strategy: "failover",
  fallback_url: "https://backup.com/webhook",
});

// List with auto-pagination
for await (const ep of hs.endpoint.list()) {
  console.log(ep.url);
}

// Get
const ep = await hs.endpoint.get("ep_123");

// Update
const ep = await hs.endpoint.update("ep_123", {
  url: "https://new-url.com/webhook",
});

// Delete
await hs.endpoint.delete("ep_123");

// Rotate signing secret
const result = await hs.endpoint.rotateSecret("ep_123");
console.log(result.signing_secret); // "whsec_..."
```

### Webhooks

```typescript
// Send a webhook
const delivery = await hs.webhook.send({
  endpoint_id: "ep_123",
  event: "order.created",
  data: { order_id: "12345", amount: 99.99 },
});

// Send with idempotency key
const delivery = await hs.webhook.send(
  { endpoint_id: "ep_123", event: "order.created", data: {} },
  { idempotencyKey: "unique-key-123" },
);

// Send batch
const result = await hs.webhook.sendBatch([
  { endpoint_id: "ep_123", event: "order.created", data: { id: "1" } },
  { endpoint_id: "ep_123", event: "order.created", data: { id: "2" } },
]);

// List deliveries with auto-pagination
for await (const delivery of hs.webhook.list({ per_page: 10 })) {
  console.log(delivery.status);
}

// Get delivery
const delivery = await hs.webhook.get("msg_123");

// Replay delivery
const delivery = await hs.webhook.replay("msg_123");
```

### Webhook Verification

Verify incoming webhooks from HookSniff:

```typescript
import { Webhook, WebhookVerificationError } from "hooksniff-node";

const wh = new Webhook("whsec_...");

app.post("/webhook", (req, res) => {
  try {
    const event = wh.verify(req.body, req.headers);
    console.log(event); // Parsed webhook payload
    res.status(200).send("OK");
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      res.status(401).send("Invalid signature");
    }
    throw err;
  }
});
```

### API Keys

```typescript
// List keys
const keys = await hs.apiKey.list();

// Create key (only shown once!)
const result = await hs.apiKey.create({ name: "Production Key" });
console.log(result.key); // "hr_live_..." — save this!

// Delete key
await hs.apiKey.delete(result.id);
```

### Search

```typescript
const results = await hs.search.deliveries("order.created");
console.log(results.deliveries);
```

### Analytics

```typescript
const data = await hs.analytics.deliveries({ range: "7d" });
const rate = await hs.analytics.successRate({ range: "24h" });
```

### Billing

```typescript
// Get current subscription
const sub = await hs.billing.subscription();
console.log(sub.plan); // "developer", "startup", "pro", "enterprise"

// Upgrade plan
await hs.billing.upgrade({ plan: "pro" });

// Open billing portal
const portal = await hs.billing.portal();
console.log(portal.url); // Stripe/Polar portal URL
```

### Teams

```typescript
// List teams
const teams = await hs.team.list();

// Create team
const team = await hs.team.create({
  name: "Engineering",
  description: "Engineering team",
});

// List members
const members = await hs.team.listMembers(team.id);

// Invite member
await hs.team.inviteMember(team.id, {
  email: "dev@example.com",
  role: "editor",
});
```

### Cortex AI

```typescript
// Get AI insights
const insights = await hs.cortex.insights();

// Get anomalies
const anomalies = await hs.cortex.anomalies({ endpoint_id: "ep_123" });

// Predict endpoint health
const prediction = await hs.cortex.predict("ep_123");
console.log(prediction.health_score);

// Trigger auto-healing
await hs.cortex.autoHeal("ep_123");
```

### Notifications

```typescript
// List notifications
const result = await hs.notification.list({ per_page: 10 });

// Get unread count
const { count } = await hs.notification.getUnreadCount();

// Mark as read
await hs.notification.markRead("notif_123");

// Mark all as read
await hs.notification.markAllRead();
```

### Templates

```typescript
// List templates
const templates = await hs.template.list();

// Create template
const template = await hs.template.create({
  name: "Order Notification",
  content: '{"event": "{{event}}", "order_id": "{{order_id}}"}',
});
```

### Schemas

```typescript
// List schemas
const schemas = await hs.schema.list();

// Create schema
const schema = await hs.schema.create({
  name: "Order Schema",
  schema: {
    type: "object",
    properties: {
      order_id: { type: "string" },
      amount: { type: "number" },
    },
    required: ["order_id"],
  },
});

// Validate data
const result = await hs.schema.validate(schema.id, {
  order_id: "12345",
  amount: 99.99,
});
console.log(result.valid); // true
```

### Alerts

```typescript
// List alerts
const alerts = await hs.alert.list();

// Create alert
const alert = await hs.alert.create({
  name: "High Failure Rate",
  condition: "failure_rate > 0.1",
  threshold: 10,
  channels: ["email", "slack"],
});
```

### Health

```typescript
// Check system health
const health = await hs.health.check();
console.log(health.status); // "healthy"
console.log(health.database.latency_ms); // 22

// Get outbound IPs for firewall whitelisting
const ips = await hs.health.outboundIps();
console.log(ips.ips); // ["1.2.3.4", ...]
```

### User Profile

```typescript
const user = await hs.me();
console.log(user.email);
console.log(user.plan);
```

## Error Handling

```typescript
import {
  HookSniffError,
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  ValidationError,
  ServerError,
} from "hooksniff-node";

try {
  await hs.endpoint.get("invalid_id");
} catch (err) {
  if (err instanceof NotFoundError) {
    console.log("Endpoint not found");
  } else if (err instanceof AuthenticationError) {
    console.log("Invalid API key");
  } else if (err instanceof RateLimitError) {
    console.log(`Rate limited, retry after ${err.retryAfter}s`);
  } else if (err instanceof ValidationError) {
    console.log(`Validation error: ${err.detail}`);
  } else if (err instanceof HookSniffError) {
    console.log(`API error: ${err.code} - ${err.detail}`);
  }
}
```

## Configuration

```typescript
const hs = new HookSniff("hr_live_...", {
  baseUrl: "https://hooksniff-api-e6ztf3x2ma-ew.a.run.app", // Default
  timeout: 30000,  // 30 seconds
  retries: 3,      // Retry 3 times on 5xx/429
  headers: {       // Custom headers
    "X-Custom-Header": "value",
  },
});
```

## Requirements

- Node.js 18+ (uses native `fetch`)

## Related

- [HookSniff Dashboard](https://hooksniff.vercel.app)
- [HookSniff API Documentation](https://hooksniff.vercel.app/docs)
- [HookSniff Python SDK](https://github.com/servetarslan02/hooksniff-python)
- [HookSniff Go SDK](https://github.com/servetarslan02/hooksniff-go)

## License

MIT — see [LICENSE](LICENSE) for details.
