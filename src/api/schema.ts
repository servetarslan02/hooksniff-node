import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

/** Schema registry — register, validate. */
export class Schema {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** List schemas. */
  async list(): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/schemas");
    return req.send(this.ctx, (j) => j);
  }

  /** Register a schema. */
  async register(body: Record<string, any>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/schemas");
    req.setBody(body);
    return req.send(this.ctx, (j) => j);
  }

  /** Get a schema. */
  async get(id: string): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, `/v1/schemas/${id}`);
    return req.send(this.ctx, (j) => j);
  }

  /** Validate an event against a schema. */
  async validate(id: string, body: Record<string, any>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.POST, `/v1/schemas/${id}/validate`);
    req.setBody(body);
    return req.send(this.ctx, (j) => j);
  }
}
