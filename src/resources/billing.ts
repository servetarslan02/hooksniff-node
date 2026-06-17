import type { HttpClient } from "../http-client";
import type { Subscription } from "../types";

export interface BillingPortal {
  url: string;
}

export interface RefundRequest {
  id: string;
  amount: number;
  reason: string;
  status: string;
  created_at: string;
}

export class BillingResource {
  constructor(private readonly http: HttpClient) {}

  async subscription(): Promise<Subscription> {
    return this.http.request<Subscription>("GET", "/v1/billing/subscription");
  }

  async upgrade(params: { plan: string }): Promise<Subscription> {
    return this.http.request<Subscription>("POST", "/v1/billing/upgrade", params);
  }

  async cancel(): Promise<void> {
    await this.http.request<void>("POST", "/v1/billing/cancel");
  }

  async portal(): Promise<BillingPortal> {
    return this.http.request<BillingPortal>("POST", "/v1/billing/portal");
  }

  async requestRefund(params: { amount: number; reason: string }): Promise<RefundRequest> {
    return this.http.request<RefundRequest>("POST", "/v1/billing/refund-requests", params);
  }
}
