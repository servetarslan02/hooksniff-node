import type { HttpClient } from "../http-client";

export interface Template {
  id: string;
  name: string;
  description: string | null;
  content?: string;
  industry?: string;
  event_types?: string[];
  endpoint_config?: Record<string, unknown>;
  retry_policy?: Record<string, unknown>;
  agents?: unknown[];
  estimated_daily_volume?: number;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Schema {
  id: string;
  name: string;
  version: number;
  schema: Record<string, unknown>;
  created_at: string;
}

export interface Alert {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  channels: string[];
  enabled: boolean;
  created_at: string;
}

export interface AlertEvent {
  id: string;
  alert_id: string;
  triggered_at: string;
  resolved_at: string | null;
  value: number;
}

export class TemplateResource {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<Template[]> {
    const response = await this.http.request<{ templates: Template[]; total: number }>("GET", "/v1/templates");
    return response.templates || [];
  }

  async create(params: { name: string; description?: string; content: string }): Promise<Template> {
    return this.http.request<Template>("POST", "/v1/templates", params);
  }

  async get(templateId: string): Promise<Template> {
    return this.http.request<Template>("GET", `/v1/templates/${templateId}`);
  }

  async update(templateId: string, params: { name?: string; description?: string; content?: string }): Promise<Template> {
    return this.http.request<Template>("PUT", `/v1/templates/${templateId}`, params);
  }

  async delete(templateId: string): Promise<void> {
    await this.http.request<void>("DELETE", `/v1/templates/${templateId}`);
  }
}

export class SchemaResource {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<Schema[]> {
    const response = await this.http.request<{ schemas: Schema[]; total: number }>("GET", "/v1/schemas");
    return response.schemas || [];
  }

  async create(params: { name: string; schema: Record<string, unknown> }): Promise<Schema> {
    return this.http.request<Schema>("POST", "/v1/schemas", params);
  }

  async get(schemaId: string): Promise<Schema> {
    return this.http.request<Schema>("GET", `/v1/schemas/${schemaId}`);
  }

  async delete(schemaId: string): Promise<void> {
    await this.http.request<void>("DELETE", `/v1/schemas/${schemaId}`);
  }

  async validate(schemaId: string, data: unknown): Promise<{ valid: boolean; errors?: string[] }> {
    return this.http.request("POST", `/v1/schemas/${schemaId}/validate`, { data });
  }
}

export class AlertResource {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<Alert[]> {
    const response = await this.http.request<{ alerts: Alert[]; total: number }>("GET", "/v1/alerts");
    return response.alerts || [];
  }

  async create(params: { name: string; condition: string; threshold: number; channels: string[] }): Promise<Alert> {
    return this.http.request<Alert>("POST", "/v1/alerts", params);
  }

  async get(alertId: string): Promise<Alert> {
    return this.http.request<Alert>("GET", `/v1/alerts/${alertId}`);
  }

  async update(alertId: string, params: { name?: string; condition?: string; threshold?: number; channels?: string[]; enabled?: boolean }): Promise<Alert> {
    return this.http.request<Alert>("PUT", `/v1/alerts/${alertId}`, params);
  }

  async delete(alertId: string): Promise<void> {
    await this.http.request<void>("DELETE", `/v1/alerts/${alertId}`);
  }

  async listEvents(alertId: string): Promise<AlertEvent[]> {
    return this.http.request<AlertEvent[]>("GET", `/v1/alerts/${alertId}/events`);
  }
}
