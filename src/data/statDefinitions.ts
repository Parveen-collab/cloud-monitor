export interface StatThreshold {
  level: 'healthy' | 'warning' | 'critical';
  range: string;
  description: string;
}

export interface StatDefinition {
  id: string;
  title: string;
  prometheusKey: string;
  metricType: 'Gauge' | 'Counter' | 'Histogram' | 'Health State' | 'System Info';
  category: 'Availability' | 'Traffic' | 'Saturation' | 'Latency' | 'System Resources' | 'Runtime';
  shortDescription: string;
  detailedMeaning: string;
  healthSignificance: string;
  goldenSignal: 'Latency' | 'Traffic' | 'Errors' | 'Saturation' | 'Availability';
  thresholds: StatThreshold[];
  remediationSteps: string[];
  samplePromQL: string;
  updateInterval: string;
}

export const STAT_DEFINITIONS: Record<string, StatDefinition> = {
  health: {
    id: 'health',
    title: 'System Health Status',
    prometheusKey: 'cloudmonitor_app_health_status / GET /health',
    metricType: 'Health State',
    category: 'Availability',
    goldenSignal: 'Availability',
    shortDescription: 'Composite health indicator representing overall application readiness to serve traffic.',
    detailedMeaning:
      'Aggregates the operational condition of internal backend subsystems (API Router, Prometheus Exporter, and Worker Engine). A value of 1 (healthy) indicates all submodules are operational; 0 indicates degraded or failing services.',
    healthSignificance:
      'Cloud load balancers (AWS ALB, Nginx, Kubernetes liveness/readiness probes) query this stat to decide whether to route user traffic to this container. An unhealthy status immediately signals an outage or failed sub-service.',
    thresholds: [
      { level: 'healthy', range: 'Status = "healthy" (Gauge = 1)', description: 'All core subsystems and endpoints are operational.' },
      { level: 'warning', range: 'Status = "degraded"', description: 'Secondary dependencies or background tasks are stalled, but API is serving.' },
      { level: 'critical', range: 'Status = "unhealthy" (Gauge = 0)', description: 'Application cannot process requests. Traffic must be rerouted immediately.' },
    ],
    remediationSteps: [
      'Inspect application logs via `docker logs -f cloudmonitor-backend`.',
      'Check database connectivity to PostgreSQL and verify connection pool status.',
      'Verify if simulated health toggle was activated in development mode.',
      'Check host resource exhaustion (RAM, CPU, disk space).',
      'Restart the container instance if sub-processes have crashed.',
    ],
    samplePromQL: 'cloudmonitor_app_health_status == 1',
    updateInterval: 'Scraped every 3 seconds',
  },

  uptime: {
    id: 'uptime',
    title: 'Live Process Uptime',
    prometheusKey: 'uptime_seconds / process_start_time_seconds',
    metricType: 'Gauge',
    category: 'Availability',
    goldenSignal: 'Availability',
    shortDescription: 'Continuous elapsed time since the backend process was initialized.',
    detailedMeaning:
      'Calculated as the difference between current wall-clock time and the process initialization timestamp. Reflects the stability and continuous runtime of the server without restarts.',
    healthSignificance:
      'Detects silent crash loops (CrashLoopBackOff), uncaught fatal exceptions, kernel Out-Of-Memory (OOM) killer terminations, or unannounced redeployments. An uptime that keeps resetting indicates severe instability.',
    thresholds: [
      { level: 'healthy', range: '> 24 hours without reset', description: 'Process is stable, leak-free, and running continuously.' },
      { level: 'warning', range: '< 15 minutes after deployment', description: 'Freshly deployed or recently restarted; wait for baseline metrics to stabilize.' },
      { level: 'critical', range: 'Repeatedly resetting to 0s', description: 'Application is crash-looping due to uncaught errors, segfaults, or OOM kills.' },
    ],
    remediationSteps: [
      'Check exit code of the Docker container (`docker inspect -f "{{.State.ExitCode}}"`). Exit code 137 signals an OOM kill.',
      'Review startup errors and dependency initialization in logs.',
      'Verify database migration status on startup (`alembic upgrade head`).',
      'Check if healthcheck timeout is aggressively killing the container.',
    ],
    samplePromQL: 'time() - process_start_time_seconds',
    updateInterval: 'Real-time telemetry / updated on each poll',
  },

  totalRequests: {
    id: 'totalRequests',
    title: 'Total HTTP Requests',
    prometheusKey: 'cloudmonitor_http_requests_total',
    metricType: 'Counter',
    category: 'Traffic',
    goldenSignal: 'Traffic',
    shortDescription: 'Monotonically increasing count of all processed HTTP requests by method, route, and status code.',
    detailedMeaning:
      'Measures the aggregate volume of traffic entering the backend API. Partitioned across HTTP methods (GET, POST), route paths (/health, /api/v1/..., etc.), and HTTP status codes (200, 4xx, 500).',
    healthSignificance:
      'Represents demand on the system (Traffic — one of the 4 Google SRE Golden Signals). Used to calculate request rate (requests/sec) and error rate. A sudden traffic cliff indicates DNS or ingress failure; a sudden surge indicates traffic spikes or DDoS.',
    thresholds: [
      { level: 'healthy', range: 'Predictable rate matching normal user curve', description: 'Traffic reflects expected user workload.' },
      { level: 'warning', range: '3x-5x sudden surge or 50% sudden drop', description: 'Potential viral traffic, scraping, or upstream network disruption.' },
      { level: 'critical', range: '10x traffic spike or complete traffic drop to 0 req/s', description: 'Possible DDoS attack or edge gateway outage preventing traffic ingress.' },
    ],
    remediationSteps: [
      'Compute error rate using `rate(cloudmonitor_http_requests_total{status_code=~"5.."}[5m]) / rate(cloudmonitor_http_requests_total[5m])`.',
      'If traffic dropped to zero, verify Nginx reverse proxy, DNS records, and AWS Security Group inbound rules.',
      'If traffic spiked abnormally, inspect IP access logs for automated bot scraping or DDoS and enable rate limiting.',
    ],
    samplePromQL: 'sum(rate(cloudmonitor_http_requests_total[5m]))',
    updateInterval: 'Incremented on every request completion',
  },

  activeRequests: {
    id: 'activeRequests',
    title: 'Active / In-Flight Requests',
    prometheusKey: 'cloudmonitor_active_requests',
    metricType: 'Gauge',
    category: 'Saturation',
    goldenSignal: 'Saturation',
    shortDescription: 'Number of HTTP requests currently being computed by the backend right now.',
    detailedMeaning:
      'A real-time gauge tracking concurrent request processing inside the FastAPI asynchronous event loop and worker thread pool. Incremented when a request arrives and decremented when response transmission finishes.',
    healthSignificance:
      'Indicates system saturation and queue pile-up. When backend services stall (due to slow database queries, deadlock, or downstream timeouts), in-flight requests accumulate rapidly, eventually leading to socket pool exhaustion and 504 Gateway Timeouts.',
    thresholds: [
      { level: 'healthy', range: '0 to 5 concurrent requests', description: 'Fast processing; event loop is responsive with near-zero queueing.' },
      { level: 'warning', range: '10 to 30 concurrent requests', description: 'Elevated concurrency; thread pool is busy; response times may climb.' },
      { level: 'critical', range: '> 50 concurrent requests sustained', description: 'Server saturation; requests are piling up faster than they can be cleared.' },
    ],
    remediationSteps: [
      'Check for slow database queries holding connections open (`pg_stat_activity` in PostgreSQL).',
      'Verify if synchronous blocking I/O calls are executing inside async FastAPI route handlers.',
      'Check if simulated latency test (`/api/v1/simulate/latency`) is actively holding connections open.',
      'Scale out backend replicas or increase Uvicorn worker count.',
    ],
    samplePromQL: 'cloudmonitor_active_requests',
    updateInterval: 'Instantaneous gauge snapshot',
  },

  latency: {
    id: 'latency',
    title: 'Average Request Latency',
    prometheusKey: 'cloudmonitor_http_request_duration_seconds',
    metricType: 'Histogram',
    category: 'Latency',
    goldenSignal: 'Latency',
    shortDescription: 'Average round-trip response duration per endpoint and method in milliseconds.',
    detailedMeaning:
      'Calculated from Prometheus histogram sum and count: (duration_sum / duration_count). Measures the elapsed time from request receipt by the middleware until the final response byte is returned.',
    healthSignificance:
      'Latency directly determines user experience (UX) and Service Level Objectives (SLOs). Slow endpoints cause user abandonment and tie up backend workers, turning small delays into full system outages.',
    thresholds: [
      { level: 'healthy', range: '< 50 ms average', description: 'Blazing fast responses; database indexes and caches are performing well.' },
      { level: 'warning', range: '50 ms – 250 ms average', description: 'Acceptable for complex endpoints, but warrants profiling if climbing.' },
      { level: 'critical', range: '> 500 ms average', description: 'Severely degraded performance; violates typical p99 SLOs; high risk of timeouts.' },
    ],
    remediationSteps: [
      'Identify specific slow endpoints from the Endpoint Latency table below.',
      'Check database query execution plans (`EXPLAIN ANALYZE`) for missing indexes.',
      'Implement Redis caching for frequently queried, read-heavy endpoints.',
      'Ensure external network calls to third-party APIs have strict timeouts configured.',
    ],
    samplePromQL: 'rate(cloudmonitor_http_request_duration_seconds_sum[5m]) / rate(cloudmonitor_http_request_duration_seconds_count[5m])',
    updateInterval: 'Measured per request; bucketed in histogram',
  },

  residentMemory: {
    id: 'residentMemory',
    title: 'Resident Memory (RSS)',
    prometheusKey: 'process_resident_memory_bytes',
    metricType: 'Gauge',
    category: 'System Resources',
    goldenSignal: 'Saturation',
    shortDescription: 'Physical RAM held in memory pages by the Python process.',
    detailedMeaning:
      'Resident Set Size (RSS) is the portion of RAM occupied by a process that is held in actual main memory, excluding swapped-out pages. Unlike Virtual Memory, RSS represents actual physical memory pressure on the host.',
    healthSignificance:
      'Memory leaks are one of the most common causes of backend downtime. If RSS steadily climbs over days without leveling off, the application will eventually trigger an Out-Of-Memory (OOM) kill by the Linux kernel, abruptly terminating the container.',
    thresholds: [
      { level: 'healthy', range: '< 200 MB (stable plateau)', description: 'Normal Python runtime footprint; garbage collection is effective.' },
      { level: 'warning', range: '200 MB – 500 MB', description: 'High memory usage; acceptable under peak load, monitor for steady climb.' },
      { level: 'critical', range: '> 80% of Docker container RAM limit', description: 'Imminent danger of kernel OOM-kill (exit code 137).' },
    ],
    remediationSteps: [
      'Monitor memory graph over time; a monotonic linear climb signals a memory leak.',
      'Inspect large in-memory caches, unclosed file objects, or global list accumulators.',
      'Profile memory allocations using Python `tracemalloc` or `memory_profiler`.',
      'Increase Docker container memory limit in `docker-compose.yml` (`mem_limit`).',
    ],
    samplePromQL: 'process_resident_memory_bytes / 1024 / 1024',
    updateInterval: 'Scraped by Prometheus on each interval',
  },

  cpuSeconds: {
    id: 'cpuSeconds',
    title: 'Process CPU Time',
    prometheusKey: 'process_cpu_seconds_total',
    metricType: 'Counter',
    category: 'System Resources',
    goldenSignal: 'Saturation',
    shortDescription: 'Total CPU time (user + system) spent by the backend process since startup.',
    detailedMeaning:
      'Cumulative number of seconds the Python runtime has executed instructions on the CPU (both user code and kernel system calls). By taking the rate of this counter over time (`rate()`), SREs measure current CPU utilization percentage.',
    healthSignificance:
      'High CPU utilization leads to request throttling under Docker cgroups and severe latency degradation. Uncontrolled CPU spikes often indicate algorithmic bottlenecks, infinite loops, regex backtracking, or inefficient JSON serialization.',
    thresholds: [
      { level: 'healthy', range: 'CPU utilization < 60% of 1 core', description: 'Normal compute load with abundant CPU headroom for spikes.' },
      { level: 'warning', range: 'CPU utilization 60% – 85%', description: 'Compute-heavy workload; monitor closely during traffic spikes.' },
      { level: 'critical', range: 'CPU utilization > 90% sustained', description: 'Severe CPU starvation; event loop stalls; response times will spike exponentially.' },
    ],
    remediationSteps: [
      'Calculate current CPU usage via `rate(process_cpu_seconds_total[1m]) * 100`.',
      'Use a Python sampling profiler (e.g. `py-spy`) to find CPU-intensive hot loops.',
      'Offload heavy computation (data compression, image processing) to background Celery workers.',
      'Scale CPU resource limits in Docker Compose (`cpus: "2.0"`).',
    ],
    samplePromQL: 'rate(process_cpu_seconds_total[1m]) * 100',
    updateInterval: 'Cumulative counter updated continuously',
  },

  fileDescriptors: {
    id: 'fileDescriptors',
    title: 'OS File Descriptors',
    prometheusKey: 'process_open_fds / process_max_fds',
    metricType: 'Gauge',
    category: 'System Resources',
    goldenSignal: 'Saturation',
    shortDescription: 'Number of active file handles, network sockets, and database connections.',
    detailedMeaning:
      'In Linux/Unix systems, "everything is a file" — every incoming HTTP connection, outgoing database socket, open log file, and pipe consumes one File Descriptor (FD). `process_open_fds` tracks current active FDs, while `process_max_fds` is the kernel limit.',
    healthSignificance:
      'Socket and FD leaks occur when network connections or file streams are opened but never closed. Once `open_fds` hits `max_fds`, the OS rejects any new connection with `OSError: [Errno 24] Too many open files`, completely freezing the API.',
    thresholds: [
      { level: 'healthy', range: '< 5% of maximum limit (< 100 FDs)', description: 'Abundant file descriptor capacity; connections properly closed.' },
      { level: 'warning', range: '50% – 75% of maximum limit', description: 'Unusually high open handles; investigate connection pools.' },
      { level: 'critical', range: '> 85% of maximum limit', description: 'Imminent socket exhaustion; API will soon reject all incoming connections.' },
    ],
    remediationSteps: [
      'Check for unclosed HTTP client connections or missing `with` context managers in Python.',
      'Verify PostgreSQL connection pool settings (`max_overflow`, `pool_size`).',
      'Increase OS limit in Docker configuration (`ulimits: nofile: 65536`).',
      'Inspect open descriptors on Linux via `lsof -p <PID>` to see what files/sockets are open.',
    ],
    samplePromQL: '(process_open_fds / process_max_fds) * 100',
    updateInterval: 'Scraped by Prometheus on each interval',
  },

  simulatedErrors: {
    id: 'simulatedErrors',
    title: 'Simulated 500 Server Errors',
    prometheusKey: 'cloudmonitor_simulated_errors_total',
    metricType: 'Counter',
    category: 'Traffic',
    goldenSignal: 'Errors',
    shortDescription: 'Counter of deliberate fault-injection 500 errors triggered for SRE alert testing.',
    detailedMeaning:
      'Increments every time an engineer triggers the `/api/v1/simulate/error` endpoint. Allows testing alerting rules, log forwarding, and error rate monitoring in non-production environments without breaking actual services.',
    healthSignificance:
      'Chaos Engineering & Alert Verification: Essential for proving that automated alerts (Slack notifications, PagerDuty, Alertmanager) fire reliably before real production bugs occur.',
    thresholds: [
      { level: 'healthy', range: '0 in production; controlled counts in dev', description: 'No active fault injection running in production.' },
      { level: 'warning', range: '> 0 in non-dev environment', description: 'Simulated errors should only be executed in development/test.' },
      { level: 'critical', range: 'Alert not firing when simulated errors are triggered', description: 'Monitoring configuration failure: alerting rules are not catching errors.' },
    ],
    remediationSteps: [
      'Verify that `Alertmanager` receives the alert when errors are injected.',
      'Check Prometheus alert rules for `HighErrorRateAlert` in `monitoring/prometheus/alert.rules.yml`.',
      'Ensure the simulation endpoint is locked down in production (`ENVIRONMENT=production`).',
    ],
    samplePromQL: 'rate(cloudmonitor_simulated_errors_total[5m])',
    updateInterval: 'Increments on each simulation trigger',
  },

  gcCollections: {
    id: 'gcCollections',
    title: 'Python Garbage Collection',
    prometheusKey: 'python_gc_collections_total',
    metricType: 'Counter',
    category: 'Runtime',
    goldenSignal: 'Saturation',
    shortDescription: 'CPython generational garbage collection runs (Gen 0, Gen 1, Gen 2).',
    detailedMeaning:
      'Tracks CPython GC cycles across 3 generations. Gen 0 handles short-lived objects; Gen 1 handles medium-lived objects; Gen 2 handles long-lived surviving objects. Gen 2 collections perform a full heap sweep ("Stop-the-World").',
    healthSignificance:
      'Frequent Gen 2 collections freeze the Python interpreter, introducing intermittent latency spikes ("micro-stalls"). Monitoring GC helps detect cyclic references and object allocation thrashing.',
    thresholds: [
      { level: 'healthy', range: 'High Gen 0, moderate Gen 1, very low Gen 2', description: 'Optimal generational allocation pattern.' },
      { level: 'warning', range: 'Rapidly increasing Gen 2 collections', description: 'Long-lived objects accumulating; potential cyclic references.' },
      { level: 'critical', range: 'Frequent Gen 2 spikes coinciding with latency spikes', description: 'GC pauses causing noticeable request delays.' },
    ],
    remediationSteps: [
      'Check for cyclic references using Python `gc.get_objects()` and `gc.set_debug(gc.DEBUG_UNCOLLECTABLE)`.',
      'Tune GC thresholds via `gc.set_threshold()`.',
      'Avoid large in-memory data structures that outlive individual requests.',
    ],
    samplePromQL: 'rate(python_gc_collections_total{generation="2"}[5m])',
    updateInterval: 'Scraped from Python runtime',
  },
};

