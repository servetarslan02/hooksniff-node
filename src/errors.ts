/**
 * HookSniff Error Classes
 *
 * Provides specific error types for different HTTP status codes.
 * All errors extend `HookSniffError` which extends `Error`.
 */

/** Base error class for all HookSniff errors */
export class HookSniffError extends Error {
  public readonly statusCode: number;
  public readonly headers: Record<string, string>;

  constructor(statusCode: number, message: string, headers: Record<string, string> = {}) {
    super(message);
    this.name = "HookSniffError";
    this.statusCode = statusCode;
    this.headers = headers;
  }
}

/** 400 Bad Request — The request was malformed or missing required fields */
export class BadRequestError extends HookSniffError {
  public readonly detail?: string;

  constructor(detail?: string, headers: Record<string, string> = {}) {
    super(400, detail || "Bad request", headers);
    this.name = "BadRequestError";
    this.detail = detail;
  }
}

/** 401 Unauthorized — Invalid or missing authentication */
export class UnauthorizedError extends HookSniffError {
  constructor(message?: string, headers: Record<string, string> = {}) {
    super(401, message || "Unauthorized", headers);
    this.name = "UnauthorizedError";
  }
}

/** 403 Forbidden — Insufficient permissions */
export class ForbiddenError extends HookSniffError {
  constructor(message?: string, headers: Record<string, string> = {}) {
    super(403, message || "Forbidden", headers);
    this.name = "ForbiddenError";
  }
}

/** 404 Not Found — Resource does not exist */
export class NotFoundError extends HookSniffError {
  public readonly resourceType?: string;
  public readonly resourceId?: string;

  constructor(message?: string, headers: Record<string, string> = {}) {
    super(404, message || "Not found", headers);
    this.name = "NotFoundError";
  }
}

/** 409 Conflict — Resource already exists or conflict with current state */
export class ConflictError extends HookSniffError {
  constructor(message?: string, headers: Record<string, string> = {}) {
    super(409, message || "Conflict", headers);
    this.name = "ConflictError";
  }
}

/** 422 Unprocessable Entity — Validation error */
export class UnprocessableEntityError extends HookSniffError {
  public readonly validationErrors: ValidationErrorItem[];

  constructor(
    validationErrors: ValidationErrorItem[] = [],
    message?: string,
    headers: Record<string, string> = {}
  ) {
    super(422, message || "Unprocessable entity", headers);
    this.name = "UnprocessableEntityError";
    this.validationErrors = validationErrors;
  }
}

/** 429 Too Many Requests — Rate limit exceeded */
export class RateLimitError extends HookSniffError {
  public readonly retryAfter?: number;

