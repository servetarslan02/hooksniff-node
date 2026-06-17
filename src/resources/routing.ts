import type { HttpClient } from "../http-client";

export interface RoutingRule {
  id: string;
  name: string;
  strategy: "round-robin" | "failover" | "weighted" | "random";
  endpoints: string[];
  weights?: number[];
  enabled: boolean;
  created_at: string;
}

export interface RateLimit {
  id: string;
  name: string;
  endpoint_id: string | null;
  requests_per_minute: number;
  requests_per_hour: number;
  created_at: string;
}

export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, unknown>;
  ip_address: string;
  created_at: string;
}

export class RoutingResource {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<RoutingRule[]> {
    return this.http.request<RoutingRule[]>("GET", "/v1/routing");
  }

  async create(params: { name: string; strategy: string; endpoints: string[]; weights?: number[] }): Promise<RoutingRule> {
    return this.http.request<RoutingRule>("POST", "/v1/routing", params);
  }

  async get(ruleId: string): Promise<RoutingRule> {
    return this.http.request<RoutingRule>("GET", `/v1/routing/${ruleId}`);
  }

  async update(ruleId: string, params: Partial<RoutingRule>): Promise<RoutingRule> {
    return this.http.request<RoutingRule>("PUT", `/v1/routing/${ruleId}`, params);
  }

  async delete(ruleId: string): Promise<void> {
    await this.http.request<void>("DELETE", `/v1/routing/${ruleId}`);
  }
}

export class RateLimitResource {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<RateLimit[]> {
    return this.http.request<RateLimit[]>("GET", "/v1/rate-limits");
  }

  async create(params: { name: string; endpoint_id?: string; requests_per_minute: number; requests_per_hour: number }): Promise<RateLimit> {
    return this.http.request<RateLimit>("POST", "/v1/rate-limits", params);
  }

  async update(limitId: string, params: { requests_per_minute?: number; requests_per_hour?: number }): Promise<RateLimit> {
    return this.http.request<RateLimit>("PUT", `/v1/rate-limits/${limitId}`, params);
  }

  async delete(limitId: string): Promise<void> {
    await this.http.request<void>("DELETE", `/v1/rate-limits/${limitId}`);
  }
}

export class AuditResource {
  constructor(private readonly http: HttpClient) {}

  async list(params?: { page?: number; per_page?: number; action?: string }): Promise<{ events: AuditEvent[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.per_page) query.set("per_page", String(params.per_page));
    if (params?.action) query.set("action", params.action);
    const qs = query.toString();
    return this.http.request("GET", `/v1/audit-log${qs ? `?${qs}` : ""}`);
  }
}
