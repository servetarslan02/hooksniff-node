import { Webhook as StdWh } from "standardwebhooks";
export { WebhookVerificationError } from "standardwebhooks";
import type { WebhookEvent, WebhookEventMap } from "./webhook-events";

export interface WebhookRequiredHeaders {
  "hooksniff-id": string;
  "hooksniff-timestamp": string;
  "hooksniff-signature": string;
}

export interface WebhookUnbrandedRequiredHeaders {
  "webhook-id": string;
  "webhook-timestamp": string;
  "webhook-signature": string;
}

export interface WebhookOptions {
  format?: "raw";
}

function resolveHeaders(headers_: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const key of Object.keys(headers_)) {
    headers[key.toLowerCase()] = headers_[key];
  }

  headers["webhook-id"] = headers["hooksniff-id"] ?? headers["svix-id"] ?? headers["webhook-id"] ?? "";
  headers["webhook-signature"] =
    headers["hooksniff-signature"] ?? headers["svix-signature"] ?? headers["webhook-signature"] ?? "";
  headers["webhook-timestamp"] =
    headers["hooksniff-timestamp"] ?? headers["svix-timestamp"] ?? headers["webhook-timestamp"] ?? "";

  return headers;
}

export class Webhook {
  private readonly inner: StdWh;

  constructor(secret: string | Uint8Array, options?: WebhookOptions) {
    this.inner = new StdWh(secret, options);
  }

  /**
   * Verify and parse a webhook payload.
   *
   * Verifies the HMAC-SHA256 signature, then parses the payload
   * into a typed WebhookEvent with `event`, `data`, and `timestamp`.
   *
   * @param payload - Raw request body (string or Buffer)
   * @param headers - Request headers containing hooksniff-id, hooksniff-timestamp, hooksniff-signature
   * @returns Parsed WebhookEvent with typed fields
   * @throws WebhookVerificationError if signature is invalid or timestamp is outside tolerance
   */
  public verify<T extends keyof WebhookEventMap = keyof WebhookEventMap>(
    payload: string | Buffer,
    headers_:
      | WebhookRequiredHeaders
      | WebhookUnbrandedRequiredHeaders
      | Record<string, string>
  ): WebhookEventMap[T] {
    const headers = resolveHeaders(headers_ as Record<string, string>);

    const raw = this.inner.verify(payload, headers);
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;

    return {
      event: parsed.event ?? parsed.eventType ?? "",
      data: parsed.data ?? {},
      timestamp: parsed.timestamp ?? "",
    } as unknown as WebhookEventMap[T];
  }

  /**
   * Verify and return raw payload without parsing.
   * Use this when you need the raw JSON string instead of a typed event.
   */
  public verifyRaw(
    payload: string | Buffer,
    headers_:
      | WebhookRequiredHeaders
      | WebhookUnbrandedRequiredHeaders
      | Record<string, string>
  ): unknown {
    const headers = resolveHeaders(headers_ as Record<string, string>);

    return this.inner.verify(payload, headers);
  }

  public sign(msgId: string, timestamp: Date, payload: string | Buffer): string {
    return this.inner.sign(msgId, timestamp, payload);
  }
}
