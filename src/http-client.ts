import { mapError, RateLimitError, HookSniffError } from "./errors";
import type { ClientConfig } from "./types";

const DEFAULT_BASE_URL = "https://hooksniff-api-e6ztf3x2ma-ew.a.run.app";
const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_RETRIES = 3;
const SDK_VERSION = "0.4.9";

export class HttpClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly retries: number;
  private readonly extraHeaders: Record<string, string>;

  constructor(apiKey: string, config: ClientConfig = {}) {
    if (!apiKey) {
      throw new Error("HookSniff API key is required");
    }
    this.apiKey = apiKey;
    this.baseUrl = (config.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, "");
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
    this.retries = config.retries ?? DEFAULT_RETRIES;
    this.extraHeaders = config.headers || {};
  }

  async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options: { idempotencyKey?: string } = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": `hooksniff-sdk/node/${SDK_VERSION}`,
      ...this.extraHeaders,
    };

    if (options.idempotencyKey) {
      headers["Idempotency-Key"] = options.idempotencyKey;
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const text = await response.text();
          if (!text) return undefined as T;
          return JSON.parse(text) as T;
        }

        const errorBody: any = await response.json().catch(() => ({}));

        // Don't retry client errors (4xx) except 429 and 408 (timeout)
        if (response.status >= 400 && response.status < 500 && response.status !== 429 && response.status !== 408) {
          throw mapError(response.status, errorBody as any);
        }

        // Handle rate limiting with retry
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get("Retry-After") || "60", 10);
          if (attempt < this.retries) {
            await sleep(retryAfter * 1000);
            continue;
          }
          throw new RateLimitError(errorBody.error?.detail, retryAfter);
        }

        // Server errors - retry with exponential backoff
        lastError = mapError(response.status, errorBody as any);
        if (attempt < this.retries) {
          await sleep(Math.pow(2, attempt) * 1000 + Math.random() * 1000);
          continue;
        }

        throw lastError;
      } catch (error) {
        if (error instanceof HookSniffError) {
          throw error;
        }
        lastError = error as Error;
        if (attempt < this.retries) {
          await sleep(Math.pow(2, attempt) * 1000 + Math.random() * 1000);
          continue;
        }
      }
    }

    throw lastError || new Error("Request failed after retries");
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
