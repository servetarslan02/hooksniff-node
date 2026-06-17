import type { HttpClient } from "../http-client";
import type { HealthResponse, OutboundIps } from "../types";

export class HealthResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Check system health.
   *
   * @example
   * ```ts
   * const health = await hs.health.check();
   * console.log(health.status); // "healthy"
   * ```
   */
  async check(): Promise<HealthResponse> {
    return this.http.request<HealthResponse>("GET", "/health");
  }

  /**
   * Get outbound IP addresses for firewall whitelisting.
   *
   * @example
   * ```ts
   * const ips = await hs.health.outboundIps();
   * console.log(ips.ips);
   * ```
   */
  async outboundIps(): Promise<OutboundIps> {
    return this.http.request<OutboundIps>("GET", "/v1/outbound-ips");
  }
}
