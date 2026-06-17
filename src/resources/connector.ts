import type { HttpClient } from "../http-client";

export interface Connector {
  id: string;
  name: string;
  description: string | null;
  type: string;
  created_at: string;
}

export interface ConnectorConfig {
  id: string;
  connector_id: string;
  name: string;
  config: Record<string, unknown>;
  created_at: string;
}

export class ConnectorResource {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<Connector[]> {
    return this.http.request<Connector[]>("GET", "/connectors");
  }

  async get(connectorId: string): Promise<Connector> {
    return this.http.request<Connector>("GET", `/connectors/${connectorId}`);
  }

  async listConfigs(): Promise<ConnectorConfig[]> {
    return this.http.request<ConnectorConfig[]>("GET", "/connectors/configs");
  }

  async createConfig(params: { connector_id: string; name: string; config: Record<string, unknown> }): Promise<ConnectorConfig> {
    return this.http.request<ConnectorConfig>("POST", "/connectors/configs", params);
  }

  async getConfig(configId: string): Promise<ConnectorConfig> {
    return this.http.request<ConnectorConfig>("GET", `/connectors/configs/${configId}`);
  }

  async updateConfig(configId: string, params: { name?: string; config?: Record<string, unknown> }): Promise<ConnectorConfig> {
    return this.http.request<ConnectorConfig>("PUT", `/connectors/configs/${configId}`, params);
  }

  async deleteConfig(configId: string): Promise<void> {
    await this.http.request<void>("DELETE", `/connectors/configs/${configId}`);
  }
}
