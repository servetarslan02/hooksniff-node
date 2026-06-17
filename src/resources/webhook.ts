import type { HttpClient } from "../http-client";
import { paginate, Paginator } from "../pagination";
import type {
  WebhookDelivery,
  WebhookSend,
} from "../types";

export class WebhookResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Send a webhook to an endpoint.
   *
   * @example
   * ```ts
   * const delivery = await hs.webhook.send({
   *   endpoint_id: "ep_123",
   *   event: "order.created",
   *   data: { order_id: "12345", amount: 99.99 },
   * });
   * ```
   */
  async send(params: WebhookSend, options?: { idempotencyKey?: string }): Promise<WebhookDelivery> {
    return this.http.request<WebhookDelivery>(
      "POST",
      "/v1/webhooks",
      params,
      options,
    );
  }

  /**
   * Send multiple webhooks in a single batch request.
   *
   * @example
   * ```ts
   * const result = await hs.webhook.sendBatch([
   *   { endpoint_id: "ep_123", event: "order.created", data: { id: "1" } },
   *   { endpoint_id: "ep_123", event: "order.created", data: { id: "2" } },
   * ]);
   * ```
   */
  async sendBatch(
    webhooks: WebhookSend[],
    options?: { idempotencyKey?: string },
  ): Promise<{ deliveries: WebhookDelivery[] }> {
    return this.http.request<{ deliveries: WebhookDelivery[] }>(
      "POST",
      "/v1/webhooks/batch",
      { webhooks },
      options,
    );
  }

  /**
   * List webhook deliveries.
   *
   * @example
   * ```ts
   * const result = await hs.webhook.list({ limit: 10 });
   * console.log(result.deliveries);
   * ```
   */
  list(params?: {
    per_page?: number;
    endpoint_id?: string;
    status?: "pending" | "success" | "failed";
  }): Paginator<WebhookDelivery> {
    return paginate(async (page, per_page) => {
      const query = new URLSearchParams({ page: String(page), per_page: String(per_page) });
      if (params?.endpoint_id) query.set("endpoint_id", params.endpoint_id);
      if (params?.status) query.set("status", params.status);
      const response = await this.http.request<{ deliveries: WebhookDelivery[]; total: number; page: number; per_page: number }>("GET", `/v1/webhooks?${query}`);
      return { data: response.deliveries, total: response.total, page: response.page, per_page: response.per_page };
    }, params?.per_page);
  }

  /**
   * Get a webhook delivery by ID.
   *
   * @example
   * ```ts
   * const delivery = await hs.webhook.get("msg_123");
   * ```
   */
  async get(webhookId: string): Promise<WebhookDelivery> {
    return this.http.request<WebhookDelivery>(
      "GET",
      `/v1/webhooks/${webhookId}`,
    );
  }

  /**
   * Replay a webhook delivery.
   *
   * @example
   * ```ts
   * const delivery = await hs.webhook.replay("msg_123");
   * ```
   */
  async replay(webhookId: string): Promise<WebhookDelivery> {
    return this.http.request<WebhookDelivery>(
      "POST",
      `/v1/webhooks/${webhookId}/replay`,
    );
  }
}
