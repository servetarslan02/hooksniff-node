import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

/** Application management — CRUD. */
export class Application {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** List applications. */
  async list(params?: Record<string, string>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/applications");
    if (params) req.setQueryParams(params);
    return req.send(this.ctx, (j) => j);
  }

  /** Create an application. */
  async create(body: Record<string, any>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/applications");
    req.setBody(body);
    return req.send(this.ctx, (j) => j);
  }

  /** Get an application. */
  async get(id: string): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, `/v1/applications/${id}`);
    return req.send(this.ctx, (j) => j);
  }

  /** Update an application. */
  async update(id: string, body: Record<string, any>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.PUT, `/v1/applications/${id}`);
    req.setBody(body);
    return req.send(this.ctx, (j) => j);
  }

  /** Delete an application. */
  async delete(id: string): Promise<void> {
    const req = new HookSniffRequest(HttpMethod.DELETE, `/v1/applications/${id}`);
    return req.sendNoResponseBody(this.ctx);
  }
}
