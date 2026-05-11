# ============================================
# Frontend - Multi-stage Dockerfile
# Stage 1: Build React app
# Stage 2: Serve with nginx + reverse proxy
# ============================================

# ---------- Stage 1: Build ----------
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency files first (layer caching)
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY . .

# Set build-time environment variables
ENV REACT_APP_API_URL=/api
ENV REACT_APP_API_TIMEOUT=10000
ENV REACT_APP_NAME="Faculty Webpage"

# Build the production bundle
RUN npm run build

# ---------- Stage 2: Serve ----------
FROM nginx:1.27-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config (includes reverse proxy rules)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built React app from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
