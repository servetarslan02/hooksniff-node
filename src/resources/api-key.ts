import type { HttpClient } from "../http-client";
import type { ApiKey, ApiKeyCreated } from "../types";

export class ApiKeyResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List all API keys.
   *
   * @example
   * ```ts
   * const keys = await hs.apiKey.list();
   * ```
   */
  async list(): Promise<ApiKey[]> {
    return this.http.request<ApiKey[]>("GET", "/v1/api-keys");
  }

  /**
   * Create a new API key.
   * The full key is only returned once — save it immediately.
   *
   * @example
   * ```ts
   * const result = await hs.apiKey.create({ name: "Production Key" });
   * console.log(result.key); // hr_live_... — save this!
   * ```
   */
  async create(params: { name: string }): Promise<ApiKeyCreated> {
    return this.http.request<ApiKeyCreated>("POST", "/v1/api-keys", params);
  }

  /**
   * Delete an API key.
   *
   * @example
   * ```ts
   * await hs.apiKey.delete("key_123");
   * ```
   */
  async delete(apiKeyId: string): Promise<{ deleted: boolean }> {
    return this.http.request<{ deleted: boolean }>("DELETE", `/v1/api-keys/${apiKeyId}`);
  }
}
