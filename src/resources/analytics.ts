import type { HttpClient } from "../http-client";

export class AnalyticsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get delivery trend data.
   *
   * @example
   * ```ts
   * const data = await hs.analytics.deliveries({ range: "24h" });
   * ```
   */
  async deliveries(params?: { range?: "24h" | "7d" | "30d" }): Promise<unknown> {
    const range = params?.range || "24h";
    return this.http.request("GET", `/v1/analytics/deliveries?range=${range}`);
  }

  /**
   * Get success rate metrics.
   *
   * @example
   * ```ts
   * const data = await hs.analytics.successRate({ range: "7d" });
   * ```
   */
  async successRate(params?: { range?: "24h" | "7d" | "30d" }): Promise<unknown> {
    const range = params?.range || "24h";
    return this.http.request("GET", `/v1/analytics/success-rate?range=${range}`);
  }
}
