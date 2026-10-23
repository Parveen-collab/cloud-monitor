
/**
 * Import the TypeScript types used to define the expected
 * structure of API responses.
 */
import type {
  HealthStatus,
  LatencyResponse,
  ParsedPrometheusMetrics,
  ProjectInfo,
  ServiceStatus,
} from "src/types/monitor";
import { parsePrometheusText } from "src/utils/metricsParser";

/**
 * Base URL of the backend API.
 *
 * VITE_API_BASE_URL is read from the .env file.
 * If it is not configured, the application uses localhost:8000.
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Fetch the overall health of the backend application.
 *
 * Sends a GET request to /health and returns the health information
 * in the format defined by the HealthStatus type.
 */
export const fetchHealth = async (): Promise<HealthStatus> => {
  const res = await fetch(`${API_BASE}/health`);

  // Convert the JSON response into a JavaScript object.
  return res.json();
};


/**
 * Fetch the current service status summary.
 */
export const fetchStatus = async (): Promise<ServiceStatus> => {
  const res = await fetch(`${API_BASE}/api/v1/status`);

  if (!res.ok) {
    throw new Error(
      `Failed to fetch service status (status ${res.status})`
    );
  }

  return res.json() as Promise<ServiceStatus>;
};


/**
 * Simulate an HTTP 500 error using the backend fault-injection endpoint.
 *
 * Sends a POST request to trigger the simulated error.
 * This function does not return response data.
 */

/**
 * Trigger the backend's simulated HTTP 500 error.
 *
 * HTTP 500 is expected for this test endpoint, so the response
 * is parsed and returned instead of treating it as a fetch failure.
 */
export const simulateError = async (): Promise<{
  status: number;
  detail: string;
}> => {
  const res = await fetch(`${API_BASE}/api/v1/simulate/error`, {
    method: "POST",
  });

  const data = (await res.json()) as { detail?: string };

  if (res.status !== 500) {
    throw new Error(
      data.detail ??
      `Expected simulated HTTP 500, but received ${res.status}`
    );
  }

  return {
    status: res.status,
    detail: data.detail ?? "Simulated server error triggered.",
  };
};



/**
 * Simulate API latency for SLO and alert testing.
 *
 * @param delay - Requested delay in seconds (0–10).
 */
export const simulateLatency = async (
  delay: number
): Promise<LatencyResponse> => {
  if (!Number.isFinite(delay) || delay < 0 || delay > 10) {
    throw new Error("Delay must be between 0 and 10 seconds.");
  }

  const res = await fetch(
    `${API_BASE}/api/v1/simulate/latency?delay=${encodeURIComponent(delay)}`
  );

  if (!res.ok) {
    throw new Error(
      `Failed to simulate latency (status ${res.status})`
    );
  }

  return res.json() as Promise<LatencyResponse>;
};



/**
 * Update the application's simulated health status.
 *
 * @param status - true for healthy, false for unhealthy.
 */
export const toggleHealth = async (
  status: boolean
): Promise<{ status: string; is_healthy: boolean }> => {
  const res = await fetch(
    `${API_BASE}/api/v1/simulate/health-toggle?status=${status}`,
    {
      method: "POST",
    }
  );

  if (!res.ok) {
    throw new Error(
      `Failed to update health status (HTTP ${res.status})`
    );
  }

  return res.json();
};


/**
 * Fetch raw Prometheus exposition text from the backend /metrics endpoint.
 */
export const fetchRawMetrics = async (): Promise<string> => {
  const res = await fetch(`${API_BASE}/metrics`, {
    headers: {
      Accept: "text/plain, */*",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch /metrics (status ${res.status})`);
  }

  return res.text();
};

/**
 * Fetch and parse Prometheus metrics into structured telemetry objects.
 */
export const fetchParsedMetrics = async (): Promise<ParsedPrometheusMetrics> => {
  const text = await fetchRawMetrics();
  return parsePrometheusText(text);
};



/**
 * Fetch general project information from the backend root endpoint.
 *
 * Sends a GET request to / and returns project metadata,
 * including the project name, version, and endpoint paths.
 */
export const fetchProjectInfo = async (): Promise<ProjectInfo> => {
  const res = await fetch(`${API_BASE}/`);

  if (!res.ok) {
    throw new Error(
      `Failed to fetch project information (status ${res.status})`
    );
  }

  return res.json() as Promise<ProjectInfo>;
};