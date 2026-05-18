import { Admin } from "./api/admin";
import { Alert } from "./api/alert";
import { Analytics } from "./api/analytics";
import { ApiKey } from "./api/apiKey";
import { Application } from "./api/application";
import { Authentication } from "./api/authentication";
import { AuditLog } from "./api/auditLog";
import { BackgroundTask } from "./api/backgroundTask";
import { Billing } from "./api/billing";
import { ConnectorApi } from "./api/connector";
import { CustomDomain } from "./api/customDomain";
import { Device } from "./api/device";
import { Endpoint } from "./api/endpoint";
import { Environment } from "./api/environment";
import { EventType } from "./api/eventType";
import { Health } from "./api/health";
import { Inbound } from "./api/inbound";
import { IntegrationApi } from "./api/integration";
import { Message } from "./api/message";
import { MessageAttempt } from "./api/messageAttempt";
import { MessagePoller } from "./api/messagePoller";
import { Notification } from "./api/notification";
import { OperationalWebhook } from "./api/operationalWebhook";
import { Portal } from "./api/portal";
import { RateLimit } from "./api/rateLimit";
import { Routing } from "./api/routing";
import { Schema } from "./api/schema";
import { Search } from "./api/search";
import { ServiceToken } from "./api/serviceToken";
import { Sso } from "./api/sso";
import { Statistics } from "./api/statistics";
import { StreamApi } from "./api/stream";
import { Team } from "./api/team";
import { Template } from "./api/template";
import { Transform } from "./api/transform";
import { subscribeToStream, type StreamOptions, type StreamSubscription } from "./stream";
import type { HookSniffRequestContext } from "./request";

export { type PostOptions, ApiException, type ResponseMetadata } from "./util";
import type { ResponseMetadata } from "./util";
export { type ListResponse, type ListOptions, createPaginator, paginate } from "./pagination";
export { HTTPValidationError, HttpErrorOut, ValidationError } from "./HttpErrors";
export {
  HookSniffError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  RateLimitError,
  InternalServerError,
  BadGatewayError,
  ServiceUnavailableError,
  GatewayTimeoutError,
  createErrorFromStatus,
  type ValidationErrorItem,
} from "./errors";
export * from "./webhook";
export * from "./webhook-events";
export * from "./stream";
export * from "./models/index";

export type { EndpointListOptions } from "./api/endpoint";
export type { EventTypeListOptions } from "./api/eventType";
export { type MessageListOptions, messageInRaw } from "./api/message";
export type { MessageAttemptListByEndpointOptions, MessageAttemptListByMsgOptions } from "./api/messageAttempt";
export type { PollOptions, SeekOptions, CommitOptions } from "./api/messagePoller";

export type HookSniffOptions = {
  debug?: boolean;
  serverUrl?: string;
  requestTimeout?: number;
  fetch?: typeof fetch;
} & (
  | { retryScheduleInMs?: number[]; numRetries?: never }
  | { numRetries?: number; retryScheduleInMs?: never }
);

const DEFAULT_BASE_URL = "https://hooksniff-api-1046140057667.europe-west1.run.app";

export class HookSniff {
  protected readonly requestCtx: HookSniffRequestContext;

  public constructor(token: string, options: HookSniffOptions = {}) {
    const baseUrl: string = options.serverUrl ?? DEFAULT_BASE_URL;

    if (options.retryScheduleInMs) {
      this.requestCtx = {
        baseUrl,
        token,
        timeout: options.requestTimeout,
        debug: options.debug,
        retryScheduleInMs: options.retryScheduleInMs,
        fetch: options.fetch,
      };
      return;
    }
    this.requestCtx = {
      baseUrl,
      token,
      timeout: options.requestTimeout,
      debug: options.debug,
      numRetries: options.numRetries ?? 2,
      fetch: options.fetch,
    };
  }

  /**
   * Response metadata from the last API call.
   * Updated automatically after each request on any resource.
   *
   * @example
   * ```ts
   * const endpoints = await client.endpoint.list();
   * console.log(client.lastResponse?.requestId);
   * console.log(client.lastResponse?.rateLimitRemaining);
   * ```
   */
  public get lastResponse(): ResponseMetadata | undefined {
    return this.requestCtx.lastResponse;
  }

  public get admin() { return new Admin(this.requestCtx); }
  public get alert() { return new Alert(this.requestCtx); }
  public get analytics() { return new Analytics(this.requestCtx); }
  public get apiKey() { return new ApiKey(this.requestCtx); }
  public get application() { return new Application(this.requestCtx); }
  public get authentication() { return new Authentication(this.requestCtx); }
  public get auditLog() { return new AuditLog(this.requestCtx); }
  public get backgroundTask() { return new BackgroundTask(this.requestCtx); }
  public get billing() { return new Billing(this.requestCtx); }
  public get connector() { return new ConnectorApi(this.requestCtx); }
  public get customDomain() { return new CustomDomain(this.requestCtx); }
  public get device() { return new Device(this.requestCtx); }
  public get endpoint() { return new Endpoint(this.requestCtx); }
  public get environment() { return new Environment(this.requestCtx); }
  public get eventType() { return new EventType(this.requestCtx); }
  public get health() { return new Health(this.requestCtx); }
  public get inbound() { return new Inbound(this.requestCtx); }
  public get integration() { return new IntegrationApi(this.requestCtx); }
  public get message() { return new Message(this.requestCtx); }
  public get messageAttempt() { return new MessageAttempt(this.requestCtx); }
  public get messagePoller() { return new MessagePoller(this.requestCtx); }
  public get notification() { return new Notification(this.requestCtx); }
  public get operationalWebhook() { return new OperationalWebhook(this.requestCtx); }
  public get portal() { return new Portal(this.requestCtx); }
  public get rateLimit() { return new RateLimit(this.requestCtx); }
  public get routing() { return new Routing(this.requestCtx); }
  public get schema() { return new Schema(this.requestCtx); }
  public get search() { return new Search(this.requestCtx); }
  public get serviceToken() { return new ServiceToken(this.requestCtx); }
  public get sso() { return new Sso(this.requestCtx); }
  public get statistics() { return new Statistics(this.requestCtx); }
  public get stream() { return new StreamApi(this.requestCtx); }
  public get team() { return new Team(this.requestCtx); }
  public get template() { return new Template(this.requestCtx); }
  public get transform() { return new Transform(this.requestCtx); }

  /**
   * Subscribe to real-time events via Server-Sent Events (SSE).
   *
   * @example
   * ```ts
   * const sub = hs.subscribe({
   *   eventTypes: ["order.created"],
   *   onEvent: (event) => console.log(event),
   * });
   *
   * // Later: sub.close();
   * ```
   */
  public subscribe(options: StreamOptions): StreamSubscription {
    return subscribeToStream(this.requestCtx, options);
  }
}
