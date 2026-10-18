export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  service: string;
  version: string;
  environment: string;
  uptime_seconds: number;
  components: {
    api: string;
    metrics_exporter: string;
    engine: string;
  };
}

export interface ServiceStatus {
  service: string;
  status: string;
  timestamp: number;
  monitoring: {
    metrics_enabled: boolean;
    target: string;
  };
}

export interface LatencyResponse {
  message: string;
  delayed_by: number;
}