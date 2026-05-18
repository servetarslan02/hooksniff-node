import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

/** Notification management. */
export class Notification {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** List notifications. */
  async list(params?: Record<string, string>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/notifications");
    if (params) req.setQueryParams(params);
    return req.send(this.ctx, (j) => j);
  }

  /** Get unread count. */
  async unreadCount(): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/notifications/unread-count");
    return req.send(this.ctx, (j) => j);
  }

  /** Mark all as read. */
  async markAllRead(): Promise<void> {
    const req = new HookSniffRequest(HttpMethod.PUT, "/v1/notifications/read-all");
    return req.sendNoResponseBody(this.ctx);
  }

  /** Mark one as read. */
  async markRead(id: string): Promise<void> {
    const req = new HookSniffRequest(HttpMethod.PUT, `/v1/notifications/${id}/read`);
    return req.sendNoResponseBody(this.ctx);
  }

  /** Delete a notification. */
  async delete(id: string): Promise<void> {
    const req = new HookSniffRequest(HttpMethod.DELETE, `/v1/notifications/${id}`);
    return req.sendNoResponseBody(this.ctx);
  }
}
