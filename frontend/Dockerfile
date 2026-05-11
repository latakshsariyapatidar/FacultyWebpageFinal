# Frontend Dockerfile - Build React App
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Production stage - serve with nginx
FROM node:18-alpine

WORKDIR /app

# Copy built app from builder
COPY --from=builder /app/build ./build

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy source (for any non-build assets)
COPY public ./public
COPY src ./src
COPY postcss.config.js tailwind.config.js ./

EXPOSE 3000

# Start the app (adjust based on your frontend server setup)
CMD ["npm", "start"]
