import type { HttpClient } from "../http-client";
import { paginate, Paginator } from "../pagination";
import type {
  Endpoint,
  EndpointCreate,
  EndpointUpdate,
  SecretRotateResponse,
} from "../types";

export class EndpointResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Create a new webhook endpoint.
   *
   * @example
   * ```ts
   * const ep = await hs.endpoint.create({
   *   url: "https://app.com/webhook",
   *   application_id: "app_123",
   *   description: "Order notifications",
   * });
   * ```
   */
  async create(params: EndpointCreate): Promise<Endpoint> {
    return this.http.request<Endpoint>("POST", "/v1/endpoints", params);
  }

  /**
   * List all endpoints.
   *
   * @example
   * ```ts
   * const endpoints = await hs.endpoint.list();
   * ```
   */
  list(perPage?: number): Paginator<Endpoint> {
    return paginate(async (page, per_page) => {
      const query = new URLSearchParams({ page: String(page), per_page: String(per_page) });
      return this.http.request<Endpoint[]>("GET", `/v1/endpoints?${query}`);
    }, perPage);
  }

  /**
   * Get an endpoint by ID.
   *
   * @example
   * ```ts
   * const ep = await hs.endpoint.get("ep_123");
   * ```
   */
  async get(endpointId: string): Promise<Endpoint> {
    return this.http.request<Endpoint>(
      "GET",
      `/v1/endpoints/${endpointId}`,
    );
  }

  /**
   * Update an endpoint.
   *
   * @example
   * ```ts
   * const ep = await hs.endpoint.update("ep_123", {
   *   url: "https://new-url.com/webhook",
   * });
   * ```
   */
  async update(endpointId: string, params: EndpointUpdate): Promise<Endpoint> {
    return this.http.request<Endpoint>(
      "PUT",
      `/v1/endpoints/${endpointId}`,
      params,
    );
  }

  /**
   * Delete an endpoint.
   *
   * @example
   * ```ts
   * await hs.endpoint.delete("ep_123");
   * ```
   */
  async delete(endpointId: string): Promise<void> {
    await this.http.request<void>(
      "DELETE",
      `/v1/endpoints/${endpointId}`,
    );
  }

  /**
   * Rotate the signing secret for an endpoint.
   * Old secret remains valid for 24 hours.
   *
   * @example
   * ```ts
   * const result = await hs.endpoint.rotateSecret("ep_123");
   * console.log(result.signing_secret);
   * ```
   */
  async rotateSecret(endpointId: string): Promise<SecretRotateResponse> {
    return this.http.request<SecretRotateResponse>(
      "POST",
      `/v1/endpoints/${endpointId}/rotate-secret`,
    );
  }
}
