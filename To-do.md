

Now that you've initialized your **Vite + React + TypeScript** project, here is a clear step-by-step roadmap to build the **Cloud Monitor** dashboard and connect it to your FastAPI backend and observability stack.

---

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