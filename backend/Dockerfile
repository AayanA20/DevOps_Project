# syntax=docker/dockerfile:1
FROM node:20-alpine AS production

# Set working directory
WORKDIR /usr/src/app

# Set production environment
ENV NODE_ENV=production

# Install curl/wget for healthchecks
RUN apk --no-cache add curl

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy application source code
COPY --chown=node:node . .

# Switch to non-root user for security best practices
USER node

# Expose backend REST port
EXPOSE 5000

# Container healthcheck using native health route
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start production server
CMD ["node", "server.js"]
