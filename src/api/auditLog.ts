import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

/** Audit log entries. */
export class AuditLog {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** List audit log entries. */
  async list(params?: Record<string, string>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/audit-log");
    if (params) req.setQueryParams(params);
    return req.send(this.ctx, (j) => j);
  }

  /** Get an audit entry. */
  async get(id: string): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, `/v1/audit-log/${id}`);
    return req.send(this.ctx, (j) => j);
  }
}
