export class HookSniffError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly detail: string;

  constructor(statusCode: number, code: string, detail: string) {
    super(detail);
    this.name = "HookSniffError";
    this.statusCode = statusCode;
    this.code = code;
    this.detail = detail;
  }
}

export class AuthenticationError extends HookSniffError {
  constructor(detail = "Invalid API key") {
    super(401, "UNAUTHORIZED", detail);
    this.name = "AuthenticationError";
  }
}

export class NotFoundError extends HookSniffError {
  constructor(detail = "Resource not found") {
    super(404, "NOT_FOUND", detail);
    this.name = "NotFoundError";
  }
}

export class RateLimitError extends HookSniffError {
  public readonly retryAfter: number;

  constructor(detail = "Rate limited", retryAfter = 60) {
    super(429, "RATE_LIMITED", detail);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

export class ValidationError extends HookSniffError {
  constructor(detail = "Validation failed") {
    super(400, "BAD_REQUEST", detail);
    this.name = "ValidationError";
  }
}

export class ServerError extends HookSniffError {
  constructor(detail = "Internal server error") {
    super(500, "INTERNAL_ERROR", detail);
    this.name = "ServerError";
  }
}

export function mapError(statusCode: number, body: { error?: { code?: string; detail?: string; message?: string } }): HookSniffError {
  const code = body.error?.code || "UNKNOWN";
  const detail = body.error?.detail || body.error?.message || "Unknown error";

  switch (statusCode) {
    case 401:
      return new AuthenticationError(detail);
    case 404:
      return new NotFoundError(detail);
    case 429:
      return new RateLimitError(detail);
    case 400:
    case 422:
      return new ValidationError(detail);
    default:
      if (statusCode >= 500) {
        return new ServerError(detail);
      }
      return new HookSniffError(statusCode, code, detail);
  }
}
