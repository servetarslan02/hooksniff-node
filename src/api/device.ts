import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

/** Push device management. */
export class Device {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** List devices. */
  async list(): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/api/v1/devices");
    return req.send(this.ctx, (j) => j);
  }

  /** Register a device. */
  async register(body: Record<string, any>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.POST, "/api/v1/devices");
    req.setBody(body);
    return req.send(this.ctx, (j) => j);
  }

  /** Delete a device. */
  async delete(id: string): Promise<void> {
    const req = new HookSniffRequest(HttpMethod.DELETE, `/api/v1/devices/${id}`);
    return req.sendNoResponseBody(this.ctx);
  }
}
