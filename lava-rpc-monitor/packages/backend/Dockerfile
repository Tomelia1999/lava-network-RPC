# Build stage for backend
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root package files and install dependencies
COPY ./package.json ./package-lock.json* ./
RUN npm ci --ignore-scripts

# Copy backend specific files
COPY ./packages/backend/package.json ./packages/backend/
COPY ./packages/backend/src ./packages/backend/src
COPY ./packages/backend/tsconfig.json ./packages/backend/

WORKDIR /app/packages/backend
# Install backend-specific dependencies (including devDependencies needed for build)
RUN npm install

# Build the backend TypeScript code
RUN npm run build

# Production stage for backend
FROM node:20-alpine AS production
WORKDIR /app

# Add netcat for healthcheck
RUN apk update && apk add --no-cache netcat-openbsd

# Copy necessary files from builder stage
COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=builder /app/packages/backend/package.json ./
# Copy only necessary production node_modules from the root installation in builder
# We need the root node_modules because workspace dependencies might be hoisted there
COPY --from=builder /app/node_modules ./node_modules
# Install production dependencies only for the backend package within the production stage
# This ensures we only have production dependencies in the final image
RUN npm install --omit=dev --ignore-scripts

# Expose the WebSocket port defined in docker-compose.yml (or default)
EXPOSE ${WEBSOCKET_PORT:-8080}

# Start the backend service
CMD ["node", "dist/index.js"] 