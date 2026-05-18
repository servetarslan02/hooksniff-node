import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

/** Alert management — create, list, update, delete, test. */
export class Alert {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** List alerts. */
  async list(): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/api/v1/alerts");
    return req.send(this.ctx, (j) => j);
  }

  /** Create an alert. */
  async create(body: Record<string, any>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.POST, "/api/v1/alerts");
    req.setBody(body);
    return req.send(this.ctx, (j) => j);
  }

  /** Get an alert. */
  async get(id: string): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, `/api/v1/alerts/${id}`);
    return req.send(this.ctx, (j) => j);
  }

  /** Update an alert. */
  async update(id: string, body: Record<string, any>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.PUT, `/api/v1/alerts/${id}`);
    req.setBody(body);
    return req.send(this.ctx, (j) => j);
  }

  /** Delete an alert. */
  async delete(id: string): Promise<void> {
    const req = new HookSniffRequest(HttpMethod.DELETE, `/api/v1/alerts/${id}`);
    return req.sendNoResponseBody(this.ctx);
  }

  /** Test an alert. */
  async test(id: string): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.POST, `/api/v1/alerts/${id}/test`);
    return req.send(this.ctx, (j) => j);
  }
}
