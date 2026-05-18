import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

/** API key management — list, create, delete, rotate. */
export class ApiKey {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** List API keys. */
  async list(): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/api/v1/api-keys");
    return req.send(this.ctx, (j) => j);
  }

  /** Create an API key. */
  async create(body: Record<string, any>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.POST, "/api/v1/api-keys");
    req.setBody(body);
    return req.send(this.ctx, (j) => j);
  }

  /** Delete an API key. */
  async delete(id: string): Promise<void> {
    const req = new HookSniffRequest(HttpMethod.DELETE, `/api/v1/api-keys/${id}`);
    return req.sendNoResponseBody(this.ctx);
  }

  /** Rotate an API key. */
  async rotate(id: string): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.POST, `/api/v1/api-keys/${id}/rotate`);
    return req.send(this.ctx, (j) => j);
  }
}
