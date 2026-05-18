import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

/** Analytics — delivery trend, success rate, latency. */
export class Analytics {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** Get delivery trend. */
  async deliveries(params?: Record<string, string>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/analytics/deliveries");
    if (params) req.setQueryParams(params);
    return req.send(this.ctx, (j) => j);
  }

  /** Get success rate. */
  async successRate(params?: Record<string, string>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/analytics/success-rate");
    if (params) req.setQueryParams(params);
    return req.send(this.ctx, (j) => j);
  }

  /** Get latency trend. */
  async latency(params?: Record<string, string>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/analytics/latency");
    if (params) req.setQueryParams(params);
    return req.send(this.ctx, (j) => j);
  }
}
