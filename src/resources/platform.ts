import type { HttpClient } from "../http-client";

export interface SsoConfig {
  id: string;
  domain: string;
  provider: string;
  enabled: boolean;
  created_at: string;
}

export interface CustomDomain {
  id: string;
  domain: string;
  status: "pending" | "verified" | "failed";
  created_at: string;
}

export interface Environment {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  environment_id: string;
}

export class SsoResource {
  constructor(private readonly http: HttpClient) {}

  async getConfig(): Promise<SsoConfig[]> {
    return this.http.request<SsoConfig[]>("GET", "/v1/sso/config");
  }

  async createConfig(params: { domain: string; provider: string }): Promise<SsoConfig> {
    return this.http.request<SsoConfig>("POST", "/v1/sso/config", params);
  }

  async deleteConfig(configId: string): Promise<void> {
    await this.http.request<void>("DELETE", `/v1/sso/config/${configId}`);
  }
}

export class CustomDomainResource {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<CustomDomain[]> {
    return this.http.request<CustomDomain[]>("GET", "/v1/custom-domains");
  }

  async create(params: { domain: string }): Promise<CustomDomain> {
    return this.http.request<CustomDomain>("POST", "/v1/custom-domains", params);
  }

  async verify(domainId: string): Promise<CustomDomain> {
    return this.http.request<CustomDomain>("POST", `/v1/custom-domains/${domainId}/verify`);
  }

  async delete(domainId: string): Promise<void> {
    await this.http.request<void>("DELETE", `/v1/custom-domains/${domainId}`);
  }
}

export class EnvironmentResource {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<Environment[]> {
    return this.http.request<Environment[]>("GET", "/v1/environments");
  }

  async create(params: { name: string; description?: string }): Promise<Environment> {
    return this.http.request<Environment>("POST", "/v1/environments", params);
  }

  async get(environmentId: string): Promise<Environment> {
    return this.http.request<Environment>("GET", `/v1/environments/${environmentId}`);
  }

  async delete(environmentId: string): Promise<void> {
    await this.http.request<void>("DELETE", `/v1/environments/${environmentId}`);
  }

  async listVariables(environmentId: string): Promise<EnvironmentVariable[]> {
    return this.http.request<EnvironmentVariable[]>("GET", `/v1/environments/${environmentId}/variables`);
  }

  async setVariable(environmentId: string, params: { key: string; value: string }): Promise<EnvironmentVariable> {
    return this.http.request<EnvironmentVariable>("POST", `/v1/environments/${environmentId}/variables`, params);
  }

  async deleteVariable(environmentId: string, variableId: string): Promise<void> {
    await this.http.request<void>("DELETE", `/v1/environments/${environmentId}/variables/${variableId}`);
  }
}