  constructor(retryAfter?: number, headers: Record<string, string> = {}) {
    super(429, `Rate limit exceeded${retryAfter ? ` (retry after ${retryAfter}s)` : ""}`, headers);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

/** 500 Internal Server Error */
export class InternalServerError extends HookSniffError {
  constructor(message?: string, headers: Record<string, string> = {}) {
    super(500, message || "Internal server error", headers);
    this.name = "InternalServerError";
  }
}

/** 502 Bad Gateway */
export class BadGatewayError extends HookSniffError {
  constructor(message?: string, headers: Record<string, string> = {}) {
    super(502, message || "Bad gateway", headers);
    this.name = "BadGatewayError";
  }
}

/** 503 Service Unavailable */
export class ServiceUnavailableError extends HookSniffError {
  constructor(message?: string, headers: Record<string, string> = {}) {
    super(503, message || "Service unavailable", headers);
    this.name = "ServiceUnavailableError";
  }
}

/** 504 Gateway Timeout */
export class GatewayTimeoutError extends HookSniffError {
  constructor(message?: string, headers: Record<string, string> = {}) {
    super(504, message || "Gateway timeout", headers);
    this.name = "GatewayTimeoutError";
  }
}

/** 408 Request Timeout — The server timed out waiting for the request */
export class RequestTimeoutError extends HookSniffError {
  constructor(message?: string, headers: Record<string, string> = {}) {
    super(408, message || "Request timeout", headers);
    this.name = "RequestTimeoutError";
  }
}

/** 410 Gone — The resource has been permanently removed */
export class GoneError extends HookSniffError {
  constructor(message?: string, headers: Record<string, string> = {}) {
    super(410, message || "Gone", headers);
    this.name = "GoneError";
  }
}

/** 413 Payload Too Large — The request body exceeds the server limit */
export class PayloadTooLargeError extends HookSniffError {
  constructor(message?: string, headers: Record<string, string> = {}) {
    super(413, message || "Payload too large", headers);
    this.name = "PayloadTooLargeError";
  }
}

/** 501 Not Implemented — The server does not support this functionality */
export class NotImplementedError extends HookSniffError {
  constructor(message?: string, headers: Record<string, string> = {}) {
    super(501, message || "Not implemented", headers);
    this.name = "NotImplementedError";
  }
}

/** 507 Insufficient Storage — The server cannot store the representation */
export class InsufficientStorageError extends HookSniffError {
  constructor(message?: string, headers: Record<string, string> = {}) {
    super(507, message || "Insufficient storage", headers);
    this.name = "InsufficientStorageError";
  }
}

/** 508 Loop Detected — The server detected an infinite loop */
export class LoopDetectedError extends HookSniffError {
  constructor(message?: string, headers: Record<string, string> = {}) {
    super(508, message || "Loop detected", headers);
    this.name = "LoopDetectedError";
  }
}

/** Timeout — request exceeded the configured timeout (non-HTTP) */
export class TimeoutError extends HookSniffError {
  constructor(message?: string, headers: Record<string, string> = {}) {
    super(0, message || "Request timeout", headers);
    this.name = "TimeoutError";
  }
}

/** Network error — connection failed, DNS error, etc. (non-HTTP) */
export class NetworkError extends HookSniffError {
  constructor(message?: string, headers: Record<string, string> = {}) {
    super(0, message || "Network error", headers);
    this.name = "NetworkError";
  }
}

/** Authentication error — token invalid, expired, or missing */
export class AuthenticationError extends HookSniffError {
  constructor(message?: string, headers: Record<string, string> = {}) {
    super(401, message || "Authentication failed", headers);
    this.name = "AuthenticationError";
  }
}

/** Validation error item from 422 responses */
export interface ValidationErrorItem {
  /** Location of the error (e.g., ["body", "email"]) */
  loc: string[];
  /** Error message */
  msg: string;
  /** Error type (e.g., "value_error", "type_error") */
  type: string;
}

/**
 * Create the appropriate error class from a status code and response body.
 */
export function createErrorFromStatus(
  statusCode: number,
  body: any,
  headers: Record<string, string> = {}
): HookSniffError {
  switch (statusCode) {
    case 400:
      return new BadRequestError(body?.detail, headers);
    case 401:
      return new UnauthorizedError(body?.detail, headers);
    case 403:
      return new ForbiddenError(body?.detail, headers);
    case 404:
      return new NotFoundError(body?.detail, headers);
    case 409:
      return new ConflictError(body?.detail, headers);
    case 422:
      return new UnprocessableEntityError(body?.detail || [], body?.detail, headers);
    case 429: {
      const retryAfter = headers["retry-after"]
        ? parseInt(headers["retry-after"], 10)
        : undefined;
      return new RateLimitError(retryAfter, headers);
    }
    case 500:
      return new InternalServerError(body?.detail, headers);
    case 502:
      return new BadGatewayError(body?.detail, headers);
    case 503:
      return new ServiceUnavailableError(body?.detail, headers);
    case 504:
      return new GatewayTimeoutError(body?.detail, headers);
    case 408:
      return new RequestTimeoutError(body?.detail, headers);
    case 410:
      return new GoneError(body?.detail, headers);
    case 413:
      return new PayloadTooLargeError(body?.detail, headers);
    case 501:
      return new NotImplementedError(body?.detail, headers);
    case 507:
      return new InsufficientStorageError(body?.detail, headers);
    case 508:
      return new LoopDetectedError(body?.detail, headers);
    default:
      return new HookSniffError(
        statusCode,
        body?.detail || `HTTP ${statusCode}`,
        headers
      );
  }
}
