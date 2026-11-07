# syntax=docker/dockerfile:1

# Stage 1: Build the Vite production bundle
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code and config files
COPY . .

# Build argument for API base URL
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Build production assets into dist/
RUN npm run build

# Stage 2: Serve production bundle with Nginx Alpine
FROM nginx:alpine AS runner

# Remove default Nginx configuration
RUN rm -rf /etc/nginx/conf.d/*

# Copy custom Nginx configuration with reverse proxy and SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
