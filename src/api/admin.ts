import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

/** Admin operations — users, stats, revenue, settings. */
export class Admin {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** List all users. */
  async listUsers(params?: Record<string, string>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/api/v1/admin/users");
    if (params) req.setQueryParams(params);
    return req.send(this.ctx, (j) => j);
  }

  /** Get user detail. */
  async getUser(userId: string): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, `/api/v1/admin/users/${userId}`);
    return req.send(this.ctx, (j) => j);
  }

  /** Change user plan. */
  async changePlan(userId: string, body: Record<string, any>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.PUT, `/api/v1/admin/users/${userId}/plan`);
    req.setBody(body);
    return req.send(this.ctx, (j) => j);
  }

  /** Change user status. */
  async changeStatus(userId: string, body: Record<string, any>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.PUT, `/api/v1/admin/users/${userId}/status`);
    req.setBody(body);
    return req.send(this.ctx, (j) => j);
  }

  /** Impersonate a user. */
  async impersonate(userId: string): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.POST, `/api/v1/admin/users/${userId}/impersonate`);
    return req.send(this.ctx, (j) => j);
  }

  /** Get system stats. */
  async getStats(): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/api/v1/admin/stats");
    return req.send(this.ctx, (j) => j);
  }

  /** Get revenue. */
  async getRevenue(): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/api/v1/admin/revenue");
    return req.send(this.ctx, (j) => j);
  }

  /** Get churn report. */
  async getChurn(): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/api/v1/admin/churn");
    return req.send(this.ctx, (j) => j);
  }

  /** Get platform settings. */
  async getSettings(): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/api/v1/admin/settings");
    return req.send(this.ctx, (j) => j);
  }

  /** Update platform settings. */
  async updateSettings(body: Record<string, any>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.PUT, "/api/v1/admin/settings");
    req.setBody(body);
    return req.send(this.ctx, (j) => j);
  }
}
