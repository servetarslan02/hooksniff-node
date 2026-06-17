import type { HttpClient } from "../http-client";

export interface BackgroundTask {
  id: string;
  type: string;
  status: string;
  created_at: string;
  completed_at: string | null;
}

export interface Integration {
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  created_at: string;
}

export interface InboundWebhook {
  id: string;
  name: string;
  url: string;
  created_at: string;
}

export interface Transform {
  id: string;
  endpoint_id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface PortalLink {
  url: string;
  expires_at: string;
}

export interface ServiceToken {
  id: string;
  name: string;
  token_prefix: string;
  created_at: string;
}

export interface OperationalWebhook {
  id: string;
  url: string;
  events: string[];
  created_at: string;
}

export interface MessagePoller {
  id: string;
  endpoint_id: string;
  status: string;
  last_polled_at: string | null;
}

export class BackgroundTaskResource {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<BackgroundTask[]> {
    return this.http.request<BackgroundTask[]>("GET", "/v1/background-tasks");
  }

  async get(taskId: string): Promise<BackgroundTask> {
    return this.http.request<BackgroundTask>("GET", `/v1/background-tasks/${taskId}`);
  }

  async cancel(taskId: string): Promise<void> {
    await this.http.request<void>("POST", `/v1/background-tasks/${taskId}/cancel`);
  }
}

export class IntegrationResource {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<Integration[]> {
    return this.http.request<Integration[]>("GET", "/v1/integrations");
  }

  async get(integrationId: string): Promise<Integration> {
    return this.http.request<Integration>("GET", `/v1/integrations/${integrationId}`);
  }

  async delete(integrationId: string): Promise<void> {
    await this.http.request<void>("DELETE", `/v1/integrations/${integrationId}`);
  }

  async rotateKey(integrationId: string): Promise<{ key: string }> {
    return this.http.request("POST", `/v1/integrations/${integrationId}/rotate-key`);
  }
}

export class InboundResource {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<InboundWebhook[]> {
    return this.http.request<InboundWebhook[]>("GET", "/v1/inbound");
  }

  async get(inboundId: string): Promise<InboundWebhook> {
    return this.http.request<InboundWebhook>("GET", `/v1/inbound/${inboundId}`);
  }

  async create(params: { name: string; url: string }): Promise<InboundWebhook> {
    return this.http.request<InboundWebhook>("POST", "/v1/inbound", params);
  }

  async delete(inboundId: string): Promise<void> {
    await this.http.request<void>("DELETE", `/v1/inbound/${inboundId}`);
  }
}

export class TransformResource {
  constructor(private readonly http: HttpClient) {}

  async list(endpointId: string): Promise<Transform[]> {
    return this.http.request<Transform[]>("GET", `/v1/endpoints/${endpointId}/transforms`);
  }

  async create(endpointId: string, params: { name: string; code: string }): Promise<Transform> {
    return this.http.request<Transform>("POST", `/v1/endpoints/${endpointId}/transforms`, params);
  }

  async get(endpointId: string, transformId: string): Promise<Transform> {
    return this.http.request<Transform>("GET", `/v1/endpoints/${endpointId}/transforms/${transformId}`);
  }

  async update(endpointId: string, transformId: string, params: { name?: string; code?: string }): Promise<Transform> {
    return this.http.request<Transform>("PUT", `/v1/endpoints/${endpointId}/transforms/${transformId}`, params);
  }

  async delete(endpointId: string, transformId: string): Promise<void> {
    await this.http.request<void>("DELETE", `/v1/endpoints/${endpointId}/transforms/${transformId}`);
  }
}

export class PortalResource {
  constructor(private readonly http: HttpClient) {}

  async generateLink(params: { application_id: string }): Promise<PortalLink> {
    return this.http.request<PortalLink>("POST", "/v1/portal", params);
  }
}

export class ServiceTokenResource {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<ServiceToken[]> {
    return this.http.request<ServiceToken[]>("GET", "/v1/service-tokens");
  }

  async create(params: { name: string }): Promise<ServiceToken> {
    return this.http.request<ServiceToken>("POST", "/v1/service-tokens", params);
  }

  async delete(tokenId: string): Promise<void> {
    await this.http.request<void>("DELETE", `/v1/service-tokens/${tokenId}`);
  }
}

export class OperationalWebhookResource {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<OperationalWebhook[]> {
    return this.http.request<OperationalWebhook[]>("GET", "/v1/operational-webhooks");
  }

  async create(params: { url: string; events: string[] }): Promise<OperationalWebhook> {
    return this.http.request<OperationalWebhook>("POST", "/v1/operational-webhooks", params);
  }

  async get(webhookId: string): Promise<OperationalWebhook> {
    return this.http.request<OperationalWebhook>("GET", `/v1/operational-webhooks/${webhookId}`);
  }

  async delete(webhookId: string): Promise<void> {
    await this.http.request<void>("DELETE", `/v1/operational-webhooks/${webhookId}`);
  }
}

export class MessagePollerResource {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<MessagePoller[]> {
    return this.http.request<MessagePoller[]>("GET", "/v1/message-poller");
  }

  async poll(pollerId: string): Promise<unknown> {
    return this.http.request("POST", `/v1/message-poller/${pollerId}/poll`);
  }

  async seek(pollerId: string, params: { offset: number }): Promise<void> {
    await this.http.request("POST", `/v1/message-poller/${pollerId}/seek`, params);
  }

  async commit(pollerId: string): Promise<void> {
    await this.http.request("POST", `/v1/message-poller/${pollerId}/commit`);
  }
}
