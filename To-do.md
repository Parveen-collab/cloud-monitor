

Now that you've initialized your **Vite + React + TypeScript** project, here is a clear step-by-step roadmap to build the **Cloud Monitor** dashboard and connect it to your FastAPI backend and observability stack.

---

### Step 1: Install Key Dependencies

In your frontend project directory, install a few recommended packages for icons and charts:

```bash
# Icons for cloud/server status & controls
npm install lucide-react

# (Optional) Charts for metrics and latency visualization
npm install recharts
```

---

### Step 2: Configure Environment Variables & Vite Proxy

Your FastAPI backend runs on `http://localhost:8000`. To easily connect to it and avoid any port mismatches, set up your configuration:

1. Create a `.env` file in the root of your frontend project:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

2. *(Alternative & Recommended)* Configure a proxy in [vite.config.ts](file:///c:/Users/Parveen%20kumar/MiniProject/cloud_monitor/backend/app/main.py):
   ```typescript
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';

   export default defineConfig({
     plugins: [react()],
     server: {
       port: 5173,
       proxy: {
         '/api': 'http://localhost:8000',
         '/health': 'http://localhost:8000',
         '/metrics': 'http://localhost:8000',
       },
     },
   });
   ```

---

### Step 3: Define TypeScript Types

Create a `src/types/monitor.ts` file to match the backend responses from [main.py](file:///c:/Users/Parveen%20kumar/MiniProject/cloud_monitor/backend/app/main.py) and [health.py](file:///c:/Users/Parveen%20kumar/MiniProject/cloud_monitor/backend/app/health.py):

```typescript
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
```

---

### Step 4: Create an API Service

Create `src/services/api.ts` to manage all calls to the backend:

```typescript
import { HealthStatus, ServiceStatus, LatencyResponse } from '../types/monitor';

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
```

---

### Step 5: Dashboard Components to Build

Here is the recommended layout structure for your UI:

```
src/
├── components/
│   ├── Header.tsx           # App title, live uptime, environment badge, quick links
│   ├── HealthCard.tsx       # Live status (Healthy/Degraded), component status badges
│   ├── ChaosConsole.tsx     # SRE Fault Injection (Latency slider, Error 500 trigger, Health switch)
│   ├── StackLinks.tsx       # Quick launch buttons to Prometheus (:9090), Grafana (:3000), Alertmanager (:9093)
│   └── MetricsViewer.tsx    # Raw or parsed metrics from /metrics
├── services/
│   └── api.ts
├── types/
│   └── monitor.ts
└── App.tsx
```

#### Key Features to Implement:
1. **Live Health Polling**: Use `useEffect` with `setInterval` (e.g., every 3–5 seconds) to fetch `/health` and display real-time uptime and component health badges (`api`, `metrics_exporter`, `engine`).
2. **SRE / Chaos Injection Console**:
   - **Simulate 500 Error button**: Click to send `POST /api/v1/simulate/error`, display toast notification of 500 response, and verify metrics.
   - **Simulate Latency slider**: Choose delay (0.5s to 5.0s), hit `GET /api/v1/simulate/latency`, and measure round-trip time.
   - **Health Toggle switch**: Flip to `false` to mark the system degraded, and watch the dashboard turn yellow/red.
3. **Observability Navigation**: Direct buttons pointing to:
   - **Swagger Docs**: `http://localhost:8000/docs`
   - **Prometheus UI**: `http://localhost:9090`
   - **Grafana**: `http://localhost:3000`
   - **Alertmanager**: `http://localhost:9093`

---

### Step 6: Test It with the Backend

1. **Start your backend** (either via Docker or uvicorn):
   ```bash
   uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
2. **Start your Vite dev server**:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` to see your live frontend interacting with the backend.

---

### Step 7: (Optional) Dockerize the Frontend

Notice in the root [docker-compose.yml](file:///c:/Users/Parveen%20kumar/MiniProject/cloud_monitor/docker-compose.yml#L133-L147), there is already a `frontend` service entry configured:
```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
```

---

Would you like help writing any specific component (like the **SRE Chaos Console** or the **Health Card** with styling), or setting up the layout?