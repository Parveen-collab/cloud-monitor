# ==============================================================================
# Multi-stage Dockerfile for CloudMonitor React Frontend
# Stage 1: Build the React application with Vite
# Stage 2: Serve production assets with high-performance Nginx
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Builder
# ------------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies using clean install for predictable, repeatable builds
COPY package.json package-lock.json ./
RUN npm ci

# Allow passing backend API URL during build time, defaulting to localhost:8000
ARG VITE_API_BASE_URL=http://localhost:8000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy application source code
COPY . .

# Build production bundle into /app/dist
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Server
# ------------------------------------------------------------------------------
FROM nginx:1.27-alpine AS production

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built static files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with SPA routing and caching
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Health check against nginx /healthz endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/healthz || exit 1

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]

