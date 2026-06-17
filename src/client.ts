import { HttpClient } from "./http-client";
import { ApplicationResource } from "./resources/application";
import { EndpointResource } from "./resources/endpoint";
import { WebhookResource } from "./resources/webhook";
import { ApiKeyResource } from "./resources/api-key";
import { AnalyticsResource } from "./resources/analytics";
import { SearchResource } from "./resources/search";
import { HealthResource } from "./resources/health";
import { TeamResource } from "./resources/team";
import { BillingResource } from "./resources/billing";
import { NotificationResource, BroadcastResource } from "./resources/notification";
import { SsoResource, CustomDomainResource, EnvironmentResource } from "./resources/platform";
import { CortexResource } from "./resources/cortex";
import { TemplateResource, SchemaResource, AlertResource } from "./resources/templates";
import { RateLimitResource, AuditResource } from "./resources/routing";
import { ConnectorResource } from "./resources/connector";
import { BackgroundTaskResource, IntegrationResource, TransformResource, PortalResource, ServiceTokenResource, OperationalWebhookResource } from "./resources/advanced";
import { StreamResource } from "./resources/stream";
import type { ClientConfig, User } from "./types";

/**
 * HookSniff SDK client.
 *
 * @example
 * ```ts
 * import { HookSniff } from "hooksniff-sdk";
 *
 * const hs = new HookSniff("hr_live_...");
 *
 * // Create an application
 * const app = await hs.application.create({ name: "My App" });
 *
 * // Create an endpoint
 * const ep = await hs.endpoint.create({
 *   url: "https://app.com/webhook",
 *   application_id: app.id,
 * });
 *
 * // Send a webhook
 * await hs.webhook.send({
 *   endpoint_id: ep.id,
 *   event: "order.created",
 *   data: { order_id: "12345" },
 * });
 *
 * // Auto-pagination
 * for await (const ep of hs.endpoint.list()) {
 *   console.log(ep.url);
 * }
 * ```
 */
export class HookSniff {
  private readonly http: HttpClient;

  /** Application management */
  public readonly application: ApplicationResource;

  /** Endpoint management */
  public readonly endpoint: EndpointResource;

  /** Webhook send and management */
  public readonly webhook: WebhookResource;

  /** API key management */
  public readonly apiKey: ApiKeyResource;

  /** Delivery analytics */
  public readonly analytics: AnalyticsResource;

  /** Search deliveries */
  public readonly search: SearchResource;

  /** Health checks and outbound IPs */
  public readonly health: HealthResource;

  /** Team management */
  public readonly team: TeamResource;

  /** Billing and subscriptions */
  public readonly billing: BillingResource;

  /** Notifications */
  public readonly notification: NotificationResource;

  /** Broadcasts */
  public readonly broadcast: BroadcastResource;

  /** SSO configuration */
  public readonly sso: SsoResource;

  /** Custom domains */
  public readonly customDomain: CustomDomainResource;

  /** Environments */
  public readonly environment: EnvironmentResource;

  /** Cortex AI */
  public readonly cortex: CortexResource;

  /** Payload templates */
  public readonly template: TemplateResource;

  /** Schema registry */
  public readonly schema: SchemaResource;

  /** Alert rules */
  public readonly alert: AlertResource;

  /** Routing rules */

  /** Rate limits */
  public readonly rateLimit: RateLimitResource;

  /** Audit log */
  public readonly audit: AuditResource;

  /** Connectors */
  public readonly connector: ConnectorResource;

  /** Streaming (SSE) */
  public readonly stream: StreamResource;

  /** Background tasks */
  public readonly backgroundTask: BackgroundTaskResource;

  /** Integrations */
  public readonly integration: IntegrationResource;

  /** Inbound webhooks */

  /** Payload transforms */
  public readonly transform: TransformResource;

  /** Customer portal */
  public readonly portal: PortalResource;

  /** Service tokens */
  public readonly serviceToken: ServiceTokenResource;

  /** Operational webhooks */
  public readonly operationalWebhook: OperationalWebhookResource;

  /** Message poller */

  constructor(apiKey: string, config?: ClientConfig) {
    this.http = new HttpClient(apiKey, config);
    this.application = new ApplicationResource(this.http);
    this.endpoint = new EndpointResource(this.http);
    this.webhook = new WebhookResource(this.http);
    this.apiKey = new ApiKeyResource(this.http);
    this.analytics = new AnalyticsResource(this.http);
    this.search = new SearchResource(this.http);
    this.health = new HealthResource(this.http);
    this.team = new TeamResource(this.http);
    this.billing = new BillingResource(this.http);
    this.notification = new NotificationResource(this.http);
    this.broadcast = new BroadcastResource(this.http);
    this.sso = new SsoResource(this.http);
    this.customDomain = new CustomDomainResource(this.http);
    this.environment = new EnvironmentResource(this.http);
    this.cortex = new CortexResource(this.http);
    this.template = new TemplateResource(this.http);
    this.schema = new SchemaResource(this.http);
    this.alert = new AlertResource(this.http);
    this.rateLimit = new RateLimitResource(this.http);
    this.audit = new AuditResource(this.http);
    this.connector = new ConnectorResource(this.http);
    this.stream = new StreamResource(this.http);
    this.backgroundTask = new BackgroundTaskResource(this.http);
    this.integration = new IntegrationResource(this.http);
    this.transform = new TransformResource(this.http);
    this.portal = new PortalResource(this.http);
    this.serviceToken = new ServiceTokenResource(this.http);
    this.operationalWebhook = new OperationalWebhookResource(this.http);
  }

  /**
   * Get the current user profile.
   *
   * @example
   * ```ts
   * const user = await hs.me();
   * console.log(user.email);
   * ```
   */
  async me(): Promise<User> {
    return this.http.request<User>("GET", "/v1/auth/me");
  }
}
