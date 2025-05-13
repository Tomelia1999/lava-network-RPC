FROM node:20-alpine AS builder
WORKDIR /app

COPY ./package.json ./package-lock.json* ./
RUN npm ci --ignore-scripts

COPY ./packages/backend/package.json ./packages/backend/
COPY ./packages/backend/src ./packages/backend/src
COPY ./packages/backend/tsconfig.json ./packages/backend/

WORKDIR /app/packages/backend
RUN npm install

RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app

RUN apk update && apk add --no-cache netcat-openbsd

COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=builder /app/packages/backend/package.json ./

COPY --from=builder /app/node_modules ./node_modules

RUN npm install --omit=dev --ignore-scripts

EXPOSE ${WEBSOCKET_PORT:-8080}

CMD ["node", "dist/index.js"] 