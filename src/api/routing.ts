import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

/** Endpoint routing configuration. */
export class Routing {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** Get routing for endpoint. */
  async get(endpointId: string): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, `/api/v1/routing/${endpointId}/routing`);
    return req.send(this.ctx, (j) => j);
  }

  /** Update routing. */
  async update(endpointId: string, body: Record<string, any>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.PUT, `/api/v1/routing/${endpointId}/routing`);
    req.setBody(body);
    return req.send(this.ctx, (j) => j);
  }

  /** Get routing health. */
  async getHealth(endpointId: string): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, `/api/v1/routing/${endpointId}/health`);
    return req.send(this.ctx, (j) => j);
  }
}
