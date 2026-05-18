import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

/** Custom domain management. */
export class CustomDomain {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** List custom domains. */
  async list(): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/api/v1/custom-domains");
    return req.send(this.ctx, (j) => j);
  }

  /** Add a custom domain. */
  async add(body: Record<string, any>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.POST, "/api/v1/custom-domains");
    req.setBody(body);
    return req.send(this.ctx, (j) => j);
  }

  /** Delete a custom domain. */
  async delete(id: string): Promise<void> {
    const req = new HookSniffRequest(HttpMethod.DELETE, `/api/v1/custom-domains/${id}`);
    return req.sendNoResponseBody(this.ctx);
  }

  /** Verify a custom domain. */
  async verify(id: string): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.POST, `/api/v1/custom-domains/${id}/verify`);
    return req.send(this.ctx, (j) => j);
  }
}
