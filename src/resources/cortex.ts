import type { HttpClient } from "../http-client";

export interface CortexInsight {
  id: number;
  customer_id: string;
  type: string;
  title: string;
  description: string;
  severity: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export class CortexResource {
  constructor(private readonly http: HttpClient) {}

  async insights(): Promise<CortexInsight[]> {
    const response = await this.http.request<{ insights: unknown[][] }>("GET", "/v1/cortex/insights");
    // API returns array of arrays, convert to objects
    return (response.insights || []).map((row: unknown[]) => ({
      id: row[0] as number,
      customer_id: row[1] as string,
      type: row[2] as string,
      title: row[3] as string,
      description: row[4] as string,
      severity: row[5] as string,
      metadata: (row[7] as Record<string, unknown>) || {},
      created_at: row[9] as string,
    }));
  }

  async anomalies(params?: { endpoint_id?: string }): Promise<unknown[]> {
    const query = params?.endpoint_id ? `?endpoint_id=${params.endpoint_id}` : "";
    return this.http.request<unknown[]>("GET", `/v1/cortex/anomalies${query}`);
  }

  async predict(endpointId: string): Promise<{ health_score: number; predicted_failures: number; confidence: number }> {
    return this.http.request("GET", `/v1/cortex/predict/${endpointId}`);
  }

  async autoHeal(endpointId: string): Promise<{ action: string; status: string }> {
    return this.http.request("POST", `/v1/cortex/auto-heal/${endpointId}`);
  }
}
