import type { HttpClient } from "../http-client";
import type { SearchResult } from "../types";

export class SearchResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Search webhook deliveries.
   *
   * @example
   * ```ts
   * const results = await hs.search.deliveries("order.created");
   * console.log(results.deliveries);
   * ```
   */
  async deliveries(
    query: string,
    params?: { page?: number; per_page?: number },
  ): Promise<SearchResult> {
    const searchParams = new URLSearchParams({ q: query });
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.per_page) searchParams.set("per_page", String(params.per_page));

    return this.http.request<SearchResult>(
      "GET",
      `/v1/search?${searchParams.toString()}`,
    );
  }
}
