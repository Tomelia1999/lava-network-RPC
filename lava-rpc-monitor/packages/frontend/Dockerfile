FROM node:20-alpine AS builder

ARG VITE_WS_URL
ENV VITE_WS_URL=${VITE_WS_URL}

WORKDIR /app

COPY ./package.json ./package-lock.json* ./
RUN npm ci --ignore-scripts

COPY ./packages/frontend/package.json ./packages/frontend/package-lock.json* ./packages/frontend/
COPY ./packages/frontend/tsconfig.json ./packages/frontend/
COPY ./packages/frontend/tsconfig.node.json ./packages/frontend/
COPY ./packages/frontend/tsconfig.app.json ./packages/frontend/
COPY ./packages/frontend/vite.config.ts ./packages/frontend/
COPY ./packages/frontend/index.html ./packages/frontend/

COPY ./packages/frontend/public ./packages/frontend/public
COPY ./packages/frontend/src ./packages/frontend/src

WORKDIR /app/packages/frontend

RUN npm install

RUN npm run build

FROM nginx:stable-alpine

COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 