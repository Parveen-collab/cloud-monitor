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

export interface HttpRequestMetric {
  endpoint: string;
  method: string;
  statusCode: string;
  count: number;
}

export interface LatencyMetric {
  endpoint: string;
  method: string;
  count: number;
  sum: number;
  avgMs: number;
}

export interface ProcessMetrics {
  residentMemoryBytes: number;
  virtualMemoryBytes: number;
  cpuSecondsTotal: number;
  openFds: number;
  maxFds: number;
  appHealthStatus: number;
  activeRequests: number;
  simulatedErrorsTotal: number;
  pythonVersion: string;
  gcCollections: {
    gen0: number;
    gen1: number;
    gen2: number;
  };
}

export interface ParsedPrometheusMetrics {
  process: ProcessMetrics;
  httpRequests: HttpRequestMetric[];
  latencies: LatencyMetric[];
  totalRequestsCount: number;
  rawText: string;
  timestamp: Date;
}

/**
 * Information returned by the backend root endpoint (/).
 */
export interface ProjectInfo {
  project: string;
  description: string;
  version: string;
  docs_url: string;
  metrics_url: string;
  health_url: string;
}