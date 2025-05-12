# Stage 1: Build the React application
FROM node:20-alpine AS builder

# Accept WebSocket URL as a build argument
ARG VITE_WS_URL
ENV VITE_WS_URL=${VITE_WS_URL}

WORKDIR /app

# Copy root package files first for workspace dependency installation
COPY ./package.json ./package-lock.json* ./
# Install dependencies from the monorepo root
RUN npm ci --ignore-scripts

# Copy frontend package files (paths relative to root context)
COPY ./packages/frontend/package.json ./packages/frontend/package-lock.json* ./packages/frontend/
COPY ./packages/frontend/tsconfig.json ./packages/frontend/
COPY ./packages/frontend/tsconfig.node.json ./packages/frontend/
COPY ./packages/frontend/tsconfig.app.json ./packages/frontend/
COPY ./packages/frontend/vite.config.ts ./packages/frontend/
COPY ./packages/frontend/index.html ./packages/frontend/

# Copy frontend source code (paths relative to root context)
COPY ./packages/frontend/public ./packages/frontend/public
COPY ./packages/frontend/src ./packages/frontend/src

# Set working directory to the frontend package
WORKDIR /app/packages/frontend

# Install frontend-specific dependencies (including devDependencies needed for build)
RUN npm install

# Build the frontend application
# Vite automatically uses environment variables starting with VITE_
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:stable-alpine

# Copy the built static files from the builder stage
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

# Optional: Copy a custom Nginx configuration if needed (e.g., for SPA routing)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"] 