import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

/** Payload transform rules. */
export class Transform {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** List transforms. */
  async list(): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/api/v1/transforms");
    return req.send(this.ctx, (j) => j);
  }

  /** Create a transform. */
  async create(body: Record<string, any>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.POST, "/api/v1/transforms");
    req.setBody(body);
    return req.send(this.ctx, (j) => j);
  }

  /** Update a transform. */
  async update(id: string, body: Record<string, any>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.PUT, `/api/v1/transforms/${id}`);
    req.setBody(body);
    return req.send(this.ctx, (j) => j);
  }

  /** Delete a transform. */
  async delete(id: string): Promise<void> {
    const req = new HookSniffRequest(HttpMethod.DELETE, `/api/v1/transforms/${id}`);
    return req.sendNoResponseBody(this.ctx);
  }

  /** Test a transform. */
  async test(body: Record<string, any>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.POST, "/api/v1/transforms/test");
    req.setBody(body);
    return req.send(this.ctx, (j) => j);
  }
}
