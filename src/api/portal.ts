import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

/** Customer portal configuration. */
export class Portal {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** Get portal config. */
  async getConfig(): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/portal/config");
    return req.send(this.ctx, (j) => j);
  }

  /** Update portal config. */
  async updateConfig(body: Record<string, any>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.PUT, "/v1/portal/config");
    req.setBody(body);
    return req.send(this.ctx, (j) => j);
  }

  /** Get portal profile. */
  async getProfile(): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/portal/me");
    return req.send(this.ctx, (j) => j);
  }

  /** Get embed code. */
  async getEmbedCode(): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/portal/embed-code");
    return req.send(this.ctx, (j) => j);
  }
}
