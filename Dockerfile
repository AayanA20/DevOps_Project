# syntax=docker/dockerfile:1

# ==========================================
# Stage 1: Build the React frontend with Vite
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ==========================================
# Stage 2: Install Backend Dependencies
# ==========================================
FROM node:20-alpine AS backend-deps
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev

# ==========================================
# Stage 3: Unified Production Runtime Container
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=5000

# Install curl for container health checks
RUN apk --no-cache add curl

# Copy backend dependencies and source code
COPY --from=backend-deps /app/backend/node_modules ./backend/node_modules
COPY backend/package*.json ./backend/
COPY backend/ ./backend/

# Copy compiled frontend distribution into place
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Security: Non-root execution
RUN chown -R node:node /usr/src/app
USER node

# Expose unified application port (UI + REST API)
EXPOSE 5000

# Container health probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

WORKDIR /usr/src/app/backend
CMD ["node", "server.js"]
