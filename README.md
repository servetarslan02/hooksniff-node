# HookSniff Node.js SDK

<p align="center">
  <a href="https://www.npmjs.com/package/hooksniff"><img src="https://img.shields.io/npm/v/hooksniff" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/hooksniff"><img src="https://img.shields.io/npm/dt/hooksniff" alt="npm downloads"></a>
  <a href="https://github.com/servetarslan02/hooksniff-node/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/hooksniff" alt="License"></a>
</p>

Official Node.js/TypeScript SDK for the [HookSniff](https://hooksniff.vercel.app) webhook delivery platform.

## Installation

```bash
npm install hooksniff
```

## Quick Start

```typescript
import { HookSniff } from "hooksniff";

const hs = new HookSniff("sk_live_xxx");

// List endpoints
const endpoints = await hs.endpoint.list();

// Send a webhook
const msg = await hs.message.create({
  event: "user.created",
  payload: { email: "user@example.com" },
});

// Verify incoming webhook
import { Webhook } from "hooksniff";
const wh = new Webhook("whsec_xxx");
const payload = wh.verify(rawBody, headers);
```

## Resources

| Resource | Access | Description |
|----------|--------|-------------|
| Admin | `hs.admin.*` | Users, stats, revenue, settings |
| Alert | `hs.alert.*` | Alert rules and test |
| Analytics | `hs.analytics.*` | Delivery trend, success rate, latency |
| ApiKey | `hs.apiKey.*` | List, create, delete, rotate |
| Application | `hs.application.*` | Application CRUD |
| Authentication | `hs.authentication.*` | Register, login, 2FA, password |
| AuditLog | `hs.auditLog.*` | Audit trail |
| BackgroundTask | `hs.backgroundTask.*` | List, get, cancel |
| Billing | `hs.billing.*` | Subscription, usage, invoices |
| Connector | `hs.connector.*` | Connector management |
| CustomDomain | `hs.customDomain.*` | Add, verify, delete |
| Device | `hs.device.*` | Push device registration |
| Endpoint | `hs.endpoint.*` | CRUD, headers, secret rotation |
| Environment | `hs.environment.*` | Env vars management |
| EventType | `hs.eventType.*` | Event type CRUD |
| Health | `hs.health.*` | Health check |
| Inbound | `hs.inbound.*` | Inbound webhook configs |
| Integration | `hs.integration.*` | Integration CRUD |
| Message | `hs.message.*` | Send, list, get |
| MessageAttempt | `hs.messageAttempt.*` | Delivery attempts |
| MessagePoller | `hs.messagePoller.*` | Poll, seek, commit |
| Notification | `hs.notification.*` | List, mark read |
| OperationalWebhook | `hs.operationalWebhook.*` | Ops webhook endpoints |
| Portal | `hs.portal.*` | Customer portal config |
| RateLimit | `hs.rateLimit.*` | Per-endpoint rate limiting |
| Routing | `hs.routing.*` | Endpoint routing rules |
| Schema | `hs.schema.*` | Schema registry, validation |
| Search | `hs.search.*` | Delivery search |
| ServiceToken | `hs.serviceToken.*` | Token management |
| Sso | `hs.sso.*` | SSO configuration |
| Statistics | `hs.statistics.*` | App statistics |
| Stream | `hs.stream.*` | Real-time streaming |
| Team | `hs.team.*` | Team members, roles |
| Template | `hs.template.*` | Webhook templates |
| Transform | `hs.transform.*` | Payload transforms |

## Configuration

```typescript
const hs = new HookSniff("sk_live_xxx", {
  serverUrl: "https://your-instance.hooksniff.com", // optional
  requestTimeout: 30000,                             // optional
  numRetries: 2,                                     // optional
  debug: false,                                      // optional
});
```

## Webhook Verification

```typescript
import { Webhook } from "hooksniff";

const wh = new Webhook("whsec_xxx");

// Verify incoming webhook
const payload = wh.verify(rawBody, {
  "hooksniff-id": req.headers["hooksniff-id"],
  "hooksniff-timestamp": req.headers["hooksniff-timestamp"],
  "hooksniff-signature": req.headers["hooksniff-signature"],
});
```

## Error Handling

```typescript
import { NotFoundError, RateLimitError } from "hooksniff";

try {
  await hs.endpoint.get("nonexistent");
} catch (e) {
  if (e instanceof NotFoundError) {
    console.log("Not found");
  } else if (e instanceof RateLimitError) {
    console.log("Rate limited, retry after:", e.headers["retry-after"]);
  }
}
```

## Links

- [npm](https://www.npmjs.com/package/hooksniff)
- [GitHub](https://github.com/servetarslan02/hooksniff-node)
- [HookSniff](https://hooksniff.vercel.app)

## License

MIT
