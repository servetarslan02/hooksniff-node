import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

/** SSO configuration. */
export class Sso {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** Get SSO config. */
  async getConfig(): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/sso/config");
    return req.send(this.ctx, (j) => j);
  }

  /** Create or update SSO config. */
  async upsertConfig(body: Record<string, any>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/sso/config");
    req.setBody(body);
    return req.send(this.ctx, (j) => j);
  }

  /** Delete SSO config. */
  async deleteConfig(): Promise<void> {
    const req = new HookSniffRequest(HttpMethod.DELETE, "/v1/sso/config");
    return req.sendNoResponseBody(this.ctx);
  }

  /** Test SSO connection. */
  async testConnection(): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/sso/test");
    return req.send(this.ctx, (j) => j);
  }
}
