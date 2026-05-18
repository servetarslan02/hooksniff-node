import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

/** Service token management. */
export class ServiceToken {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** List service tokens. */
  async list(): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/api/v1/service-tokens");
    return req.send(this.ctx, (j) => j);
  }

  /** Create a service token. */
  async create(body: Record<string, any>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.POST, "/api/v1/service-tokens");
    req.setBody(body);
    return req.send(this.ctx, (j) => j);
  }

  /** Delete a service token. */
  async delete(id: string): Promise<void> {
    const req = new HookSniffRequest(HttpMethod.DELETE, `/api/v1/service-tokens/${id}`);
    return req.sendNoResponseBody(this.ctx);
  }

  /** Reveal a service token. */
  async reveal(id: string): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.POST, `/api/v1/service-tokens/${id}/reveal`);
    return req.send(this.ctx, (j) => j);
  }
}
