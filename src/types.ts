export interface Application {
  id: string;
  customer_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  endpoint_count: number;
}

export interface ApplicationCreate {
  name: string;
  description?: string;
}

export interface ApplicationUpdate {
  name?: string;
  description?: string;
}

export interface Endpoint {
  id: string;
  url: string;
  description: string | null;
  is_active: boolean;
  retry_policy: Record<string, unknown> | null;
  created_at: string;
  allowed_ips: string[] | null;
  event_filter: string[] | null;
  custom_headers: Record<string, string> | null;
  routing_strategy: "round-robin" | "failover" | "weighted" | "random";
  fallback_url: string | null;
  avg_response_ms: number;
  failure_streak: number;
  format: string;
  application_id: string;
}

export interface EndpointCreate {
  url: string;
  application_id: string;
  description?: string;
  allowed_ips?: string[];
  event_filter?: string[];
  custom_headers?: Record<string, string>;
  routing_strategy?: "round-robin" | "failover" | "weighted" | "random";
  fallback_url?: string;
}

export interface EndpointUpdate {
  url?: string;
  description?: string;
  is_active?: boolean;
  allowed_ips?: string[];
  event_filter?: string[];
  custom_headers?: Record<string, string>;
  routing_strategy?: "round-robin" | "failover" | "weighted" | "random";
  fallback_url?: string;
}

export interface WebhookDelivery {
  id: string;
  endpoint_id: string;
  event: string;
  status: "pending" | "success" | "failed";
  attempt_count: number;
  response_status: number | null;
  replay_count: number;
  created_at: string;
  is_test: boolean;
}

export interface WebhookSend {
  endpoint_id: string;
  event: string;
  data: Record<string, unknown>;
  is_test?: boolean;
}

export interface ApiKey {
  id: string;
  name: string;
  api_key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

export interface ApiKeyCreated {
  id: string;
  key: string;
  prefix: string;
  message: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  api_key: string | null;
  plan: string;
  webhook_limit: number;
  webhook_count: number;
  is_admin: boolean;
  created_at: string;
  avatar_url: string | null;
  is_sso: boolean;
}

export interface SearchResult {
  deliveries: WebhookDelivery[];
  total: number;
  page: number;
  per_page: number;
  query: string;
}

export interface OutboundIps {
  ips: string[];
  updated_at: string;
}

export interface HealthResponse {
  status: string;
  _cache?: string;
  api?: { status: string; uptime_seconds: number };
  database: { status: string; latency_ms: number };
  redis: { status: string; latency_ms: number; note?: string };
  queue: { pending: number; processing: number; failed: number };
  checks?: Record<string, { status: string; latency_ms?: number }>;
}

export interface SecretRotateResponse {
  id: string;
  message: string;
  old_secret_valid_until: string;
  signing_secret: string;
}

export interface ListResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  per_page?: number;
}

export interface Subscription {
  plan: string;
  status: string;
  payment_provider?: string;
  stripe_subscription_id?: string | null;
  polar_subscription_id?: string | null;
  iyzico_subscription_id?: string | null;
  webhook_limit: number;
  endpoint_limit?: number;
  retention_days?: number;
  monthly_price_cents?: number;
  monthly_price_kurus?: number;
  cancel_at_period_end?: boolean;
  billing_period?: string;
  current_period_end?: string;
  card_last4?: string | null;
  card_brand?: string | null;
  card_exp_month?: string | null;
  card_exp_year?: string | null;
  has_used_startup_trial?: boolean;
}

export interface ClientConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}
