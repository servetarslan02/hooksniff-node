export interface PostOptions {
  idempotencyKey?: string;
}

/**
 * Response metadata from the last API request.
 * Access via `client.<resource>.lastResponse` after any API call.
 *
 * @example
 * ```ts
 * const endpoints = await client.endpoint.list();
 * console.log(client.endpoint.lastResponse?.requestId);
 * console.log(client.endpoint.lastResponse?.rateLimitRemaining);
 * ```
 */
export interface ResponseMetadata {
  /** HTTP status code */
  statusCode: number;
  /** x-request-id header — use for debugging with HookSniff support */
  requestId?: string;
  /** x-ratelimit-remaining — remaining requests in current window */
  rateLimitRemaining?: number;
  /** x-ratelimit-reset — Unix timestamp when rate limit resets */
  rateLimitReset?: number;
  /** All response headers as a plain object */
  headers: Record<string, string>;
}

export class ApiException<T> extends Error {
  public headers: Record<string, string> = {};

  public constructor(
    public code: number,
    public body: T,
    headers: Headers
  ) {
    super(`HTTP-Code: ${code}\nHeaders: ${JSON.stringify(headers)}`);

    headers.forEach((value: string, name: string) => {
      this.headers[name] = value;
    });
  }
}

export type XOR<T, U> =
  | (T & { [K in keyof U]?: never })
  | (U & { [K in keyof T]?: never });
