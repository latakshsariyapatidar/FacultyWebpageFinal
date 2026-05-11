# ============================================
# Backend API - Dockerfile
# Node.js Express server for Faculty API
# ============================================

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency files first (for Docker layer caching)
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Create data directories (for faculty JSON storage)
RUN mkdir -p data/faculty

# Expose the API port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

# Start the server
CMD ["node", "server.js"]
