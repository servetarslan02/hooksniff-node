import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

/** Rate limiting per endpoint. */
export class RateLimit {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** List rate limits. */
  async list(): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/rate-limits");
    return req.send(this.ctx, (j) => j);
  }

  /** Get rate limit for endpoint. */
  async get(endpointId: string): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, `/v1/rate-limits/${endpointId}`);
    return req.send(this.ctx, (j) => j);
  }

  /** Set rate limit. */
  async set(endpointId: string, body: Record<string, any>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.POST, `/v1/rate-limits/${endpointId}`);
    req.setBody(body);
    return req.send(this.ctx, (j) => j);
  }

  /** Delete rate limit. */
  async delete(endpointId: string): Promise<void> {
    const req = new HookSniffRequest(HttpMethod.DELETE, `/v1/rate-limits/${endpointId}`);
    return req.sendNoResponseBody(this.ctx);
  }
}
