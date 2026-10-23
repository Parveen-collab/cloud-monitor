import type {
  HttpRequestMetric,
  LatencyMetric,
  ParsedPrometheusMetrics,
  ProcessMetrics,
} from 'src/types/monitor';

export interface ParsedMetricSample {
  name: string;
  labels: Record<string, string>;
  value: number;
}

/**
 * Parses Prometheus text exposition format line by line.
 */
export function parsePrometheusText(rawText: string): ParsedPrometheusMetrics {
  const lines = rawText.split('\n');
  const samples: ParsedMetricSample[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    // Match metric_name{labels} value OR metric_name value
    const match = line.match(/^([a-zA-Z_:][a-zA-Z0-9_:]*)(?:\{([^}]+)\})?\s+([^\s]+)/);
    if (!match) continue;

    const [, name, labelsStr, valStr] = match;
    const value = parseFloat(valStr);
    if (isNaN(value)) continue;

    const labels: Record<string, string> = {};
    if (labelsStr) {
      // Parse key="value", key="value"
      const labelRegex = /([a-zA-Z_0-9]+)="([^"]*)"/g;
      let labelMatch;
      while ((labelMatch = labelRegex.exec(labelsStr)) !== null) {
        labels[labelMatch[1]] = labelMatch[2];
      }
    }

    samples.push({ name, labels, value });
  }

  // Extract Process & App KPIs
  const process: ProcessMetrics = {
    residentMemoryBytes: 0,
    virtualMemoryBytes: 0,
    cpuSecondsTotal: 0,
    openFds: 0,
    maxFds: 1048576,
    appHealthStatus: 1,
    activeRequests: 0,
    simulatedErrorsTotal: 0,
    pythonVersion: '3.12',
    gcCollections: {
      gen0: 0,
      gen1: 0,
      gen2: 0,
    },
  };

  const httpRequests: HttpRequestMetric[] = [];
  const latencyCounts: Record<string, { count: number; endpoint: string; method: string }> = {};
  const latencySums: Record<string, number> = {};

  for (const s of samples) {
    switch (s.name) {
      case 'process_resident_memory_bytes':
        process.residentMemoryBytes = s.value;
        break;
      case 'process_virtual_memory_bytes':
        process.virtualMemoryBytes = s.value;
        break;
      case 'process_cpu_seconds_total':
        process.cpuSecondsTotal = s.value;
        break;
      case 'process_open_fds':
        process.openFds = s.value;
        break;
      case 'process_max_fds':
        process.maxFds = s.value;
        break;
      case 'cloudmonitor_app_health_status':
        process.appHealthStatus = s.value;
        break;
      case 'cloudmonitor_active_requests':
        process.activeRequests = s.value;
        break;
      case 'cloudmonitor_simulated_errors_total':
        process.simulatedErrorsTotal = s.value;
        break;
      case 'python_info':
        if (s.labels.version) {
          process.pythonVersion = s.labels.version;
        }
        break;
      case 'python_gc_collections_total':
        if (s.labels.generation === '0') process.gcCollections.gen0 = s.value;
        if (s.labels.generation === '1') process.gcCollections.gen1 = s.value;
        if (s.labels.generation === '2') process.gcCollections.gen2 = s.value;
        break;
      case 'cloudmonitor_http_requests_total':
        httpRequests.push({
          endpoint: s.labels.endpoint || 'unknown',
          method: s.labels.method || 'GET',
          statusCode: s.labels.status_code || '200',
          count: s.value,
        });
        break;
      case 'cloudmonitor_http_request_duration_seconds_count': {
        const key = `${s.labels.endpoint || ''}::${s.labels.method || ''}`;
        latencyCounts[key] = {
          count: s.value,
          endpoint: s.labels.endpoint || 'unknown',
          method: s.labels.method || 'GET',
        };
        break;
      }
      case 'cloudmonitor_http_request_duration_seconds_sum': {
        const key = `${s.labels.endpoint || ''}::${s.labels.method || ''}`;
        latencySums[key] = s.value;
        break;
      }
    }
  }

  // Calculate Average Latencies
  const latencies: LatencyMetric[] = Object.keys(latencyCounts).map((key) => {
    const item = latencyCounts[key];
    const sum = latencySums[key] || 0;
    const avgSeconds = item.count > 0 ? sum / item.count : 0;
    return {
      endpoint: item.endpoint,
      method: item.method,
      count: item.count,
      sum,
      avgMs: Math.round(avgSeconds * 1000 * 100) / 100, // round to 2 decimals
    };
  });

  const totalRequestsCount = httpRequests.reduce((acc, curr) => acc + curr.count, 0);

  return {
    process,
    httpRequests,
    latencies,
    totalRequestsCount,
    rawText,
    timestamp: new Date(),
  };
}
