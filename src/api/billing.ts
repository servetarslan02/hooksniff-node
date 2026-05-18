import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

/** Billing and subscription management. */
export class Billing {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** Get current subscription. */
  async getSubscription(): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/api/v1/billing/subscription");
    return req.send(this.ctx, (j) => j);
  }

  /** Cancel subscription. */
  async cancelSubscription(): Promise<void> {
    const req = new HookSniffRequest(HttpMethod.DELETE, "/api/v1/billing/subscription");
    return req.sendNoResponseBody(this.ctx);
  }

  /** Upgrade plan. */
  async upgrade(body: Record<string, any>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.POST, "/api/v1/billing/upgrade");
    req.setBody(body);
    return req.send(this.ctx, (j) => j);
  }

  /** Open billing portal. */
  async openPortal(): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.POST, "/api/v1/billing/portal");
    return req.send(this.ctx, (j) => j);
  }

  /** Get billing usage. */
  async getUsage(): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/api/v1/billing/usage");
    return req.send(this.ctx, (j) => j);
  }

  /** Get invoices. */
  async getInvoices(): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/api/v1/billing/invoices");
    return req.send(this.ctx, (j) => j);
  }
}
