import type { HealthStatus, LatencyResponse, ServiceStatus } from "src/types/monitor";


const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const fetchHealth = async (): Promise<HealthStatus> => {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
};

export const fetchStatus = async (): Promise<ServiceStatus> => {
  const res = await fetch(`${API_BASE}/api/v1/status`);
  return res.json();
};

export const simulateError = async (): Promise<void> => {
  await fetch(`${API_BASE}/api/v1/simulate/error`, { method: 'POST' });
};

export const simulateLatency = async (delay: number): Promise<LatencyResponse> => {
  const res = await fetch(`${API_BASE}/api/v1/simulate/latency?delay=${delay}`);
  return res.json();
};

export const toggleHealth = async (status: boolean): Promise<{ is_healthy: boolean }> => {
  const res = await fetch(`${API_BASE}/api/v1/simulate/health-toggle?status=${status}`, {
    method: 'POST',
  });
  return res.json();
};