# CloudMonitor Frontend

A modern React dashboard built with TypeScript, Vite, and Lucide Icons to visualize cloud infrastructure health, metrics, and backend telemetry.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js**: v20.19+, v22.13+, or >=23
- **npm**: v10+

### Installation & Run
```bash
# Install dependencies
npm install

# Run local development server (http://localhost:5173)
npm run dev

# Run TypeScript check & production build
npm run build
```

---

## 🐳 Docker Deployment

The project includes an optimized multi-stage `Dockerfile`:
- **Stage 1 (Builder)**: Uses `node:22-alpine` to compile TypeScript and bundle assets with Vite.
- **Stage 2 (Production)**: Uses `nginx:1.27-alpine` to serve static assets with SPA routing, gzip compression, and caching.

### 1. Build the Docker Image
```bash
# Navigate to the frontend directory
cd cloudmonitor-frontend

# Build image
docker build -t cloudmonitor-frontend:latest .

# (Optional) Build with custom API URL
docker build --build-arg VITE_API_BASE_URL=http://your-backend-host:8000 -t cloudmonitor-frontend:latest .
```

### 2. Run the Container
```bash
docker run -d \
  --name cloudmonitor-frontend \
  -p 5173:80 \
  cloudmonitor-frontend:latest
```
Access the dashboard in your browser at: **[http://localhost:5173](http://localhost:5173)**.

### 3. Using Docker Compose
```bash
docker compose up -d --build
```

### Useful Docker Management Commands
```bash
# View logs
docker logs -f cloudmonitor-frontend

# Stop the container
docker stop cloudmonitor-frontend

# Start the container
docker start cloudmonitor-frontend

# Remove the container
docker rm -f cloudmonitor-frontend
```

---

## ⚙️ Environment Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend API base URL for metrics and health checks |

---

## 📁 Project Structure

```
cloudmonitor-frontend/
├── Dockerfile             # Multi-stage production Docker build
├── nginx.conf             # Custom Nginx configuration (SPA routing & gzip)
├── .dockerignore          # Excluded files for clean Docker builds
├── docker-compose.yml     # Docker Compose definition
├── src/
│   ├── components/        # React UI components (Dashboard, Cards, Metrics)
│   ├── services/          # API services communicating with backend
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Helper utilities & metric parsers
├── public/                # Static public assets & icons
└── vite.config.ts         # Vite bundler configuration
```

