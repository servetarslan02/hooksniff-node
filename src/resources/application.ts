import type { HttpClient } from "../http-client";
import { paginate, Paginator } from "../pagination";
import type {
  Application,
  ApplicationCreate,
  ApplicationUpdate,
} from "../types";

export class ApplicationResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Create a new application.
   *
   * @example
   * ```ts
   * const app = await hs.application.create({ name: "My App" });
   * ```
   */
  async create(params: ApplicationCreate): Promise<Application> {
    return this.http.request<Application>("POST", "/v1/applications", params);
  }

  /**
   * List all applications.
   *
   * @example
   * ```ts
   * const apps = await hs.application.list();
   * ```
   */
  list(perPage?: number): Paginator<Application> {
    return paginate(async (page, per_page) => {
      const query = new URLSearchParams({ page: String(page), per_page: String(per_page) });
      return this.http.request<Application[]>("GET", `/v1/applications?${query}`);
    }, perPage);
  }

  /**
   * Get an application by ID.
   *
   * @example
   * ```ts
   * const app = await hs.application.get("app_123");
   * ```
   */
  async get(applicationId: string): Promise<Application> {
    return this.http.request<Application>(
      "GET",
      `/v1/applications/${applicationId}`,
    );
  }

  /**
   * Update an application.
   *
   * @example
   * ```ts
   * const app = await hs.application.update("app_123", { name: "New Name" });
   * ```
   */
  async update(
    applicationId: string,
    params: ApplicationUpdate,
  ): Promise<Application> {
    return this.http.request<Application>(
      "PUT",
      `/v1/applications/${applicationId}`,
      params,
    );
  }

  /**
   * Delete an application.
   *
   * @example
   * ```ts
   * await hs.application.delete("app_123");
   * ```
   */
  async delete(applicationId: string): Promise<void> {
    await this.http.request<void>(
      "DELETE",
      `/v1/applications/${applicationId}`,
    );
  }
}
