import { createHmac, timingSafeEqual } from "node:crypto";

export class WebhookVerificationError extends Error {
  constructor(message = "Webhook verification failed") {
    super(message);
    this.name = "WebhookVerificationError";
  }
}

/**
 * Verify and parse incoming webhook payloads.
 * Compliant with the Standard Webhooks specification.
 *
 * @example
 * ```ts
 * import { Webhook } from "hooksniff-sdk";
 *
 * const wh = new Webhook("whsec_...");
 *
 * // In your webhook handler:
 * app.post("/webhook", (req, res) => {
 *   try {
 *     const event = wh.verify(req.body, req.headers);
 *     console.log(event);
 *     res.status(200).send("OK");
 *   } catch (err) {
 *     res.status(401).send("Invalid signature");
 *   }
 * });
 * ```
 */
export class Webhook {
  private readonly secret: string;

  constructor(secret: string) {
    if (!secret) {
      throw new Error("Webhook secret is required");
    }
    this.secret = secret;
  }

  /**
   * Verify a webhook payload and return the parsed event.
   *
   * @param payload - The raw request body (string or Buffer)
   * @param headers - The request headers (must contain webhook-id, webhook-signature, webhook-timestamp)
   * @returns The parsed webhook event
   * @throws {WebhookVerificationError} If verification fails
   */
  verify(
    payload: string | Buffer,
    headers: Record<string, string>,
  ): unknown {
    const normalizedHeaders = this.normalizeHeaders(headers);

    const msgId = normalizedHeaders["webhook-id"];
    const msgSignature = normalizedHeaders["webhook-signature"];
    const msgTimestamp = normalizedHeaders["webhook-timestamp"];

    if (!msgId || !msgSignature || !msgTimestamp) {
      throw new WebhookVerificationError(
        "Missing required webhook headers (webhook-id, webhook-signature, webhook-timestamp)",
      );
    }

    // Validate timestamp (reject if older than 5 minutes)
    const timestamp = parseInt(msgTimestamp, 10);
    if (isNaN(timestamp)) {
      throw new WebhookVerificationError("Invalid webhook timestamp");
    }

    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > 300) {
      throw new WebhookVerificationError("Webhook timestamp is too old");
    }

    // Compute expected signature
    const content = typeof payload === "string" ? payload : payload.toString("utf8");
    const toSign = `${msgId}.${msgTimestamp}.${content}`;
    const expectedSignature = this.sign(toSign);

    // Extract signatures from header (space-separated)
    const signatures = msgSignature.split(" ");
    const isValid = signatures.some((sig) => {
      const parts = sig.split(",", 2);
      if (parts.length !== 2) return false;
      const version = parts[0];
      const signature = parts[1];
      if (version !== "v1") return false;

      try {
        return timingSafeEqual(
          Buffer.from(signature, "base64"),
          Buffer.from(expectedSignature, "base64"),
        );
      } catch {
        return false;
      }
    });

    if (!isValid) {
      throw new WebhookVerificationError("Invalid webhook signature");
    }

    return JSON.parse(content);
  }

  /**
   * Sign a message with the webhook secret.
   */
  private sign(content: string): string {
    const secretBytes = Buffer.from(
      this.secret.replace("whsec_", ""),
      "base64",
    );
    return createHmac("sha256", secretBytes).update(content).digest("base64");
  }

  private normalizeHeaders(headers: Record<string, string>): Record<string, string> {
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      normalized[key.toLowerCase()] = value;
    }
    return normalized;
  }
}
