import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

/** Search webhook deliveries. */
export class Search {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** Search deliveries. */
  async search(params: Record<string, string>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/search");
    req.setQueryParams(params);
    return req.send(this.ctx, (j) => j);
  }
}
