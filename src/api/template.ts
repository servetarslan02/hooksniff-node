import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

/** Webhook templates. */
export class Template {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** List templates. */
  async list(): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/api/v1/templates");
    return req.send(this.ctx, (j) => j);
  }

  /** Get a template. */
  async get(id: string): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, `/api/v1/templates/${id}`);
    return req.send(this.ctx, (j) => j);
  }

  /** Apply a template. */
  async apply(id: string, body?: Record<string, any>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.POST, `/api/v1/templates/${id}/apply`);
    if (body) req.setBody(body);
    return req.send(this.ctx, (j) => j);
  }
}
